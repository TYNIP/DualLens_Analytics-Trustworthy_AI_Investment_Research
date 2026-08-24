import type { DemoTicker } from "@/data/demo";
import { demoCompanies } from "@/data/demo";
import { cn } from "@/lib/utils/cn";

interface CompanySelectorProps {
  value: DemoTicker;
  onChange: (ticker: DemoTicker) => void;
  label?: string;
}

export function CompanySelector({ value, onChange, label = "Company" }: CompanySelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {demoCompanies.map((company) => (
          <button
            key={company.ticker}
            type="button"
            aria-pressed={company.ticker === value}
            onClick={() => onChange(company.ticker)}
            className={cn(
              "focus-visible:ring-ring min-h-10 rounded-md border px-3 font-mono text-xs transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none",
              company.ticker === value
                ? "border-accent-blue/50 bg-accent-blue/10 text-foreground"
                : "border-border bg-background/30 text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {company.ticker}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
