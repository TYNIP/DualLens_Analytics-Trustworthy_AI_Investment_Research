import { BarChart3, Info } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CompanySelector } from "@/components/shared/company-selector";
import { AcademicOnlyNotice } from "@/components/shared/academic-only-notice";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { demoCompanies, demoCompanyByTicker } from "@/data/demo";
import type { DemoTicker } from "@/data/demo";
import { cn } from "@/lib/utils/cn";

type MetricKey = "marketCapBillions" | "peRatio" | "revenueBillions";

const metrics: Array<{ key: MetricKey; label: string; short: string; unit: string }> = [
  { key: "marketCapBillions", label: "Market capitalization", short: "Market cap", unit: "$B" },
  { key: "peRatio", label: "Price-to-earnings ratio", short: "P/E", unit: "x" },
  { key: "revenueBillions", label: "Total revenue", short: "Revenue", unit: "$B" },
];

export function FinancialPage() {
  const [ticker, setTicker] = useState<DemoTicker>("GOOGL");
  const [metric, setMetric] = useState<MetricKey>("marketCapBillions");
  const company = demoCompanyByTicker[ticker];
  const activeMetric = metrics.find((item) => item.key === metric) ?? metrics[0]!;
  const chartData = demoCompanies.map((item) => ({ ticker: item.ticker, value: item[metric] }));

  return (
    <div className="route-enter space-y-6">
      <PageHeader
        eyebrow="Research lenses / Financial"
        title="Financial Lens"
        description="Compare the quantitative snapshot captured by the academic notebook. These values are historical experiment inputs, not live market data."
      >
        <CompanySelector value={ticker} onChange={setTicker} />
      </PageHeader>

      <AcademicOnlyNotice>
        Local AI analyzes uploaded narrative evidence; the Financial Lens remains the historical
        five-company academic snapshot and never fabricates local market data.
      </AcademicOnlyNotice>

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <ResearchPanel
          title={`${company.name} · ${company.ticker}`}
          description={`Final synthesis rank ${company.rank} of 5`}
          icon={BarChart3}
        >
          <dl className="divide-border divide-y">
            {[
              ["Market cap", `$${company.marketCapBillions.toLocaleString()}B`],
              ["P/E ratio", `${company.peRatio.toFixed(2)}x`],
              ["Beta", company.beta.toFixed(2)],
              ["Dividend yield", `${company.dividendYield.toFixed(2)}%`],
              ["Total revenue", `$${company.revenueBillions.toFixed(2)}B`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd className="text-foreground font-mono text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="border-border text-muted-foreground mt-5 border-t pt-4 text-sm leading-6">
            {company.rationale}
          </p>
        </ResearchPanel>

        <ResearchPanel
          title={activeMetric.label}
          description="Five-company comparison from the academic financial snapshot."
          action={
            <div className="flex flex-wrap gap-1" role="group" aria-label="Financial metric">
              {metrics.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={metric === item.key}
                  onClick={() => setMetric(item.key)}
                  className={cn(
                    "focus-visible:ring-ring min-h-9 rounded-sm px-2.5 text-xs focus-visible:ring-2 focus-visible:outline-none",
                    metric === item.key
                      ? "bg-accent-blue/12 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.short}
                </button>
              ))}
            </div>
          }
        >
          <div
            className="h-72 w-full"
            role="img"
            aria-label={`${activeMetric.label} comparison chart`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="ticker"
                  stroke="var(--text-secondary)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-hover)" }}
                  contentStyle={{
                    background: "var(--surface-popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `${Number(value).toLocaleString()}${activeMetric.unit}`,
                    activeMetric.short,
                  ]}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.ticker}
                      fill={entry.ticker === ticker ? "var(--accent-blue)" : "var(--chart-muted)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="research-table min-w-[34rem]">
              <caption className="sr-only">Academic financial snapshot for five companies</caption>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Market cap</th>
                  <th>P/E</th>
                  <th>Beta</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {demoCompanies.map((item) => (
                  <tr
                    key={item.ticker}
                    className={item.ticker === ticker ? "is-selected" : undefined}
                  >
                    <td>
                      <button
                        type="button"
                        onClick={() => setTicker(item.ticker)}
                        className="text-foreground focus-visible:ring-ring min-h-10 font-mono focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {item.ticker}
                      </button>
                    </td>
                    <td>${item.marketCapBillions.toLocaleString()}B</td>
                    <td>{item.peRatio.toFixed(2)}x</td>
                    <td>{item.beta.toFixed(2)}</td>
                    <td>${item.revenueBillions.toFixed(2)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResearchPanel>
      </div>

      <div className="border-accent-violet bg-surface/45 text-muted-foreground flex gap-3 border-l-2 p-4 text-sm leading-6">
        <Info aria-hidden="true" className="text-accent-violet mt-0.5 size-4 shrink-0" />
        <p>
          <strong className="text-foreground">Interpretation boundary.</strong> The notebook
          combined this snapshot with narrative evidence for research demonstration. It is not a
          live valuation model or financial advice.
        </p>
      </div>
    </div>
  );
}
