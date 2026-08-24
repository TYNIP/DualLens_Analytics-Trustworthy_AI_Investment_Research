import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LocalLanguageModel } from "@/lib/ai/language-model";
import { LocalRagService } from "@/lib/ai/local-rag-service";
import type { EmbeddingProvider } from "@/lib/embeddings/provider";
import type { PdfProcessor } from "@/lib/pdf/processor";
import { LocalRetrievalService } from "@/lib/retrieval/local-retrieval-service";
import { LocalVectorRetriever } from "@/lib/retrieval/local-vector-retriever";
import { DualLensDatabase } from "@/lib/storage/database";
import { ChunkRepository } from "@/lib/storage/repositories/chunks";
import { CompanyRepository } from "@/lib/storage/repositories/companies";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import { EvaluationRepository } from "@/lib/storage/repositories/evaluations";
import { ResearchRepository } from "@/lib/storage/repositories/research";

import { DocumentIndexer } from "./document-indexer";

const MODEL = "deterministic-test-embedding";

class TestEmbeddings implements EmbeddingProvider {
  async load() {
    return { modelId: MODEL, dimensions: 2, ready: true };
  }

  async embed(texts: string[]) {
    return texts.map((text) => (/revenue|growth|accelerated/i.test(text) ? [1, 0] : [0, 1]));
  }

  async unload() {}
}

