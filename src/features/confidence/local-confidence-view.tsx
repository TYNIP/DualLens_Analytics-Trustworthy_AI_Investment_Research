import { Gauge, ShieldAlert } from "lucide-react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";

export function LocalConfidenceView() {
  const { lastRun } = useLocalRuntime();
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Decision layer / Local diagnostics"
        title="Local Runtime Diagnostics"
        description="Local workspaces do not inherit the academic 79/100 score. Inspect operational evidence without fabricated precision."
        snapshot={false}
      />
      <LocalSystemStatus />
      <div className="grid gap-4 xl:grid-cols-2">
        <ResearchPanel
          title="No synthetic confidence score"
          description="Academic and local evidence have different evaluation contracts."
          icon={Gauge}
        >
          <p className="text-muted-foreground text-sm leading-6">
            The academic route combined held-out accuracy, judge scores, and ranking groundedness.
            Uploaded documents have no equivalent gold set, so DualLens reports transparent runtime
            signals instead of manufacturing a percentage.
          </p>
        </ResearchPanel>
        <ResearchPanel
          title="Latest local route"
          description={lastRun ? new Date(lastRun.createdAt).toLocaleString() : "No saved run"}
          icon={ShieldAlert}
        >
          {lastRun?.diagnostics ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Retrieval heuristic</dt>
                <dd>{lastRun.diagnostics.retrievalSufficient ? "Passed" : "Failed"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Guardrail</dt>
                <dd>
                  {lastRun.diagnostics.guardrailTriggered ? "I don't know." : "Not triggered"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Referenced evidence</dt>
                <dd>
                  {lastRun.diagnostics.referencedEvidenceCount}/{lastRun.diagnostics.evidenceCount}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">Run a local research question first.</p>
          )}
        </ResearchPanel>
      </div>
    </div>
  );
}
