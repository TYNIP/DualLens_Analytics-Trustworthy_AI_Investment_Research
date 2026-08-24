import { FileSearch, Layers3, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { EvidenceInspector } from "@/components/evidence/evidence-inspector";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Button } from "@/components/ui/button";
import { toLocalEvidence } from "@/lib/evidence/local-evidence";
import { LocalRetrievalService } from "@/lib/retrieval/local-retrieval-service";
import { CompanyRepository } from "@/lib/storage/repositories/companies";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import type { Company, ResearchDocument, RetrievalResult } from "@/types/domain";

export function LocalNarrativeView() {
  const { embeddingProvider, markEmbeddingError, markEmbeddingReady, setLastRetrieval } =
    useLocalRuntime();
  const [companyRepo] = useState(() => new CompanyRepository());
  const [documentRepo] = useState(() => new DocumentRepository());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RetrievalResult[]>([]);
  const [sufficient, setSufficient] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [companyRows, documentRows] = await Promise.all([
      companyRepo.list(),
      documentRepo.list(),
    ]);
    setCompanies(companyRows);
    setDocuments(documentRows);
    setCompanyId((current) => current || companyRows[0]?.id || "");
  }, [companyRepo, documentRepo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- this hydrates component state from asynchronous IndexedDB repositories.
    void load();
  }, [load]);

  const selected = companies.find((company) => company.id === companyId);
  const scopedDocuments = documents.filter((document) => document.companyId === companyId);
  const readyDocuments = scopedDocuments.filter((document) => document.indexingStatus === "ready");
  const documentMap = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );
  const evidence = toLocalEvidence(results, selected?.ticker ?? "LOCAL", documentMap);

  async function search() {
    setBusy(true);
    setError(null);
    try {
      const response = await new LocalRetrievalService(embeddingProvider).search(
        query,
        companyId,
        4,
      );
      setResults(response.results);
      setSufficient(response.sufficient);
      setLastRetrieval(response.results);
      markEmbeddingReady();
    } catch (cause) {
      markEmbeddingError();
      setError(cause instanceof Error ? cause.message : "Local evidence search failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Research lenses / Local narrative"
        title="Narrative Lens"
        description="Inspect your company-scoped document index and search evidence without loading the language model."
        snapshot={false}
      />
      <LocalSystemStatus />
      <div className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <ResearchPanel
          title="Local corpus coverage"
          description="Only ready documents participate in retrieval."
          icon={Layers3}
        >
          <label htmlFor="narrative-company" className="form-label">
            Research company
          </label>
          <select
            id="narrative-company"
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
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
          <dl className="border-border mt-5 divide-y border-y text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-muted-foreground">Documents</dt>
              <dd className="font-mono">{scopedDocuments.length}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-muted-foreground">Ready indexes</dt>
              <dd className="font-mono">{readyDocuments.length}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-muted-foreground">Eligible chunks</dt>
              <dd className="font-mono">
                {readyDocuments.reduce((total, document) => total + document.chunkCount, 0)}
              </dd>
            </div>
          </dl>
        </ResearchPanel>

        <ResearchPanel
          title="Retrieval-only evidence search"
          description="MiniLM query embedding → company filter → cosine similarity → top 4"
          icon={Search}
        >
          <label htmlFor="narrative-query" className="form-label">
            Evidence query
          </label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input
              id="narrative-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="research-input flex-1"
              placeholder="Search the local narrative index"
            />
            <Button
              type="button"
              disabled={!query.trim() || !companyId || !readyDocuments.length || busy}
              onClick={() => void search()}
            >
              <FileSearch aria-hidden="true" className="size-4" />
              {busy ? "Searching…" : "Search evidence"}
            </Button>
          </div>
          {sufficient !== null ? (
            <p className="text-muted-foreground mt-3 text-xs">
              Sufficiency heuristic: <strong>{sufficient ? "passed" : "failed"}</strong> · threshold
              0.300
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-warning mt-3 text-sm">
              {error}
            </p>
          ) : null}
        </ResearchPanel>
      </div>
      {results.length ? (
        <EvidenceInspector evidence={evidence} title="Local narrative matches" />
      ) : null}
    </div>
  );
}
