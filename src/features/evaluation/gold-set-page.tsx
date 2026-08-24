import { BookOpenCheck, CircleCheck, CircleX } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AcademicOnlyNotice } from "@/components/shared/academic-only-notice";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { demoCompanies, experiment, goldSetResults } from "@/data/demo";

export function GoldSetPage() {
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Evaluation lab / Gold set"
        title="Gold Set Results"
        description="Twenty verified expected tokens provide a deterministic counterweight to subjective model judging."
      />

      <AcademicOnlyNotice>
        Uploaded workspaces do not inherit this course-defined Gold Set. Local runs expose only
        deterministic runtime diagnostics.
      </AcademicOnlyNotice>

      <div className="gold-summary">
        <div>
          <p className="metric-label">Objective baseline</p>
          <strong>
            {experiment.baselineCorrect}
            <span>/{experiment.baselineTotal}</span>
          </strong>
        </div>
        <div>
          <p className="metric-label">Exact accuracy</p>
          <strong>
            {experiment.baselineAccuracy}
            <span>%</span>
          </strong>
        </div>
        <div className="gold-summary__context">
          <p>Why it matters</p>
          <span>
            Eleven exact hits established the measurable baseline that later prompt optimization had
            to improve without seeing the held-out split.
          </span>
        </div>
      </div>

      <ResearchPanel
        title="Company breakdown"
        description="Four questions per company; exact substring criterion."
        icon={BookOpenCheck}
      >
        <div className="border-border bg-border grid gap-px border sm:grid-cols-5">
          {demoCompanies.map((company) => {
            const rows = goldSetResults.filter((row) => row.ticker === company.ticker);
            const hits = rows.filter((row) => row.exactHit).length;
            return (
              <div key={company.ticker} className="bg-background/65 p-4">
                <span className="text-accent-blue font-mono text-xs">{company.ticker}</span>
                <strong className="mt-3 block font-mono text-2xl">{hits}/4</strong>
                <span className="text-muted-foreground mt-1 block text-xs">{hits * 25}% exact</span>
              </div>
            );
          })}
        </div>
      </ResearchPanel>

      <ResearchPanel
        title="Question-level evidence"
        description="Expand a row to compare the expected token, saved answer, and failure origin."
      >
        <div className="divide-border border-border divide-y border-y">
          {goldSetResults.map((result, index) => (
            <details
              key={`${result.ticker}-${result.expected}`}
              className="diagnostic-detail group"
            >
              <summary className="grid min-h-14 cursor-pointer list-none items-center gap-3 py-3 sm:grid-cols-[3rem_4rem_minmax(0,1fr)_7rem]">
                <span className="text-muted-foreground font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-accent-blue font-mono text-xs">{result.ticker}</span>
                <span className="text-foreground text-sm">{result.question}</span>
                <span
                  className={
                    result.exactHit
                      ? "text-success flex items-center gap-1 text-xs"
                      : "text-warning flex items-center gap-1 text-xs"
                  }
                >
                  {result.exactHit ? (
                    <CircleCheck aria-hidden="true" className="size-4" />
                  ) : (
                    <CircleX aria-hidden="true" className="size-4" />
                  )}
                  {result.exactHit ? "Correct" : "Incorrect"}
                </span>
              </summary>
              <div className="grid gap-4 pb-5 pl-0 sm:grid-cols-3 sm:pl-24">
                <div>
                  <p className="thread-label">Expected</p>
                  <p className="mt-2 font-mono text-sm">{result.expected}</p>
                </div>
                <div>
                  <p className="thread-label">System answer</p>
                  <p className="mt-2 text-sm leading-6">{result.answer}</p>
                </div>
                <div>
                  <p className="thread-label">Failure analysis</p>
                  <Badge
                    className="mt-2"
                    variant={result.failureType === "none" ? "success" : "warning"}
                  >
                    {result.failureType === "none" ? "Exact hit" : `${result.failureType} failure`}
                  </Badge>
                </div>
              </div>
            </details>
          ))}
        </div>
      </ResearchPanel>
    </div>
  );
}
