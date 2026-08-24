import { ArrowRight, Database, FileUp, Search, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectOriginBridge } from "@/components/shared/project-origin-bridge";
import { ResearchPanel } from "@/components/shared/research-panel";

export function LocalOverviewView() {
  const { counts, lastRun, modelState } = useLocalRuntime();
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Portfolio continuation / Local AI"
        title="Local evidence research workspace"
        description="Apply the academic experiment's evidence-first principles to your own documents through a zero-backend, browser-native RAG workflow."
        snapshot={false}
      >
        <NavLink to="/documents" className="research-link">
          Open local documents <ArrowRight aria-hidden="true" className="size-4" />
        </NavLink>
      </PageHeader>
      <ProjectOriginBridge emphasis="local" />
      <LocalSystemStatus />
      <section className="metric-deck" aria-label="Local workspace summary">
        <div className="metric-deck__primary">
          <p className="metric-label">Companies</p>
          <strong className="metric-value">{counts.companies}</strong>
          <span>user-defined research entities</span>
        </div>
        <div>
          <p className="metric-label">Documents</p>
          <strong className="metric-value">{counts.documents}</strong>
          <span>local metadata records</span>
        </div>
        <div>
          <p className="metric-label">Indexed chunks</p>
          <strong className="metric-value">{counts.chunks}</strong>
          <span>embedded in IndexedDB</span>
        </div>
        <div>
          <p className="metric-label">Research runs</p>
          <strong className="metric-value">{counts.researchRuns}</strong>
          <span>saved evidence snapshots</span>
        </div>
        <div className="metric-deck__verdict">
          <ShieldCheck aria-hidden="true" className="text-success size-5" />
          <div>
            <p className="metric-label">Language model</p>
            <strong className="font-mono text-sm">{modelState.status}</strong>
          </div>
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          {
            title: "1 · Establish scope",
            body: "Create a company and index one or more PDFs. Page boundaries and company metadata remain attached to every chunk.",
            to: "/documents",
            action: "Manage documents",
            icon: FileUp,
          },
          {
            title: "2 · Inspect evidence",
            body: "Run retrieval without loading the language model. Review cosine similarity, source pages, and the sufficiency heuristic.",
            to: "/narrative",
            action: "Search evidence",
            icon: Search,
          },
          {
            title: "3 · Generate locally",
            body: "Explicitly load WebLLM, ask a free-form question, and inspect source labels and deterministic diagnostics.",
            to: "/assistant",
            action: "Open RAG Assistant",
            icon: Database,
          },
        ].map((step) => (
          <ResearchPanel key={step.title} title={step.title} icon={step.icon}>
            <p className="text-muted-foreground text-sm leading-6">{step.body}</p>
            <NavLink to={step.to} className="research-link mt-4">
              {step.action} <ArrowRight aria-hidden="true" className="size-4" />
            </NavLink>
          </ResearchPanel>
        ))}
      </div>
      {lastRun ? (
        <ResearchPanel
          title="Latest local research run"
          description={new Date(lastRun.createdAt).toLocaleString()}
        >
          <p className="font-medium">{lastRun.question}</p>
          <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-6">
            {lastRun.answer}
          </p>
        </ResearchPanel>
      ) : null}
    </div>
  );
}
