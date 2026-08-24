interface ScoreRailProps {
  label: string;
  value: number;
  max?: number;
  detail?: string;
}

export function ScoreRail({ label, value, max = 100, detail }: ScoreRailProps) {
  const percentage = (value / max) * 100;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-foreground text-xs font-medium">{label}</p>
          {detail ? <p className="text-muted-foreground mt-1 text-xs">{detail}</p> : null}
        </div>
        <span className="text-foreground font-mono text-sm">
          {value}
          <span className="text-muted-foreground">/{max}</span>
        </span>
      </div>
      <div className="bg-meter-track mt-2 h-1.5 overflow-hidden rounded-full" aria-hidden="true">
        <div className="bg-accent-blue h-full rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
