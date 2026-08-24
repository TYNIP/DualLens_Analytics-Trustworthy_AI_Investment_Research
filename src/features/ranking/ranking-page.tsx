import { Scale, Trophy } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AcademicOnlyNotice } from "@/components/shared/academic-only-notice";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { demoCompanies, experiment } from "@/data/demo";

export function RankingPage() {
  const ranked = [...demoCompanies].sort((a, b) => a.rank - b.rank);

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Decision layer / Fused ranking"
        title="Fused Ranking"
        description="The final academic synthesis combines the financial snapshot with narrative evidence, then checks whether every ranked rationale remains grounded."
      >
        <Badge variant="success">Groundedness {experiment.rankingGroundedness}%</Badge>
      </PageHeader>

      <AcademicOnlyNotice>
        Arbitrary local documents do not contain the comparable financial inputs required for a
        responsible fused investment ranking.
      </AcademicOnlyNotice>

      <div className="ranking-ledger">
        {ranked.map((company) => (
          <article key={company.ticker} className="ranking-row">
            <div className="ranking-row__rank">
              <span>Rank</span>
              <strong>{company.rank}</strong>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-base font-semibold">{company.name}</h2>
                <span className="text-accent-blue font-mono text-xs">{company.ticker}</span>
              </div>
              <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
                {company.rationale}
              </p>
              <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
                <span>Market cap ${company.marketCapBillions.toLocaleString()}B</span>
                <span>P/E {company.peRatio.toFixed(2)}x</span>
                <span>{company.chunks} evidence chunks</span>
              </div>
            </div>
            <div className="ranking-row__evidence">
              <Scale aria-hidden="true" className="text-success size-4" />
              <span>Included in 5/5 grounding check</span>
            </div>
          </article>
        ))}
      </div>

      <ResearchPanel
        title="Evidence contract"
        description="What the 5/5 ranking-groundedness result does—and does not—mean."
        icon={Trophy}
      >
        <div className="border-border bg-border grid gap-px border md:grid-cols-3">
          <div className="bg-background/65 p-4">
            <p className="thread-label">Verified</p>
            <p className="mt-2 text-sm leading-6">
              Every company rationale in the final recommendation adhered to the supplied evidence
              contract.
            </p>
          </div>
          <div className="bg-background/65 p-4">
            <p className="thread-label">Caveated</p>
            <p className="mt-2 text-sm leading-6">
              The synthesis explicitly recorded that IBM's evidence was comparatively thin.
            </p>
          </div>
          <div className="bg-background/65 p-4">
            <p className="thread-label">Not claimed</p>
            <p className="mt-2 text-sm leading-6">
              Groundedness does not prove future performance or make this ranking investment advice.
            </p>
          </div>
        </div>
      </ResearchPanel>

      <p className="text-muted-foreground text-xs">
        Research demonstration only — not financial advice.
      </p>
    </div>
  );
}
