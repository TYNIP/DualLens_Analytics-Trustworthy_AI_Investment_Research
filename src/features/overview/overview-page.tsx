import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  FileSearch,
  FlaskConical,
  ScanSearch,
  ShieldAlert,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { EvidenceInspector } from "@/components/evidence/evidence-inspector";
import { ConfidenceGauge } from "@/components/metrics/confidence-gauge";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectOriginBridge } from "@/components/shared/project-origin-bridge";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { demoCompanies, demoQuestions, experiment } from "@/data/demo";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalOverviewView } from "./local-overview-view";

const leadQuestion = demoQuestions[0]!;

export function OverviewPage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalOverviewView />;
  return <DemoOverviewView />;
}

function DemoOverviewView() {
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Academic experiment / Final evaluated run"
        title="Trustworthy AI investment research"
        description="Explore the verified outputs of the original DualLens academic project: two research lenses, company-filtered RAG, evaluation, optimization, ranking, and confidence routing."
        snapshot={false}
      >
        <NavLink to="/assistant" className="research-link">
          Inspect a RAG result <ArrowRight aria-hidden="true" className="size-4" />
        </NavLink>
      </PageHeader>

      <ProjectOriginBridge emphasis="academic" />

      <section aria-label="Academic experiment summary" className="metric-deck">
        <div className="metric-deck__primary">
          <p className="metric-label">Corpus</p>
          <strong className="metric-value">{experiment.companies}</strong>
          <span>companies · {experiment.pages} pages</span>
        </div>
        <div>
          <p className="metric-label">Indexed evidence</p>
          <strong className="metric-value">{experiment.chunks}</strong>
          <span>metadata-tagged chunks</span>
        </div>
        <div>
          <p className="metric-label">Filtered retrieval</p>
          <strong className="metric-value">{experiment.filteredRetrievalHit}%</strong>
          <span>objective evidence hit rate</span>
        </div>
        <div>
          <p className="metric-label">Held-out v2</p>
          <strong className="metric-value">{experiment.heldOutV2Accuracy}%</strong>
          <span>
            {experiment.heldOutV2Correct}/{experiment.heldOutTotal} after GEPA
          </span>
        </div>
        <div className="metric-deck__verdict">
          <ShieldAlert aria-hidden="true" className="text-warning size-5" />
          <div>
            <p className="metric-label">Final route</p>
            <strong className="text-warning font-mono text-xl">FLAGGED</strong>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.7fr)]">
        <ResearchPanel
          title="DualLens comparison field"
          description="Financial scale and narrative evidence remain distinct until the decision layer."
          icon={ScanSearch}
          className="lens-field"
        >
          <div className="border-border bg-border grid gap-px overflow-hidden border md:grid-cols-2">
            <NavLink to="/financial" className="lens-surface lens-surface--financial">
              <div className="flex items-center justify-between gap-3">
                <BarChart3 aria-hidden="true" className="text-accent-blue size-5" />
                <span className="text-muted-foreground font-mono text-[0.6875rem]">
                  QUANTITATIVE
                </span>
              </div>
              <h2 className="mt-8 text-xl font-semibold">Financial Lens</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Compare the five-company academic snapshot without presenting historical values as
                live market data.
              </p>
              <div className="mt-6 space-y-2">
                {demoCompanies.slice(0, 3).map((company) => (
                  <div key={company.ticker} className="flex items-center gap-3 text-xs">
                    <span className="text-foreground w-12 font-mono">{company.ticker}</span>
                    <span className="bg-meter-track h-1.5 flex-1">
                      <span
                        className="bg-accent-blue block h-full"
                        style={{ width: `${(company.marketCapBillions / 5200.73) * 100}%` }}
                      />
                    </span>
                    <span className="text-muted-foreground w-16 text-right font-mono">
                      ${(company.marketCapBillions / 1000).toFixed(2)}T
                    </span>
                  </div>
                ))}
              </div>
            </NavLink>

            <NavLink to="/narrative" className="lens-surface lens-surface--narrative">
              <div className="flex items-center justify-between gap-3">
                <FileSearch aria-hidden="true" className="text-accent-violet size-5" />
                <span className="text-muted-foreground font-mono text-[0.6875rem]">EVIDENCE</span>
              </div>
              <h2 className="mt-8 text-xl font-semibold">Narrative Lens</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Trace company initiatives to document coverage while keeping the private corpus
                outside the public app.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {demoCompanies.map((company) => (
                  <span
                    key={company.ticker}
                    className="border-border bg-background/30 text-muted-foreground border px-2 py-1 font-mono text-xs"
                  >
                    {company.ticker} · {company.chunks}
                  </span>
                ))}
              </div>
            </NavLink>
          </div>
        </ResearchPanel>

        <ResearchPanel
          title="Confidence routing"
          description="Three measured signals, one review decision."
          icon={ShieldAlert}
        >
          <ConfidenceGauge score={experiment.confidence} compact />
          <p className="border-border text-muted-foreground mt-5 border-t pt-4 text-sm leading-6">
            The 62.5% held-out gold signal kept the recommendation below the 80-point client-ready
            threshold.
          </p>
          <NavLink to="/confidence" className="research-link mt-4">
            Explain the route <ArrowRight aria-hidden="true" className="size-4" />
          </NavLink>
        </ResearchPanel>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
        <ResearchPanel
          title="Question → answer → evidence"
          description="Precomputed academic run; no live inference."
          icon={BookOpenCheck}
          action={<Badge variant="success">Passed 5/5/5</Badge>}
        >
          <div className="answer-thread">
            <div>
              <p className="thread-label">Question · {leadQuestion.company}</p>
              <p className="mt-2 text-base leading-7 font-medium">{leadQuestion.question}</p>
            </div>
            <div className="answer-thread__response">
              <p className="thread-label">Recorded answer</p>
              <p className="text-foreground/90 mt-2 text-sm leading-6">{leadQuestion.answer}</p>
            </div>
          </div>
          <div className="mt-4">
            <EvidenceInspector
              evidence={leadQuestion.evidence}
              title="Inspectable source coverage"
            />
          </div>
        </ResearchPanel>

        <ResearchPanel
          title="Measured experiment evolution"
          description="The baseline and held-out split are separate evaluations."
          icon={FlaskConical}
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Gold baseline</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Full objective set · 20 questions
                  </p>
                </div>
                <span className="font-mono text-lg">11/20 · 55%</span>
              </div>
              <div className="bg-border mt-3 h-px" />
            </div>
            <div className="optimization-split">
              <div>
                <p className="thread-label">Held-out v1</p>
                <strong className="mt-2 block font-mono text-2xl">4/8 · 50%</strong>
              </div>
              <ArrowRight aria-hidden="true" className="text-accent-violet size-5" />
              <div>
                <p className="thread-label text-success">Held-out v2</p>
                <strong className="text-success mt-2 block font-mono text-2xl">5/8 · 62.5%</strong>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-6">
              GEPA corrected IBM Guardium. Trainium, Flamingo, and Quantum remained retrieval-bound
              failures.
            </p>
          </div>
        </ResearchPanel>
      </div>
    </div>
  );
}
