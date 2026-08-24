import { ArrowRight, CheckCircle2, FlaskConical, SearchX } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AcademicOnlyNotice } from "@/components/shared/academic-only-notice";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { heldOutResults, promptV1, promptV2Summary } from "@/data/demo";

export function OptimizationPage() {
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Evaluation lab / GEPA"
        title="GEPA Optimization"
        description="A measured prompt-program revision informed by failures and evaluated on eight held-out questions the optimizer did not train on."
      />

      <AcademicOnlyNotice>
        The DSPy and GEPA optimization experiment is preserved from the academic implementation; it
        is not executed in the browser.
      </AcademicOnlyNotice>

      <ol className="optimization-flow" aria-label="Optimization process">
        {[
          ["01", "Prompt v1"],
          ["02", "Failure analysis"],
          ["03", "DSPy + GEPA"],
          ["04", "Prompt v2"],
          ["05", "Held-out evaluation"],
        ].map(([number, label], index, items) => (
          <li key={number}>
            <span>{number}</span>
            <strong>{label}</strong>
            {index < items.length - 1 ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 xl:grid-cols-2">
        <ResearchPanel
          title="Prompt / program v1"
          description="Original instruction boundary"
          icon={SearchX}
        >
          <pre className="prompt-surface whitespace-pre-wrap">{promptV1}</pre>
          <div className="border-border mt-5 flex items-end justify-between gap-4 border-t pt-4">
            <div>
              <p className="metric-label">Held-out result</p>
              <p className="text-muted-foreground mt-1 text-xs">Before optimization</p>
            </div>
            <strong className="font-mono text-2xl">4/8 · 50%</strong>
          </div>
        </ResearchPanel>

        <ResearchPanel
          title="Prompt / program v2"
          description="GEPA-evolved instruction pattern"
          icon={FlaskConical}
          action={<Badge variant="success">Optimized</Badge>}
        >
          <ol className="space-y-3">
            {promptV2Summary.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-6">
                <span className="text-success font-mono text-xs">0{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <div className="border-success/25 mt-5 flex items-end justify-between gap-4 border-t pt-4">
            <div>
              <p className="metric-label text-success">Held-out result</p>
              <p className="text-muted-foreground mt-1 text-xs">After optimization</p>
            </div>
            <strong className="text-success font-mono text-2xl">5/8 · 62.5%</strong>
          </div>
        </ResearchPanel>
      </div>

      <div className="improvement-callout">
        <span className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
          Held-out improvement
        </span>
        <strong className="text-success font-mono text-3xl">+12.5 pp</strong>
        <p>
          One additional exact hit on eight unseen questions. This is a 12.5 percentage-point
          improvement, not a 12.5% relative claim.
        </p>
      </div>

      <ResearchPanel
        title="Held-out comparison"
        description="IBM Guardium was corrected; three context-bound misses remained."
      >
        <div className="overflow-x-auto">
          <table className="research-table min-w-[52rem]">
            <caption className="sr-only">Held-out v1 and v2 optimization results</caption>
            <thead>
              <tr>
                <th>Company</th>
                <th>Expected</th>
                <th>v1</th>
                <th>v2 answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {heldOutResults.map((result) => (
                <tr key={`${result.ticker}-${result.expected}`}>
                  <td className="text-foreground font-mono">{result.ticker}</td>
                  <td>
                    <span className="text-foreground font-mono">{result.expected}</span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {result.question}
                    </span>
                  </td>
                  <td>
                    <Badge variant={result.v1Hit ? "success" : "warning"}>
                      {result.v1Hit ? "Hit" : "Miss"}
                    </Badge>
                  </td>
                  <td className="max-w-md text-xs leading-5">{result.v2Answer}</td>
                  <td>
                    {result.v2Hit && !result.v1Hit ? (
                      <span className="text-success flex items-center gap-1 text-xs">
                        <CheckCircle2 aria-hidden="true" className="size-4" />
                        Fixed
                      </span>
                    ) : result.v2Hit ? (
                      <span className="text-muted-foreground text-xs">Retained</span>
                    ) : (
                      <span className="text-warning text-xs">Still missing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ResearchPanel>
    </div>
  );
}
