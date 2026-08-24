import { FileUp, Files, LockKeyhole, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

import { LockedNotice } from "@/components/shared/locked-notice";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoCompanies, experiment } from "@/data/demo";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalDocumentsView } from "./local-documents-view";

export function DocumentsPage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalDocumentsView />;
  return <DemoDocumentsView />;
}

function DemoDocumentsView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function openDialog(event: ReactMouseEvent<HTMLButtonElement>) {
    lastTriggerRef.current = event.currentTarget;
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    queueMicrotask(() => lastTriggerRef.current?.focus());
  }

  function containFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    if (!dialogOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [dialogOpen]);

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Workspace / Documents"
        title="My Documents"
        description="A read-only view of the academic corpus metadata. The source PDFs remain private and are not bundled with the public application."
      >
        <Button type="button" onClick={openDialog}>
          <FileUp aria-hidden="true" className="size-4" />
          Add local PDF
        </Button>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ResearchPanel
          title="Academic corpus index"
          description={`${experiment.pages} pages · ${experiment.chunks} metadata-tagged chunks`}
          icon={Files}
        >
          <div className="overflow-x-auto">
            <table className="research-table min-w-[42rem]">
              <caption className="sr-only">Demo document metadata</caption>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Company</th>
                  <th>Pages</th>
                  <th>Chunks</th>
                  <th>Index status</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {demoCompanies.map((company) => (
                  <tr key={company.ticker}>
                    <td className="text-foreground font-medium">{company.ticker}.pdf</td>
                    <td className="font-mono">{company.ticker}</td>
                    <td>{company.pages}</td>
                    <td>{company.chunks}</td>
                    <td>
                      <Badge variant="success">Academic index ready</Badge>
                    </td>
                    <td>
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <LockKeyhole aria-hidden="true" className="size-3.5" />
                        Private source
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResearchPanel>

        <div className="space-y-4">
          <div className="document-dropzone">
            <FileUp aria-hidden="true" className="text-accent-violet size-6" />
            <h2 className="mt-4 text-sm font-semibold">Local PDF ingestion</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Switch to Local AI Mode to parse, chunk, embed, and store your own PDFs locally.
            </p>
            <Button type="button" variant="secondary" className="mt-5 w-full" onClick={openDialog}>
              View availability
            </Button>
          </div>
          <LockedNotice
            title="No fake indexing"
            description="Demo Mode displays saved academic metadata; it does not accept files, parse PDFs, or generate embeddings."
          />
        </div>
      </div>

      {dialogOpen ? (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-dialog-title"
            className="dialog-surface"
            onKeyDown={containFocus}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeDialog}
              className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground focus-visible:ring-ring absolute top-3 right-3 grid size-11 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Close dialog"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            <LockKeyhole aria-hidden="true" className="text-accent-violet size-5" />
            <h2 id="upload-dialog-title" className="mt-4 text-lg font-semibold">
              Available in Local AI Mode
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Local AI Mode processes PDFs with PDF.js, creates local embeddings, and stores
              serializable chunks in IndexedDB. Demo Mode remains read-only; no upload occurred.
            </p>
            <Button type="button" className="mt-6" onClick={closeDialog}>
              Understood
            </Button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
