import { CheckCircle2, FileText, Link2, MinusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface EvidenceViewRecord {
  id: string;
  rank: number;
  company: string;
  document: string;
  pageLabel: string;
  chunkId: string | null;
  score: number | null;
  text: string;
  contributed: boolean;
  provenance: "notebook-output" | "corpus-coverage" | "local-retrieval";
}

interface EvidenceInspectorProps {
  evidence: EvidenceViewRecord[];
  title?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function EvidenceInspector({
  evidence,
  title = "Evidence trail",
  selectedId,
  onSelect,
}: EvidenceInspectorProps) {
  return (
    <section aria-labelledby="evidence-title" className="evidence-inspector">
      <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Link2 aria-hidden="true" className="text-accent-violet size-4" />
          <h2 id="evidence-title" className="text-sm font-semibold">
            {title}
          </h2>
        </div>
        <span className="text-muted-foreground font-mono text-xs">
          {evidence.length} source record(s)
        </span>
      </div>
      <ol className="divide-border divide-y">
        {evidence.map((item) => (
          <li
            key={item.id}
            className={cn(
              "evidence-row relative grid gap-3 px-4 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto]",
              selectedId === item.id && "bg-accent-blue/8",
              onSelect && "cursor-pointer",
            )}
            onClick={() => onSelect?.(item.id)}
            onKeyDown={(event) => {
              if (onSelect && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
          >
            <span className="evidence-rank border-border text-muted-foreground grid size-8 place-items-center rounded-full border font-mono text-xs">
              {item.rank}
            </span>
            <div className="min-w-0">
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                <FileText aria-hidden="true" className="size-3.5" />
                <span className="text-foreground font-medium">{item.document}</span>
                <span>·</span>
                <span>{item.pageLabel}</span>
                <Badge variant="outline">{item.company}</Badge>
              </div>
              <p className="text-foreground/90 mt-2 text-sm leading-6">{item.text}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                {item.provenance === "local-retrieval"
                  ? "Retrieved locally from the browser index. Document text was not sent to an inference API."
                  : item.provenance === "corpus-coverage"
                    ? "Page coverage verified from the private corpus; exact retrieved page and score were not persisted."
                    : "Recorded in the executed notebook output."}
              </p>
            </div>
            <div className="flex items-start gap-2 sm:flex-col sm:items-end">
              <span className="text-muted-foreground font-mono text-xs">
                {item.score === null ? "score n/a" : item.score.toFixed(2)}
              </span>
              <span
                className={
                  item.contributed
                    ? "text-success flex items-center gap-1 text-xs"
                    : "text-warning flex items-center gap-1 text-xs"
                }
              >
                {item.contributed ? (
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                ) : (
                  <MinusCircle aria-hidden="true" className="size-3.5" />
                )}
                {item.provenance === "local-retrieval"
                  ? item.contributed
                    ? "Referenced evidence"
                    : "Retrieved evidence"
                  : item.contributed
                    ? "Supports answer"
                    : "Context gap"}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
