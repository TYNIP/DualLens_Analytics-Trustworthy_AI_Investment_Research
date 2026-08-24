import { Database, Download, HardDrive, LockKeyhole, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Button } from "@/components/ui/button";
import { requestPersistentStorage } from "@/lib/browser/capabilities";
import { downloadWorkspace, WorkspaceService } from "@/lib/storage/workspace-service";

function formatBytes(value?: number): string {
  if (value === undefined) return "Not reported";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}

export function StoragePage() {
  const runtime = useLocalRuntime();
  const [workspace] = useState(() => new WorkspaceService());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [persistentOverride, setPersistentOverride] = useState<boolean | null>(null);
  const persistent = persistentOverride ?? runtime.capabilities?.storagePersistenceGranted ?? false;

  async function exportData() {
    setBusy(true);
    setError(null);
    try {
      downloadWorkspace(await workspace.export());
      setMessage(
        "Workspace export created locally. Demo fixtures and model weights were excluded.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Workspace export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function importData(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);
    if (!file.name.toLowerCase().endsWith(".json") || file.size > 50 * 1024 * 1024) {
      setError("Choose a DualLens JSON export no larger than 50 MB.");
      return;
    }
    if (!globalThis.confirm("Replace the current local workspace with this validated import?"))
      return;
    setBusy(true);
    try {
      const parsed = workspace.parse(await file.text());
      await workspace.replace(parsed);
      await runtime.refreshWorkspace();
      runtime.setLastRun(null);
      runtime.setLastRetrieval([]);
      setMessage(
        `Workspace restored: ${parsed.companies.length} companies, ${parsed.documents.length} documents, ${parsed.chunks.length} chunks.`,
      );
    } catch (cause) {
      setError(
        cause instanceof SyntaxError
          ? "The import is not valid JSON. The current workspace was not changed."
          : cause instanceof Error
            ? `Import rejected: ${cause.message}`
            : "The import was rejected. The current workspace was not changed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function clearData() {
    const summary = `${runtime.counts.companies} companies, ${runtime.counts.documents} documents, ${runtime.counts.chunks} chunks, and ${runtime.counts.researchRuns} research runs`;
    if (!globalThis.confirm(`Clear ${summary} from this browser? Demo Mode will remain available.`))
      return;
    setBusy(true);
    setError(null);
    try {
      await workspace.clear();
      runtime.setLastRun(null);
      runtime.setLastRetrieval([]);
      await runtime.refreshWorkspace();
      setMessage("Local workspace cleared. Academic Demo Mode was not affected.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The local workspace could not be cleared.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function persistStorage() {
    const granted = await requestPersistentStorage();
    setPersistentOverride(granted);
    setMessage(
      granted
        ? "Persistent storage was granted by the browser."
        : "The browser did not grant persistent storage; exports remain the safest backup.",
    );
  }

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Workspace / Local storage"
        title="Local Storage"
        description="Inspect browser capabilities, workspace records, model state, and portable backups without a cloud database."
        snapshot={false}
      />

      <LocalSystemStatus />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ResearchPanel
          title="Dexie workspace · schema version 2"
          description="DualLensResearchLab · transactional IndexedDB persistence"
          icon={Database}
        >
          <div className="schema-grid">
            {[
              ["companies", runtime.counts.companies],
              ["documents", runtime.counts.documents],
              ["chunks", runtime.counts.chunks],
              ["researchRuns", runtime.counts.researchRuns],
              ["evaluations", runtime.counts.evaluations],
              ["settings", "local"],
            ].map(([table, count]) => (
              <div key={table}>
                <HardDrive aria-hidden="true" className="text-accent-blue size-4" />
                <span>
                  {table} · {count}
                </span>
              </div>
            ))}
          </div>
          <dl className="local-storage-ledger mt-5">
            <div>
              <dt>Browser usage</dt>
              <dd>{formatBytes(runtime.capabilities?.storageUsage)}</dd>
            </div>
            <div>
              <dt>Browser quota</dt>
              <dd>{formatBytes(runtime.capabilities?.storageQuota)}</dd>
            </div>
            <div>
              <dt>Persistent storage</dt>
              <dd>{persistent ? "Granted" : "Not granted"}</dd>
            </div>
            <div>
              <dt>Embedding model</dt>
              <dd>{runtime.embeddingState}</dd>
            </div>
            <div>
              <dt>Language model</dt>
              <dd>{runtime.modelState.status}</dd>
            </div>
          </dl>
          {runtime.capabilities?.persistentStorage && !persistent ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => void persistStorage()}
            >
              Request persistent storage
            </Button>
          ) : null}
        </ResearchPanel>

        <ResearchPanel
          title="Workspace portability"
          description="Versioned JSON · replace strategy · Zod validation"
          icon={LockKeyhole}
        >
          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => void exportData()}
            >
              <Download aria-hidden="true" className="size-4" />
              Export workspace
            </Button>
            <label className="button-file-label">
              <Upload aria-hidden="true" className="size-4" />
              Import workspace
              <input
                type="file"
                accept=".json,application/json"
                disabled={busy}
                onChange={(event) => void importData(event.target.files?.[0])}
                className="sr-only"
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              className="text-warning w-full"
              disabled={busy}
              onClick={() => void clearData()}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Clear local workspace
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-xs leading-5">
            Exports include companies, metadata, chunks, embeddings, research runs, evaluations, and
            settings. They exclude PDFs, model weights, browser caches, and Demo Mode data.
          </p>
        </ResearchPanel>
      </div>

      {message ? (
        <p role="status" className="border-success bg-success/7 border-l-2 p-4 text-sm">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="border-warning bg-warning/7 text-warning border-l-2 p-4 text-sm">
          {error}
        </p>
      ) : null}

      <div className="border-border bg-surface/55 flex gap-3 border p-4 text-sm leading-6">
        <LockKeyhole aria-hidden="true" className="text-success mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Local privacy boundary.</strong> Document content and
          queries remain in the browser. Model assets may be downloaded from Hugging Face and MLC
          hosting origins and cached by the browser.
        </p>
      </div>
    </div>
  );
}
