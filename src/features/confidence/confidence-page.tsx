import { AlertTriangle, CheckCircle2, ShieldAlert, StopCircle } from "lucide-react";

import { ConfidenceGauge } from "@/components/metrics/confidence-gauge";
import { ScoreRail } from "@/components/metrics/score-rail";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { experiment } from "@/data/demo";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalConfidenceView } from "./local-confidence-view";

export function ConfidencePage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalConfidenceView />;
  return <DemoConfidenceView />;
}

function DemoConfidenceView() {
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Decision layer / Confidence"
        title="Confidence Routing"
        description="Aggregate objective accuracy, judge quality, and ranking groundedness—then refuse automatic trust when the combined evidence remains below policy."
      />

      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <ResearchPanel
          title="Final academic route"
          description="Executed notebook output"
          icon={ShieldAlert}
        >
          <ConfidenceGauge score={experiment.confidence} />
          <p className="border-border text-muted-foreground mt-6 border-t pt-4 text-center text-sm leading-6">
            Deliver only after a human reviews the flagged evidence and residual misses.
          </p>
        </ResearchPanel>

        <ResearchPanel
          title="Weighted trust signals"
          description="The exact 40 / 30 / 30 policy recorded in the notebook."
        >
          <div className="space-y-7">
            <ScoreRail
              label="Held-out gold accuracy"
              value={experiment.heldOutV2Accuracy}
              detail="Weight 40% · 5/8 exact on unseen questions"
            />
            <ScoreRail
              label="Judge harness mean"
              value={experiment.judgeMean}
              detail="Weight 30% · Q4 safe-abstention probe excluded"
            />
            <ScoreRail
              label="Ranking groundedness"
              value={experiment.rankingGroundedness}
              detail="Weight 30% · final ranking scored 5/5"
            />
          </div>
          <div className="confidence-equation mt-7">
            <span>0.40 × 62.5</span>
            <span>+</span>
            <span>0.30 × 80</span>
            <span>+</span>
            <span>0.30 × 100</span>
            <strong>= 79.0</strong>
          </div>
        </ResearchPanel>
      </div>

      <section aria-labelledby="routing-policy-title">
        <div className="mb-3">
          <h2 id="routing-policy-title" className="text-sm font-semibold">
            Routing policy
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Color accompanies explicit labels and thresholds.
          </p>
        </div>
        <div className="routing-policy">
          <div>
            <CheckCircle2 aria-hidden="true" className="text-success" />
            <strong>CLIENT READY</strong>
            <span>80–100</span>
            <p>Delivery may proceed with routine monitoring.</p>
          </div>
          <div className="is-current">
            <AlertTriangle aria-hidden="true" className="text-warning" />
            <strong>FLAGGED</strong>
            <span>60–79</span>
            <p>Human review is required before delivery.</p>
          </div>
          <div>
            <StopCircle aria-hidden="true" className="text-danger" />
            <strong>HUMAN REVIEW</strong>
            <span>0–59</span>
            <p>Do not deliver until failures are corrected.</p>
          </div>
        </div>
      </section>

      <div className="border-warning bg-warning/7 border-l-2 p-5">
        <p className="text-sm font-semibold">Why not automatically trust this result?</p>
        <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
          A fully grounded ranking cannot compensate for a 62.5% held-out answer score. Confidence
          routing preserves that tension instead of averaging it away behind a polished
          recommendation.
        </p>
      </div>
    </div>
  );
}
