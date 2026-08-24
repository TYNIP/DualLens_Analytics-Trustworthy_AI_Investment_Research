import { Filter, SearchX, Sparkles } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { experiment, goldSetResults } from "@/data/demo";
import type { FailureType } from "@/data/demo";
import { cn } from "@/lib/utils/cn";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalRetrievalView } from "./local-retrieval-view";

const filters: Array<{ value: "all" | FailureType; label: string }> = [
  { value: "all", label: "All 20" },
  { value: "retrieval", label: "Retrieval failures" },
  { value: "generation", label: "Generation failures" },
  { value: "none", label: "Exact hits" },
];

export function RetrievalPage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalRetrievalView />;
  return <DemoRetrievalView />;
}

function DemoRetrievalView() {
  const [filter, setFilter] = useState<"all" | FailureType>("all");
  const rows =
    filter === "all" ? goldSetResults : goldSetResults.filter((row) => row.failureType === filter);

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Evaluation lab / Retrieval"
        title="Retrieval Diagnostics"
        description="Separate missing context from answer-generation mistakes across the objective 20-question corpus probe."
      />

      <section className="diagnostic-metrics" aria-label="Retrieval metrics">
        <div>
          <span>Filtered hit rate</span>
          <strong>{experiment.filteredRetrievalHit}%</strong>
          <small>15 / 20 expected tokens reached context</small>
        </div>
        <div>
          <span>Unfiltered hit rate</span>
          <strong>{experiment.unfilteredRetrievalHit}%</strong>
          <small>Same objective hit rate</small>
        </div>
        <div>
          <span>Company purity</span>
          <strong>{experiment.companyPurity}%</strong>
          <small>Average without metadata filter</small>
        </div>
      </section>

      <div className="border-border bg-border grid gap-px border md:grid-cols-2">
        <div className="bg-background/65 p-5">
          <SearchX aria-hidden="true" className="text-warning size-5" />
          <h2 className="mt-4 text-base font-semibold">Retrieval failure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The expected token never reached the retrieved context. Prompt changes cannot recover
            absent evidence.
          </p>
        </div>
        <div className="bg-background/65 p-5">
          <Sparkles aria-hidden="true" className="text-accent-violet size-5" />
          <h2 className="mt-4 text-base font-semibold">Generation failure</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The evidence token was retrieved, but the v1 answer omitted or misstated it. This is
            where prompt optimization can help.
          </p>
        </div>
      </div>

      <ResearchPanel
        title="Objective diagnostic matrix"
        description="Retrieval status from notebook Step 3; exact answers from the saved v1 gold-set artifact."
        icon={Filter}
        action={
          <div className="flex flex-wrap gap-1" role="group" aria-label="Diagnostic filter">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
                className={cn(
                  "focus-visible:ring-ring min-h-9 rounded-sm px-2.5 text-xs focus-visible:ring-2 focus-visible:outline-none",
                  filter === item.value
                    ? "bg-accent-blue/12 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      >
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="research-table min-w-[54rem]">
              <caption className="sr-only">Retrieval and generation diagnostic results</caption>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Expected evidence</th>
                  <th>Retrieval</th>
                  <th>Purity</th>
                  <th>Answer</th>
                  <th>Diagnostic</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.ticker}-${row.expected}`}>
                    <td className="text-foreground font-mono">{row.ticker}</td>
                    <td>
                      <span className="text-foreground font-mono">{row.expected}</span>
                      <span className="text-muted-foreground mt-1 block max-w-xs text-xs">
                        {row.question}
                      </span>
                    </td>
                    <td>
                      <Badge variant={row.retrievalHit ? "success" : "warning"}>
                        {row.retrievalHit ? "Hit" : "Miss"}
                      </Badge>
                    </td>
                    <td className="font-mono">{Math.round(row.purity * 100)}%</td>
                    <td className="max-w-xs text-xs leading-5">{row.answer}</td>
                    <td>
                      <Badge variant={row.failureType === "none" ? "success" : "warning"}>
                        {row.failureType === "none" ? "Exact hit" : `${row.failureType} failure`}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm font-medium">No results in this diagnostic state</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Choose another filter to inspect the saved run.
            </p>
          </div>
        )}
      </ResearchPanel>
    </div>
  );
}
