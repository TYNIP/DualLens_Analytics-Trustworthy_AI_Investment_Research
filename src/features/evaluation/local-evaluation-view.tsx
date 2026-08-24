import { Activity, ShieldCheck } from "lucide-react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";

export function LocalEvaluationView() {
  const { lastRun } = useLocalRuntime();
  const diagnostics = lastRun?.diagnostics;
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Evaluation lab / Local diagnostics"
        title="Local Runtime Evaluation"
        description="Deterministic runtime signals for the latest local research run. These are not LLM-as-Judge scores."
        snapshot={false}
      />
      <LocalSystemStatus />
      {diagnostics ? (
        <div className="local-evaluation-ledger">
          {[
            ["Retrieval sufficiency", diagnostics.retrievalSufficient ? "Pass" : "Fail"],
            ["Evidence count", String(diagnostics.evidenceCount)],
            ["Citation coverage", `${Math.round(diagnostics.citationCoverage * 100)}%`],
            ["Company purity", `${Math.round(diagnostics.companyPurity * 100)}%`],
            ["Guardrail", diagnostics.guardrailTriggered ? "Triggered" : "Not triggered"],
            ["Retrieval latency", `${Math.round(diagnostics.retrievalLatencyMs)} ms`],
            [
              "Generation latency",
              diagnostics.generationLatencyMs === undefined
                ? "Not generated"
                : `${Math.round(diagnostics.generationLatencyMs)} ms`,
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <ResearchPanel
          title="No local run available"
          description="Generate or guard a local answer to record diagnostics."
          icon={Activity}
        >
          <p className="text-muted-foreground text-sm">
            Academic judge scores remain available by returning to Demo Mode.
          </p>
        </ResearchPanel>
      )}
      <ResearchPanel
        title="What these metrics establish"
        description="Deterministic inspection rather than a synthetic quality score."
        icon={ShieldCheck}
      >
        <p className="text-muted-foreground text-sm leading-6">
          DualLens can verify retrieval scope, source references, abstention behavior, and latency.
          It cannot honestly infer semantic correctness without a user-defined gold set or an
          independent evaluator.
        </p>
      </ResearchPanel>
    </div>
  );
}
