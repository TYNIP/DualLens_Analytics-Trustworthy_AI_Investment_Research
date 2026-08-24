import { Bot, Clock3, FileSearch, History, Search, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { EvidenceInspector } from "@/components/evidence/evidence-inspector";
import { LocalModelManager } from "@/components/shared/local-model-manager";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocalRagService } from "@/lib/ai/local-rag-service";
import { localLanguageModel } from "@/lib/ai/webllm-language-model";
import { toLocalEvidence } from "@/lib/evidence/local-evidence";
import { LocalRetrievalService } from "@/lib/retrieval/local-retrieval-service";
import { CompanyRepository } from "@/lib/storage/repositories/companies";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import { ResearchRepository } from "@/lib/storage/repositories/research";
import type { Company, ResearchDocument, ResearchRun, RetrievalResult } from "@/types/domain";

export function LocalRagView() {
  const {
    embeddingProvider,
    capabilities,
    interruptModel,
    markEmbeddingError,
    markEmbeddingReady,
    modelState,
    refreshWorkspace,
    setLastRetrieval,
    setLastRun,
  } = useLocalRuntime();
  const [companiesRepo] = useState(() => new CompanyRepository());
  const [documentsRepo] = useState(() => new DocumentRepository());
  const [researchRepo] = useState(() => new ResearchRepository());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [history, setHistory] = useState<ResearchRun[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [documentScope, setDocumentScope] = useState("all");
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(4);
  const [results, setResults] = useState<RetrievalResult[]>([]);
  const [run, setRun] = useState<ResearchRun | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [retrieving, setRetrieving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [companyRows, documentRows, runs] = await Promise.all([
      companiesRepo.list(),
      documentsRepo.list(),
      researchRepo.listRecent(12),
    ]);
    setCompanies(companyRows);
    setDocuments(documentRows);
    setHistory(runs.filter((item) => item.mode === "local-ai"));
    setCompanyId((current) =>
      companyRows.some((company) => company.id === current) ? current : (companyRows[0]?.id ?? ""),
    );
  }, [companiesRepo, documentsRepo, researchRepo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- this hydrates component state from asynchronous IndexedDB repositories.
    void load();
  }, [load]);

  const selectedCompany = companies.find((company) => company.id === companyId);
  const readyDocuments = documents.filter(
    (document) => document.companyId === companyId && document.indexingStatus === "ready",
  );
  const scopedIds = documentScope === "all" ? undefined : [documentScope];
  const documentMap = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );
  const referenced = new Set(run?.citations.map((citation) => citation.chunkId) ?? []);
  const evidence = toLocalEvidence(
    results,
    selectedCompany?.ticker ?? "LOCAL",
    documentMap,
    referenced,
  );
  const canRetrieve = Boolean(
    question.trim() &&
    companyId &&
    readyDocuments.length &&
    capabilities?.indexedDB &&
    capabilities.wasm,
  );
  const canGenerate = canRetrieve && modelState.status === "ready";

  async function retrieve() {
    setRetrieving(true);
    setError(null);
    setRun(null);
    try {
      const service = new LocalRetrievalService(embeddingProvider);
      const response = await service.search(question, companyId, topK, scopedIds);
      setResults(response.results);
      setLastRetrieval(response.results);
      markEmbeddingReady();
    } catch (cause) {
      markEmbeddingError();
      setError(cause instanceof Error ? cause.message : "Local retrieval failed.");
    } finally {
      setRetrieving(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const retrieval = new LocalRetrievalService(embeddingProvider);
      const service = new LocalRagService(retrieval, localLanguageModel);
      const nextRun = await service.ask(question, companyId, topK, scopedIds);
      setRun(nextRun);
      setResults(nextRun.retrievalResults);
      setLastRun(nextRun);
      setLastRetrieval(nextRun.retrievalResults);
      markEmbeddingReady();
      await Promise.all([load(), refreshWorkspace()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Local generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function removeRun(id: string) {
    if (!globalThis.confirm("Delete this local research run and its deterministic evaluation?"))
      return;
    await researchRepo.delete(id);
    if (run?.id === id) {
      setRun(null);
      setResults([]);
    }
    await Promise.all([load(), refreshWorkspace()]);
  }

  function reopen(item: ResearchRun) {
    setRun(item);
    setQuestion(item.question);
    setCompanyId(item.companyId ?? "");
    setResults(item.retrievalResults);
    setLastRun(item);
    setLastRetrieval(item.retrievalResults);
  }

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Research lenses / Local RAG"
        title="RAG Assistant"
        description="Retrieve company-scoped evidence, inspect cosine similarity, and generate a grounded answer entirely in this browser."
        snapshot={false}
      >
        <Badge variant="success">Local processing</Badge>
      </PageHeader>

      <LocalSystemStatus />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <ResearchPanel
          title="Research composer"
          description="Retrieval works without WebGPU; answer generation requires the explicitly loaded model."
          icon={Search}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="rag-company" className="form-label">
                Company scope
              </label>
              <select
                id="rag-company"
                value={companyId}
                onChange={(event) => {
                  setCompanyId(event.target.value);
                  setDocumentScope("all");
                  setResults([]);
                }}
                className="research-input mt-1.5"
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.ticker} · {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rag-document" className="form-label">
                Indexed document scope
              </label>
              <select
                id="rag-document"
                value={documentScope}
                onChange={(event) => setDocumentScope(event.target.value)}
                className="research-input mt-1.5"
              >
                <option value="all">All ready documents</option>
                {readyDocuments.map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.filename}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="local-question" className="form-label">
              Research question
            </label>
            <textarea
              id="local-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="research-input mt-1.5 min-h-28 resize-y"
              placeholder="What initiative does the evidence describe?"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="rag-top-k" className="form-label">
                Top-k
              </label>
              <select
                id="rag-top-k"
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
                className="research-input mt-1.5 w-24"
              >
                {[3, 4, 5, 6].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!canRetrieve || retrieving || generating}
              onClick={() => void retrieve()}
            >
              <FileSearch aria-hidden="true" className="size-4" />
              {retrieving ? "Retrieving…" : "Retrieve evidence"}
            </Button>
            <Button
              type="button"
              disabled={!canGenerate || retrieving || generating}
              onClick={() => void generate()}
            >
              <Bot aria-hidden="true" className="size-4" />
              {generating ? "Generating locally…" : "Generate grounded answer"}
            </Button>
            {generating ? (
              <Button type="button" variant="ghost" onClick={() => void interruptModel()}>
                <Square aria-hidden="true" className="size-3.5" />
                Stop generation
              </Button>
            ) : null}
          </div>
          {capabilities && (!capabilities.indexedDB || !capabilities.wasm) ? (
            <p className="text-warning mt-4 text-sm">
              This browser cannot provide the IndexedDB and WebAssembly capabilities required for
              local retrieval. Demo Mode remains available.
            </p>
          ) : !readyDocuments.length ? (
            <p className="text-warning mt-4 text-sm">
              No ready index exists for this company. Add and index a PDF in My Documents.
            </p>
          ) : modelState.status !== "ready" ? (
            <p className="text-muted-foreground mt-4 text-sm">
              Evidence retrieval is available. Load the local model to enable grounded generation.
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-warning mt-4 text-sm leading-6">
              {error}
            </p>
          ) : null}
        </ResearchPanel>

        <LocalModelManager />
      </div>

      {run ? (
        <ResearchPanel
          title="Grounded local answer"
          description={`${run.model.modelId} · prompt ${run.promptVersion}`}
          icon={Bot}
          action={
            <Badge variant={run.diagnostics?.guardrailTriggered ? "warning" : "success"}>
              {run.diagnostics?.guardrailTriggered ? "Guardrail triggered" : "Generated locally"}
            </Badge>
          }
        >
          <div className="answer-thread__response">
            <p className="text-base leading-7 whitespace-pre-wrap">{run.answer}</p>
          </div>
          {run.citations.length ? (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Referenced evidence citations">
              {run.citations.map((citation, index) => (
                <button
                  key={citation.chunkId}
                  type="button"
                  onClick={() => setSelectedEvidence(citation.chunkId)}
                  className="citation-button"
                >
                  [S
                  {run.retrievalResults.find((result) => result.chunk.id === citation.chunkId)
                    ?.rank ?? index + 1}
                  ] {citation.filename} · p.{citation.page}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">
              {run.answer === "I don't know."
                ? "Insufficient local evidence. The language model was not called when retrieval failed the heuristic."
                : "The model did not reference a source label; inspect retrieved evidence before trusting the answer."}
            </p>
          )}
          {run.diagnostics ? (
            <dl className="local-diagnostics mt-5">
              <div>
                <dt>Retrieval</dt>
                <dd>{run.diagnostics.retrievalSufficient ? "Sufficient" : "Insufficient"}</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>{run.diagnostics.evidenceCount}</dd>
              </div>
              <div>
                <dt>Citation coverage</dt>
                <dd>{Math.round(run.diagnostics.citationCoverage * 100)}%</dd>
              </div>
              <div>
                <dt>Retrieval latency</dt>
                <dd>{Math.round(run.diagnostics.retrievalLatencyMs)} ms</dd>
              </div>
            </dl>
          ) : null}
        </ResearchPanel>
      ) : null}

      {results.length ? (
        <EvidenceInspector
          evidence={evidence}
          title="Local evidence trail"
          selectedId={selectedEvidence}
          onSelect={setSelectedEvidence}
        />
      ) : null}

      <ResearchPanel
        title="Research run history"
        description="Saved locally as inspectable runs, not chat conversations."
        icon={History}
      >
        {history.length ? (
          <ul className="divide-border divide-y">
            {history.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => reopen(item)}
                  className="min-h-11 min-w-0 flex-1 text-left"
                >
                  <span className="text-foreground block truncate text-sm font-medium">
                    {item.question}
                  </span>
                  <span className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <Clock3 aria-hidden="true" className="size-3" />
                    {new Date(item.createdAt).toLocaleString()} · {item.retrievalResults.length}{" "}
                    evidence records
                  </span>
                </button>
                <button
                  type="button"
                  className="icon-action text-warning"
                  aria-label={`Delete research run: ${item.question}`}
                  onClick={() => void removeRun(item.id)}
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-5 text-center text-sm">
            No local research runs yet.
          </p>
        )}
      </ResearchPanel>
    </div>
  );
}
