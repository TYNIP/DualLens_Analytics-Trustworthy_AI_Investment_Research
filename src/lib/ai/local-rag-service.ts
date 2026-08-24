import { LOCAL_GENERATION_MODEL } from "@/lib/ai/local-model-config";
import type { LocalLanguageModel } from "@/lib/ai/language-model";
import { LOCAL_RAG_PROMPT, assembleLocalRagPrompt, referencedSourceRanks } from "@/lib/ai/prompts";
import type { LocalRetrievalService } from "@/lib/retrieval/local-retrieval-service";
import { CompanyRepository } from "@/lib/storage/repositories/companies";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import { EvaluationRepository } from "@/lib/storage/repositories/evaluations";
import { ResearchRepository } from "@/lib/storage/repositories/research";
import { createId } from "@/lib/utils/id";
import type { Citation, EvaluationResult, ModelMetadata, ResearchRun } from "@/types/domain";

export class LocalRagService {
  public constructor(
    private readonly retrieval: LocalRetrievalService,
    private readonly model: LocalLanguageModel,
    private readonly companies = new CompanyRepository(),
    private readonly documents = new DocumentRepository(),
    private readonly research = new ResearchRepository(),
    private readonly evaluations = new EvaluationRepository(),
  ) {}

  public async ask(
    question: string,
    companyId: string,
    topK = 4,
    documentIds?: string[],
  ): Promise<ResearchRun> {
    const company = await this.companies.get(companyId);
    if (!company) throw new Error("Select an existing local company.");
    const retrieval = await this.retrieval.search(question, companyId, topK, documentIds);
    const documentRecords = await this.documents.listByCompany(companyId);
    const documentMap = new Map(documentRecords.map((document) => [document.id, document]));
    let answer = "I don't know.";
    let generationLatencyMs: number | undefined;
    let model: ModelMetadata = {
      provider: "local-webllm" as const,
      modelId: LOCAL_GENERATION_MODEL.id,
      executionDevice: "WebGPU",
    };

    if (retrieval.sufficient) {
      const prompt = assembleLocalRagPrompt(company.name, retrieval.results, documentMap);
      const started = performance.now();
      const generated = await this.model.generate({
        systemInstruction: prompt.systemInstruction,
        context: prompt.context,
        question: question.trim(),
      });
      generationLatencyMs = performance.now() - started;
      answer = generated.answer.trim() || "I don't know.";
      model = generated.model;
    }

    let citedRanks =
      answer === "I don't know." ? [] : referencedSourceRanks(answer, retrieval.results.length);
    if (answer !== "I don't know." && citedRanks.length === 0) {
      answer = "I don't know.";
      citedRanks = [];
    }
    const citations: Citation[] = citedRanks.flatMap((rank) => {
      const result = retrieval.results[rank - 1];
      if (!result) return [];
      return [
        {
          documentId: result.chunk.documentId,
          filename: documentMap.get(result.chunk.documentId)?.filename ?? "Unknown local document",
          page: result.chunk.page,
          chunkId: result.chunk.id,
          text: result.chunk.text,
          similarity: result.score,
        },
      ];
    });

    const runId = createId("run");
    const evaluationId = createId("eval");
    const run: ResearchRun = {
      id: runId,
      mode: "local-ai",
      companyId,
      question: question.trim(),
      answer,
      citations,
      retrievalResults: retrieval.results,
      evaluationId,
      createdAt: new Date().toISOString(),
      model,
      promptVersion: LOCAL_RAG_PROMPT.version,
      diagnostics: {
        retrievalSufficient: retrieval.sufficient,
        retrievalThreshold: retrieval.threshold,
        evidenceCount: retrieval.results.length,
        referencedEvidenceCount: citations.length,
        citationCoverage: retrieval.results.length
          ? citations.length / retrieval.results.length
          : 0,
        companyPurity: 1,
        guardrailTriggered: answer === "I don't know.",
        retrievalLatencyMs: retrieval.latencyMs,
        generationLatencyMs,
      },
    };
    const evaluation: EvaluationResult = {
      id: evaluationId,
      researchRunId: runId,
      groundedness: null,
      contextRelevance: null,
      answerRelevance: null,
      retrievalHit: retrieval.sufficient,
      notes: `Local deterministic diagnostics · ${citations.length}/${retrieval.results.length} retrieved sources referenced.`,
      method: "deterministic",
      createdAt: run.createdAt,
    };
    await this.research.save(run);
    await this.evaluations.save(evaluation);
    return run;
  }
}
