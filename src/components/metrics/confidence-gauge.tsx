import type { CSSProperties } from "react";

interface ConfidenceGaugeProps {
  score: number;
  label?: string;
  compact?: boolean;
}

export function ConfidenceGauge({
  score,
  label = "FLAGGED",
  compact = false,
}: ConfidenceGaugeProps) {
  const style = { "--gauge-value": `${score * 3.6}deg` } as CSSProperties;

  return (
    <div className={compact ? "flex items-center gap-4" : "grid place-items-center gap-4"}>
      <div
        className={compact ? "confidence-gauge size-24" : "confidence-gauge size-36 sm:size-44"}
        style={style}
        role="img"
        aria-label={`Confidence ${score} out of 100, routed ${label}`}
      >
        <div className="confidence-gauge__center">
          <strong className={compact ? "font-mono text-2xl" : "font-mono text-4xl"}>{score}</strong>
          <span className="text-muted-foreground text-[0.625rem] tracking-[0.14em] uppercase">
            of 100
          </span>
        </div>
      </div>
      <div className={compact ? "min-w-0" : "text-center"}>
        <p className="text-muted-foreground font-mono text-xs tracking-[0.16em] uppercase">
          Academic route
        </p>
        <p className="text-warning mt-1 text-xl font-semibold">{label}</p>
      </div>
    </div>
  );
}
