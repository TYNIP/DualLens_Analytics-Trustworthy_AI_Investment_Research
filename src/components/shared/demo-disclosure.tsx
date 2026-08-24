import { Archive, LockKeyhole } from "lucide-react";

import { useAppMode } from "@/app/providers/app-mode-provider";

export function DemoDisclosure() {
  const { mode } = useAppMode();
  if (mode === "local-ai") {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <LockKeyhole aria-hidden="true" className="text-success size-3.5" />
        <span>
          <strong className="text-foreground font-medium">Local AI</strong> · Portfolio
          continuation; documents and queries are processed on this device
        </span>
      </div>
    );
  }
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      <Archive aria-hidden="true" className="text-accent-violet size-3.5" />
      <span>
        <strong className="text-foreground font-medium">Academic Demo</strong> · Final evaluated
        experiment results
      </span>
    </div>
  );
}
