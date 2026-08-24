import { Scale, ShieldCheck, ShieldX } from "lucide-react";

import { ScoreRail } from "@/components/metrics/score-rail";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { experiment, judgeResults } from "@/data/demo";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalEvaluationView } from "./local-evaluation-view";

const dimensions = [
  {
    label: "Groundedness",
    definition: "Does the answer stay inside the supplied evidence?",
    catches: "Unsupported claims and hallucinated specifics",
  },
  {
    label: "Context relevance",
    definition: "Did retrieval supply context that answers the question?",
    catches: "Irrelevant or insufficient passages",
  },
  {
    label: "Answer relevance",
    definition: "Does the response directly address the question?",
    catches: "Evasive or incomplete answers",
  },
];

export function EvaluationPage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalEvaluationView />;
  return <DemoEvaluationView />;
}

function DemoEvaluationView() {
  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Evaluation lab / LLM-as-Judge"
        title="LLM-as-Judge"
        description="Three independent dimensions expose whether a plausible answer is actually grounded, supported by context, and relevant."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <ResearchPanel
          title="In-scope judge profile"
          description="Q4 is excluded because it intentionally probes safe abstention."
          icon={Scale}
        >
          <div className="space-y-7">
            {dimensions.map((dimension) => (
              <ScoreRail
                key={dimension.label}
                label={dimension.label}
                value={4}
                max={5}
                detail={`${dimension.definition} Catches: ${dimension.catches}.`}
              />
            ))}
          </div>
        </ResearchPanel>
        <aside className="judge-mean-panel">
          <p className="metric-label">Mean in scope</p>
          <strong className="mt-3 block font-mono text-5xl tracking-[-0.06em]">
            {experiment.judgeMean}%
          </strong>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            48 of 60 possible rubric points across Q1, Q2, Q3, and Q5.
          </p>
          <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-xs leading-5">
            A correct abstention can still score poorly under answer-relevance rubrics. The judge is
            a signal, not an oracle.
          </div>
        </aside>
      </div>

      <ResearchPanel
        title="Five-question judge harness"
        description="Scores are preserved exactly from evaluation_judge_results.csv."
      >
        <div className="overflow-x-auto">
          <table className="research-table min-w-[52rem]">
            <caption className="sr-only">LLM-as-Judge results for five academic questions</caption>
            <thead>
              <tr>
                <th>Question</th>
                <th>Grounded</th>
                <th>Context</th>
                <th>Answer</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {judgeResults.map((result) => (
                <tr key={result.id}>
                  <td>
                    <span className="text-accent-blue font-mono text-xs">{result.id}</span>
                    <span className="text-foreground ml-2">{result.question}</span>
                    <span className="text-muted-foreground mt-1 block max-w-2xl text-xs">
                      {result.answer}
                    </span>
                  </td>
                  {[result.groundedness, result.contextRelevance, result.answerRelevance].map(
                    (score, index) => (
                      <td key={index} className="font-mono">
                        {score}/5
                      </td>
                    ),
                  )}
                  <td>
                    <Badge variant={result.passAll ? "success" : "warning"}>
                      {result.passAll ? (
                        <span className="flex items-center gap-1">
                          <ShieldCheck aria-hidden="true" className="size-3" />
                          Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ShieldX aria-hidden="true" className="size-3" />
                          Review
                        </span>
                      )}
                    </Badge>
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
