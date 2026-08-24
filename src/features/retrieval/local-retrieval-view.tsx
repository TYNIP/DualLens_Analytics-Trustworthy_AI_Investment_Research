import { Gauge, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { EvidenceInspector } from "@/components/evidence/evidence-inspector";
import { LocalSystemStatus } from "@/components/shared/local-system-status";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { toLocalEvidence } from "@/lib/evidence/local-evidence";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import type { ResearchDocument } from "@/types/domain";

export function LocalRetrievalView() {
  const { lastRetrieval, lastRun } = useLocalRuntime();
  const [documentsRepo] = useState(() => new DocumentRepository());
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);

  useEffect(() => {
    void documentsRepo.list().then(setDocuments);
  }, [documentsRepo]);

  const documentMap = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );
  const referenced = new Set(lastRun?.citations.map((citation) => citation.chunkId) ?? []);
  const evidence = toLocalEvidence(lastRetrieval, "LOCAL", documentMap, referenced);
  const topScore = lastRetrieval[0]?.score;

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Evaluation lab / Local retrieval"
        title="Retrieval Diagnostics"
        description="Inspect the latest company-scoped cosine search without mixing it with the academic retrieval benchmark."
        snapshot={false}
      />
      <LocalSystemStatus />
      {lastRetrieval.length ? (
        <>
          <section className="diagnostic-metrics" aria-label="Local retrieval diagnostics">
            <div>
              <span>Top cosine similarity</span>
              <strong>{topScore?.toFixed(3)}</strong>
              <small>Similarity, not model confidence</small>
            </div>
            <div>
              <span>Sufficiency heuristic</span>
              <strong>
                {lastRun?.diagnostics
                  ? lastRun.diagnostics.retrievalSufficient
                    ? "Pass"
                    : "Fail"
                  : "Not recorded"}
              </strong>
              <small>Top result threshold ≥ 0.300</small>
            </div>
            <div>
              <span>Retrieval latency</span>
              <strong>
                {lastRun?.diagnostics
                  ? `${Math.round(lastRun.diagnostics.retrievalLatencyMs)} ms`
                  : "n/a"}
              </strong>
              <small>Runtime signal, not quality</small>
            </div>
          </section>
          <EvidenceInspector evidence={evidence} title="Latest local top-k" />
        </>
      ) : (
        <ResearchPanel
          title="No local query inspected yet"
          description="Retrieve evidence from the Local AI RAG Assistant to populate this diagnostic surface."
          icon={SearchX}
        >
          <p className="text-muted-foreground text-sm leading-6">
            The diagnostic remains empty instead of substituting academic scores or illustrative
            similarity values.
          </p>
        </ResearchPanel>
      )}
      <ResearchPanel
        title="Heuristic boundary"
        description="Local retrieval sufficiency is deliberately separate from the academic 79/100 confidence route."
        icon={Gauge}
      >
        <p className="text-muted-foreground text-sm leading-6">
          Generation is skipped when no evidence is retrieved or the top cosine similarity is below
          0.300. This is a documented operational guardrail, not a scientifically calibrated
          confidence estimate.
        </p>
      </ResearchPanel>
    </div>
  );
}
