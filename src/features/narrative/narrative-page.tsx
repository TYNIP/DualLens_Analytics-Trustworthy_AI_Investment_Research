import { FileSearch, Layers3 } from "lucide-react";
import { useState } from "react";

import { CompanySelector } from "@/components/shared/company-selector";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { demoCompanyByTicker, experiment } from "@/data/demo";
import type { DemoTicker } from "@/data/demo";
import { useAppMode } from "@/app/providers/app-mode-provider";

import { LocalNarrativeView } from "./local-narrative-view";

export function NarrativePage() {
  const { mode } = useAppMode();
  if (mode === "local-ai") return <LocalNarrativeView />;
  return <DemoNarrativeView />;
}

function DemoNarrativeView() {
  const [ticker, setTicker] = useState<DemoTicker>("NVDA");
  const company = demoCompanyByTicker[ticker];

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Research lenses / Narrative"
        title="Narrative Lens"
        description="Inspect which initiatives appear in each company document and where the private source corpus provides coverage."
      >
        <CompanySelector value={ticker} onChange={setTicker} />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(17rem,0.62fr)_minmax(0,1.38fr)]">
        <ResearchPanel
          title="Corpus coverage"
          description={`${company.ticker}.pdf · private course source`}
          icon={Layers3}
        >
          <div className="border-border bg-border grid grid-cols-2 gap-px border">
            <div className="bg-background/60 p-4">
              <p className="metric-label">Pages</p>
              <strong className="mt-2 block font-mono text-2xl">{company.pages}</strong>
            </div>
            <div className="bg-background/60 p-4">
              <p className="metric-label">Chunks</p>
              <strong className="mt-2 block font-mono text-2xl">{company.chunks}</strong>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            {experiment.pages} pages produced {experiment.chunks} company-tagged chunks across the
            full corpus.
          </p>
          <div className="border-border mt-5 border-t pt-4">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
              Coverage map
            </p>
            <ol className="mt-3 space-y-1">
              {company.initiatives.map((initiative, index) => (
                <li
                  key={initiative.name}
                  className="border-border/60 grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 border-b py-3 last:border-0"
                >
                  <span className="text-muted-foreground font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground text-sm">{initiative.name}</span>
                  <span className="text-muted-foreground font-mono text-[0.6875rem]">
                    p.{initiative.pages.join(",")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </ResearchPanel>

        <div className="space-y-4">
          <ResearchPanel
            title={`Evidence focus · ${company.evidence.initiative}`}
            description="Short paraphrase; complete course documents remain private."
            icon={FileSearch}
            action={<Badge variant="outline">p.{company.evidence.page}</Badge>}
          >
            <blockquote className="evidence-quote">
              <p>{company.evidence.paraphrase}</p>
              <footer className="text-muted-foreground mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
                <span>{company.ticker}.pdf</span>
                <span>·</span>
                <span>page {company.evidence.page}</span>
                <span>·</span>
                <span>corpus verified</span>
              </footer>
            </blockquote>
          </ResearchPanel>

          <ResearchPanel
            title="Why metadata matters"
            description="Evidence remains isolated by company before generation."
          >
            <div className="metadata-flow">
              <div>
                <span>Question</span>
                <strong>{company.ticker}</strong>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <span>Filter</span>
                <strong>company = {company.ticker}</strong>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <span>Context</span>
                <strong>{company.chunks} eligible chunks</strong>
              </div>
            </div>
            <p className="text-muted-foreground mt-5 text-sm leading-6">
              The academic run reached 96% company purity even without filtering. The metadata
              boundary makes isolation explicit rather than probabilistic.
            </p>
          </ResearchPanel>
        </div>
      </div>
    </div>
  );
}