describe("browser-native indexing to grounded answer pipeline", () => {
  let database: DualLensDatabase;
  let companies: CompanyRepository;
  let documents: DocumentRepository;
  let chunks: ChunkRepository;
  let research: ResearchRepository;
  let evaluations: EvaluationRepository;

  beforeEach(async () => {
    database = new DualLensDatabase(`Pipeline-${crypto.randomUUID()}`);
    await database.open();
    companies = new CompanyRepository(database);
    documents = new DocumentRepository(database);
    chunks = new ChunkRepository(database);
    research = new ResearchRepository(database);
    evaluations = new EvaluationRepository(database);
    await companies.save({
      id: "acme",
      ticker: "ACME",
      name: "Acme Robotics",
      createdAt: "2026-01-01T00:00:00Z",
    });
  });

  afterEach(async () => database.delete());

  it("extracts, chunks, embeds, persists, retrieves, cites, and saves diagnostics", async () => {
    const pdf: PdfProcessor = {
      extract: vi.fn().mockResolvedValue({
        filename: "acme.pdf",
        pageCount: 2,
        pages: [
          { pageNumber: 1, text: "Revenue growth accelerated due to AI systems." },
          { pageNumber: 2, text: "Operating costs were stable." },
        ],
      }),
    };
    const file = {
      name: "acme.pdf",
      type: "application/pdf",
      size: 2048,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as File;
    const embeddings = new TestEmbeddings();
    const indexer = new DocumentIndexer(pdf, embeddings, documents, 1);
    const indexed = await indexer.index(file, "acme", { documentId: "doc-acme" });

    expect(indexed).toMatchObject({ indexingStatus: "ready", pageCount: 2, chunkCount: 2 });
    expect(await chunks.listByDocument("doc-acme")).toHaveLength(2);

    const retriever = new LocalVectorRetriever(chunks, MODEL, documents);
    const retrieval = new LocalRetrievalService(embeddings, retriever);
    const model: LocalLanguageModel = {
      load: vi.fn().mockResolvedValue({
        provider: "local-webllm",
        modelId: "test-llm",
        executionDevice: "test",
      }),
      generate: vi.fn().mockResolvedValue({
        answer: "Revenue growth accelerated due to AI systems [S1].",
        citations: [],
        model: { provider: "local-webllm", modelId: "test-llm", executionDevice: "test" },
      }),
      unload: vi.fn(),
    };
    const service = new LocalRagService(
      retrieval,
      model,
      companies,
      documents,
      research,
      evaluations,
    );
    const run = await service.ask("What drove revenue growth?", "acme", 2);

    expect(model.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        question: "What drove revenue growth?",
        context: expect.stringContaining("[Source S1]"),
        systemInstruction: expect.stringContaining("I don't know."),
      }),
    );
    expect(run.answer).toContain("[S1]");
    expect(run.citations[0]).toMatchObject({ filename: "acme.pdf", page: 1 });
    expect(run.diagnostics).toMatchObject({
      retrievalSufficient: true,
      evidenceCount: 2,
      referencedEvidenceCount: 1,
      guardrailTriggered: false,
    });
    await expect(research.get(run.id)).resolves.toEqual(run);
    await expect(evaluations.getByResearchRun(run.id)).resolves.toMatchObject({
      retrievalHit: true,
      method: "deterministic",
    });
  });

  it("returns the exact guardrail answer and never invokes generation for weak evidence", async () => {
    const retrieval = {
      search: vi.fn().mockResolvedValue({
        results: [],
        sufficient: false,
        threshold: 0.3,
        latencyMs: 1,
      }),
    } as unknown as LocalRetrievalService;
    const generate = vi.fn();
    const model: LocalLanguageModel = {
      load: vi.fn(),
      generate,
      unload: vi.fn(),
    };
    const service = new LocalRagService(
      retrieval,
      model,
      companies,
      documents,
      research,
      evaluations,
    );

    const run = await service.ask("Unknown fact?", "acme");
    expect(run.answer).toBe("I don't know.");
    expect(run.citations).toEqual([]);
    expect(run.diagnostics?.guardrailTriggered).toBe(true);
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects an uncited generated answer as unsupported", async () => {
    const retrieval = {
      search: vi.fn().mockResolvedValue({
        results: [
          {
            rank: 1,
            score: 0.8,
            chunk: {
              id: "snapshot",
              documentId: "missing-live-document",
              companyId: "acme",
              page: 1,
              chunkIndex: 0,
              text: "Evidence",
              embedding: [1, 0],
              embeddingModel: MODEL,
              embeddingDimension: 2,
              chunkingVersion: "v1",
            },
          },
        ],
        sufficient: true,
        threshold: 0.3,
        latencyMs: 1,
      }),
    } as unknown as LocalRetrievalService;
    const model: LocalLanguageModel = {
      load: vi.fn(),
      generate: vi.fn().mockResolvedValue({
        answer: "A fluent answer with no source reference.",
        citations: [],
        model: { provider: "local-webllm", modelId: "test" },
      }),
      unload: vi.fn(),
    };
    const service = new LocalRagService(
      retrieval,
      model,
      companies,
      documents,
      research,
      evaluations,
    );

    const run = await service.ask("Question?", "acme");
    expect(run.answer).toBe("I don't know.");
    expect(run.citations).toEqual([]);
    expect(run.diagnostics?.guardrailTriggered).toBe(true);
  });

  it("persists an error state instead of a fake ready document when embedding fails", async () => {
    const pdf: PdfProcessor = {
      extract: vi.fn().mockResolvedValue({
        filename: "failure.pdf",
        pageCount: 1,
        pages: [{ pageNumber: 1, text: "Readable source text." }],
      }),
    };
    const embeddings: EmbeddingProvider = {
      load: vi.fn().mockRejectedValue(new Error("Embedding runtime unavailable")),
      embed: vi.fn(),
      unload: vi.fn(),
    };
    const file = {
      name: "failure.pdf",
      type: "application/pdf",
      size: 100,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as File;
    const indexer = new DocumentIndexer(pdf, embeddings, documents);

    await expect(indexer.index(file, "acme", { documentId: "failed-doc" })).rejects.toThrow(
      /Embedding runtime unavailable/,
    );
    await expect(documents.get("failed-doc")).resolves.toMatchObject({
      indexingStatus: "error",
      errorMessage: "Embedding runtime unavailable",
      chunkCount: 0,
    });
  });
});
