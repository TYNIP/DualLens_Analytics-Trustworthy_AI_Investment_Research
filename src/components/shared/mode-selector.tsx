import { Archive, Cpu } from "lucide-react";

import { useAppMode } from "@/app/providers/app-mode-provider";
import { cn } from "@/lib/utils/cn";

export function ModeSelector({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useAppMode();
  return (
    <div
      className="border-border bg-background/55 inline-flex rounded-md border p-1"
      role="group"
      aria-label="Application mode"
    >
      <button
        type="button"
        aria-label="Academic Demo — final evaluated experiment results"
        aria-pressed={mode === "demo"}
        onClick={() => setMode("demo")}
        className={cn(
          "focus-visible:ring-ring flex min-h-10 items-center gap-2 rounded-sm px-3 text-left text-xs font-medium focus-visible:ring-2 focus-visible:outline-none",
          mode === "demo"
            ? "bg-surface-elevated text-foreground ring-accent-blue/30 ring-1"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Archive aria-hidden="true" className="text-success size-3.5 shrink-0" />
        {compact ? (
          "Academic Demo"
        ) : (
          <span className="leading-tight">
            <strong className="block font-medium">Demo Mode</strong>
            <small className="text-muted-foreground block text-[0.625rem] font-normal">
              Academic results
            </small>
          </span>
        )}
      </button>
      <button
        type="button"
        aria-label="Local AI — browser-native portfolio continuation"
        aria-pressed={mode === "local-ai"}
        onClick={() => setMode("local-ai")}
        className={cn(
          "focus-visible:ring-ring flex min-h-10 items-center gap-2 rounded-sm px-3 text-left text-xs font-medium focus-visible:ring-2 focus-visible:outline-none",
          mode === "local-ai"
            ? "bg-surface-elevated text-foreground ring-accent-violet/35 ring-1"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Cpu aria-hidden="true" className="size-3.5 shrink-0" />
        {compact ? (
          "Local AI"
        ) : (
          <span className="leading-tight">
            <strong className="block font-medium">Local AI Mode</strong>
            <small className="text-muted-foreground block text-[0.625rem] font-normal">
              Own documents
            </small>
          </span>
        )}
      </button>
    </div>
  );
}
