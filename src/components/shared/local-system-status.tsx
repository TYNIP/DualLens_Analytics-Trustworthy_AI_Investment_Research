import { Cpu, Database, FileCheck2, Orbit } from "lucide-react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { Badge } from "@/components/ui/badge";

export function LocalSystemStatus() {
  const { capabilities, counts, embeddingState, modelState } = useLocalRuntime();
  const signals = [
    {
      label: "IndexedDB",
      ready: capabilities?.indexedDB ?? false,
      value: capabilities ? (capabilities.indexedDB ? "Ready" : "Unavailable") : "Checking",
      icon: Database,
    },
    {
      label: "Embedding model",
      ready: embeddingState === "ready",
      value: embeddingState,
      icon: Orbit,
    },
    {
      label: "WebGPU",
      ready: capabilities?.webGPU ?? false,
      value: capabilities ? (capabilities.webGPU ? "Available" : "Retrieval only") : "Checking",
      icon: Cpu,
    },
    {
      label: "Indexed documents",
      ready: counts.documents > 0 && counts.chunks > 0,
      value: `${counts.documents} · ${counts.chunks} chunks`,
      icon: FileCheck2,
    },
  ];

  return (
    <section className="local-status-strip" aria-label="Local AI system status">
      {signals.map((signal) => {
        const Icon = signal.icon;
        return (
          <div key={signal.label}>
            <Icon
              aria-hidden="true"
              className={signal.ready ? "text-success size-4" : "text-muted-foreground size-4"}
            />
            <span>
              <small>{signal.label}</small>
              <strong>{signal.value}</strong>
            </span>
          </div>
        );
      })}
      <Badge variant={modelState.status === "ready" ? "success" : "outline"}>
        Model · {modelState.status}
      </Badge>
    </section>
  );
}
