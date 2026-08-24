import { Building2, FileUp, Pencil, RotateCcw, Square, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentIndexer } from "@/lib/indexing/document-indexer";
import type { IndexingProgress } from "@/lib/indexing/document-indexer";
import { PdfJsProcessor } from "@/lib/pdf/pdfjs-processor";
import { CompanyRepository } from "@/lib/storage/repositories/companies";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import { createId } from "@/lib/utils/id";
import type { Company, ResearchDocument } from "@/types/domain";

const ONBOARDING_KEY = "duallens:local-onboarding-dismissed";

export function LocalDocumentsView() {
  const {
    capabilities,
    embeddingProvider,
    markEmbeddingError,
    markEmbeddingReady,
    refreshWorkspace,
  } = useLocalRuntime();
  const [companies] = useState(() => new CompanyRepository());
  const [documentsRepo] = useState(() => new DocumentRepository());
  const [companyRows, setCompanyRows] = useState<Company[]>([]);
  const [documentRows, setDocumentRows] = useState<ResearchDocument[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reindexId, setReindexId] = useState<string | null>(null);
  const [progress, setProgress] = useState<IndexingProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState(
    () => globalThis.localStorage?.getItem(ONBOARDING_KEY) !== "true",
  );
  const controllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [nextCompanies, nextDocuments] = await Promise.all([
      companies.list(),
      documentsRepo.list(),
    ]);
    setCompanyRows(nextCompanies);
    setDocumentRows(nextDocuments);
    setSelectedCompanyId((current) =>
      nextCompanies.some((company) => company.id === current)
        ? current
        : (nextCompanies[0]?.id ?? ""),
    );
    await refreshWorkspace();
  }, [companies, documentsRepo, refreshWorkspace]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- this hydrates component state from asynchronous IndexedDB repositories.
    void load();
  }, [load]);

  async function saveCompany(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const cleanTicker = ticker.trim().toUpperCase();
    const cleanName = name.trim();
    if (!cleanTicker || !cleanName) {
      setError("Ticker and company name are required.");
      return;
    }
    try {
      const existing = editingId ? await companies.get(editingId) : undefined;
      const now = new Date().toISOString();
      await companies.save({
        id: existing?.id ?? createId("company"),
        ticker: cleanTicker,
        name: cleanName,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
      setTicker("");
      setName("");
      setEditingId(null);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name === "ConstraintError"
          ? "That ticker already exists in this local workspace."
          : "The company could not be saved in browser storage.",
      );
    }
  }

  async function deleteCompany(company: Company) {
    const confirmed = globalThis.confirm(
      `Delete ${company.ticker}? Its documents, chunks, research runs, and evaluations will also be removed.`,
    );
    if (!confirmed) return;
    await companies.delete(company.id);
    await load();
  }

  async function deleteDocument(document: ResearchDocument) {
    if (
      !globalThis.confirm(
        `Delete ${document.filename} and its local chunks? Saved run snapshots remain.`,
      )
    )
      return;
    await documentsRepo.delete(document.id);
    await load();
  }

  async function indexPdf() {
    if (!file || !selectedCompanyId) {
      setError("Select a company and PDF before indexing.");
      return;
    }
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    const indexer = new DocumentIndexer(new PdfJsProcessor(), embeddingProvider, documentsRepo);
    try {
      await indexer.index(file, selectedCompanyId, {
        signal: controller.signal,
        onProgress: setProgress,
        documentId: reindexId ?? undefined,
      });
      markEmbeddingReady();
      setFile(null);
      setReindexId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (cause) {
      markEmbeddingError();
      setError(cause instanceof Error ? cause.message : "Document indexing failed.");
      await load();
    } finally {
      controllerRef.current = null;
      setBusy(false);
    }
  }

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Workspace / Local documents"
        title="My Documents"
        description="Create a research entity, extract PDF pages locally, generate WASM embeddings, and persist the index in this browser. Original PDF blobs are not retained."
        snapshot={false}
      />

      <LocalSystemStatus />

      {onboarding ? (
        <section className="local-onboarding" aria-labelledby="local-onboarding-title">
          <div>
            <p className="thread-label">Local AI workflow</p>
            <h2 id="local-onboarding-title" className="mt-2 text-base font-semibold">
              From PDF to inspectable evidence
            </h2>
            <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-5">
              {["Add company", "Upload PDF", "Index locally", "Load model", "Ask question"].map(
                (step, index) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="text-accent-blue font-mono text-xs">0{index + 1}</span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </div>
          <button
            type="button"
            onClick={() => {
              setOnboarding(false);
              globalThis.localStorage?.setItem(ONBOARDING_KEY, "true");
            }}
            className="focus-visible:ring-ring grid size-11 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Dismiss Local AI onboarding"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <ResearchPanel
          title={editingId ? "Edit research company" : "Add research company"}
          description="Local entities do not require stock-market validation."
          icon={Building2}
        >
          <form onSubmit={(event) => void saveCompany(event)} className="space-y-4">
            <div>
              <label htmlFor="local-ticker" className="form-label">
                Ticker or short code
              </label>
              <input
                id="local-ticker"
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
                maxLength={20}
                className="research-input mt-1.5"
                placeholder="ACME"
              />
            </div>
            <div>
              <label htmlFor="local-company-name" className="form-label">
                Company or research entity
              </label>
              <input
                id="local-company-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={160}
                className="research-input mt-1.5"
                placeholder="Acme Robotics"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">{editingId ? "Save changes" : "Add company"}</Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setTicker("");
                    setName("");
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="border-border mt-5 border-t pt-4">
            <p className="thread-label">Workspace entities</p>
            {companyRows.length ? (
              <ul className="mt-2 space-y-1">
                {companyRows.map((company) => (
                  <li key={company.id} className="local-company-row">
                    <button
                      type="button"
                      onClick={() => setSelectedCompanyId(company.id)}
                      aria-pressed={selectedCompanyId === company.id}
                      className="min-w-0 flex-1 text-left"
                    >
                      <strong className="block font-mono text-xs">{company.ticker}</strong>
                      <span className="text-muted-foreground block truncate text-xs">
                        {company.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="icon-action"
                      aria-label={`Edit ${company.ticker}`}
                      onClick={() => {
                        setEditingId(company.id);
                        setTicker(company.ticker);
                        setName(company.name);
                      }}
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="icon-action text-warning"
                      aria-label={`Delete ${company.ticker}`}
                      onClick={() => void deleteCompany(company)}
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                No local companies yet. Add one to establish the required retrieval boundary.
              </p>
            )}
          </div>
        </ResearchPanel>

        <div className="space-y-4">
          <ResearchPanel
            title={reindexId ? "Re-index local PDF" : "Index a local PDF"}
            description="Maximum 25 MB · PDF.js extraction · 1000-character chunks with 200-character overlap"
            icon={FileUp}
          >
            <div className="grid gap-4 md:grid-cols-[minmax(12rem,0.45fr)_minmax(0,1fr)]">
              <div>
                <label htmlFor="document-company" className="form-label">
                  Company scope
                </label>
                <select
                  id="document-company"
                  value={selectedCompanyId}
                  onChange={(event) => setSelectedCompanyId(event.target.value)}
                  className="research-input mt-1.5"
                >
                  <option value="">Select company</option>
                  {companyRows.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.ticker} · {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="local-pdf" className="form-label">
                  PDF source
                </label>
                <input
                  ref={fileInputRef}
                  id="local-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={busy}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="research-file-input mt-1.5"
                />
              </div>
            </div>
            <p className="text-muted-foreground mt-3 text-xs leading-5">
              Indexing may download the open MiniLM embedding model once. Processing and extracted
              document text remain on this device.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={
                  busy ||
                  !file ||
                  !selectedCompanyId ||
                  !capabilities?.indexedDB ||
                  !capabilities.wasm
                }
                onClick={() => void indexPdf()}
              >
                {busy ? "Indexing…" : reindexId ? "Re-index PDF" : "Index PDF"}
              </Button>
              {busy ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => controllerRef.current?.abort()}
                >
                  <Square aria-hidden="true" className="size-3.5" />
                  Cancel after current stage
                </Button>
              ) : null}
            </div>
            {capabilities && (!capabilities.indexedDB || !capabilities.wasm) ? (
              <p className="text-warning mt-4 text-sm leading-6">
                Local indexing requires IndexedDB and WebAssembly. Use Demo Mode or a compatible
                browser; no file was processed.
              </p>
            ) : null}
            {progress ? (
              <div className="index-progress mt-4" role="status" aria-live="polite">
                <span className="font-mono text-xs">{progress.stage}</span>
                <p className="mt-1 text-sm">{progress.message}</p>
                {progress.total ? (
                  <progress
                    className="mt-3 w-full"
                    value={progress.current ?? 0}
                    max={progress.total}
                  />
                ) : null}
              </div>
            ) : null}
            {error ? (
              <p role="alert" className="text-warning mt-4 text-sm leading-6">
                {error}
              </p>
            ) : null}
          </ResearchPanel>

          <ResearchPanel
            title="Local document index"
            description={`${documentRows.length} documents · source PDFs are not stored long-term`}
          >
            {documentRows.length ? (
              <div className="overflow-x-auto">
                <table className="research-table min-w-[48rem]">
                  <caption className="sr-only">Locally indexed PDF documents</caption>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Company</th>
                      <th>Pages</th>
                      <th>Chunks</th>
                      <th>Index</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentRows.map((document) => {
                      const company = companyRows.find((item) => item.id === document.companyId);
                      return (
                        <tr key={document.id}>
                          <td>
                            <span className="text-foreground font-medium">{document.filename}</span>
                            <span className="text-muted-foreground mt-1 block text-xs">
                              {(document.fileSize / 1024 / 1024).toFixed(2)} MB ·{" "}
                              {document.embeddingModel ?? "model pending"}
                            </span>
                          </td>
                          <td className="font-mono">{company?.ticker ?? "—"}</td>
                          <td>{document.pageCount}</td>
                          <td>{document.chunkCount}</td>
                          <td>
                            <Badge
                              variant={document.indexingStatus === "ready" ? "success" : "warning"}
                            >
                              {document.indexingStatus}
                            </Badge>
                            {document.errorMessage ? (
                              <span className="text-warning mt-1 block max-w-xs text-xs">
                                {document.errorMessage}
                              </span>
                            ) : null}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className="icon-action"
                                aria-label={`Re-index ${document.filename}`}
                                onClick={() => {
                                  setSelectedCompanyId(document.companyId);
                                  setReindexId(document.id);
                                  fileInputRef.current?.focus();
                                }}
                              >
                                <RotateCcw aria-hidden="true" className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                className="icon-action text-warning"
                                aria-label={`Delete ${document.filename}`}
                                onClick={() => void deleteDocument(document)}
                              >
                                <Trash2 aria-hidden="true" className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm font-medium">No local documents indexed</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Add a company, choose a PDF, and start local indexing.
                </p>
              </div>
            )}
          </ResearchPanel>
        </div>
      </div>
    </div>
  );
}
