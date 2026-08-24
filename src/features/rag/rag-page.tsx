import { Bot, Search, Send, ShieldCheck, ShieldX } from "lucide-react";
import { useMemo, useState } from "react";

import { EvidenceInspector } from "@/components/evidence/evidence-inspector";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoQuestions } from "@/data/demo";
import { cn } from "@/lib/utils/cn";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalRagView } from "./local-rag-view";

export function RagPage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalRagView />;
  return <DemoRagView />;
}

function DemoRagView() {
  const [selectedId, setSelectedId] = useState(demoQuestions[0]!.id);
  const [freeForm, setFreeForm] = useState("");
  const [notice, setNotice] = useState(false);
  const selected = useMemo(
    () => demoQuestions.find((question) => question.id === selectedId) ?? demoQuestions[0]!,
    [selectedId],
  );
  const judgeValues = Object.values(selected.judges).filter(
    (value): value is number => value !== null,
  );

  function submitFreeForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (freeForm.trim()) setNotice(true);
  }

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Research lenses / RAG Assistant"
        title="RAG Assistant"
        description="Replay curated outputs from the executed notebook. Demo Mode never generates a new answer or calls an external model."
      >
        <Badge variant="warning">Precomputed only</Badge>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <ResearchPanel
          title="Academic queries"
          description="Select a recorded success, correction, or failure."
          icon={Search}
        >
          <div className="space-y-1.5" role="group" aria-label="Precomputed questions">
            {demoQuestions.map((question) => (
              <button
                key={question.id}
                type="button"
                aria-pressed={question.id === selectedId}
                onClick={() => {
                  setSelectedId(question.id);
                  setNotice(false);
                }}
                className={cn(
                  "focus-visible:ring-ring w-full border-l-2 px-3 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none",
                  question.id === selectedId
                    ? "border-accent-blue bg-accent-blue/8 text-foreground"
                    : "text-muted-foreground hover:border-border-strong hover:bg-surface-elevated/60 hover:text-foreground border-transparent",
                )}
              >
                <span className="text-accent-blue font-mono text-[0.6875rem]">
                  {question.company}
                </span>
                <span className="mt-1 block text-xs leading-5">{question.question}</span>
              </button>
            ))}
          </div>
        </ResearchPanel>

        <div className="space-y-4">
          <ResearchPanel
            title="Recorded answer"
            description={selected.source}
            icon={Bot}
            action={
              <Badge variant={selected.status === "failed" ? "warning" : "success"}>
                {selected.status === "observed" ? "Not judge-scored" : selected.status}
              </Badge>
            }
          >
            <div className="answer-thread">
              <div>
                <p className="thread-label">Question · {selected.company}</p>
                <p className="mt-2 text-base leading-7 font-medium">{selected.question}</p>
              </div>
              <div className="answer-thread__response">
                <p className="thread-label">Precomputed answer</p>
                <p className="text-foreground/90 mt-2 text-sm leading-6">{selected.answer}</p>
              </div>
              {judgeValues.length ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected.judges).map(([key, value]) => (
                    <span
                      key={key}
                      className="border-border text-muted-foreground flex items-center gap-1.5 border px-2 py-1 font-mono text-[0.6875rem]"
                    >
                      {value !== null && value >= 4 ? (
                        <ShieldCheck aria-hidden="true" className="text-success size-3" />
                      ) : (
                        <ShieldX aria-hidden="true" className="text-warning size-3" />
                      )}
                      {key.replace(/([A-Z])/g, " $1")} {value ?? "n/a"}/5
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </ResearchPanel>

          <EvidenceInspector evidence={selected.evidence} />
        </div>
      </div>

      <ResearchPanel
        title="Ask a different question"
        description="Free-form inference is intentionally unavailable in Demo Mode."
        icon={Send}
      >
        <form onSubmit={submitFreeForm} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="demo-question">
            Free-form research question
          </label>
          <input
            id="demo-question"
            value={freeForm}
            onChange={(event) => {
              setFreeForm(event.target.value);
              setNotice(false);
            }}
            placeholder="Type a question to check Demo Mode behavior"
            className="border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-12 flex-1 rounded-md border px-3 text-base focus-visible:ring-2 focus-visible:outline-none sm:text-sm"
          />
          <Button type="submit" disabled={!freeForm.trim()}>
            Check availability
          </Button>
        </form>
        {notice ? (
          <div
            role="status"
            className="border-accent-violet bg-accent-violet/8 text-muted-foreground mt-4 border-l-2 p-4 text-sm leading-6"
          >
            <strong className="text-foreground">No answer was generated.</strong> Free-form local
            inference becomes available in Local AI Mode. Demo Mode reproduces only selected results
            from the academic experiment.
          </div>
        ) : null}
      </ResearchPanel>
    </div>
  );
}
