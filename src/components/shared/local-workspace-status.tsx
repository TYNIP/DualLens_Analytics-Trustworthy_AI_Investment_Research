import { HardDrive } from "lucide-react";

import { useLocalRuntime } from "@/app/providers/local-runtime-provider";
import { Badge } from "@/components/ui/badge";

export function LocalWorkspaceStatus() {
  const { capabilities, counts } = useLocalRuntime();
  const checking = capabilities === null;
  const ready = capabilities?.indexedDB ?? false;
  return (
    <div className="border-border bg-background/40 flex items-start gap-3 rounded-lg border p-3">
      <HardDrive
        aria-hidden="true"
        className={ready ? "text-success mt-0.5 size-4" : "text-warning mt-0.5 size-4"}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">Local Workspace</p>
          <Badge aria-live="polite" variant={ready ? "success" : checking ? "outline" : "warning"}>
            {checking ? "Checking" : ready ? "Ready" : "Unavailable"}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          {ready
            ? `${counts.companies} companies · ${counts.documents} documents · ${counts.chunks} chunks`
            : checking
              ? "Confirming private browser storage."
              : "IndexedDB is unavailable in this session."}
        </p>
      </div>
    </div>
  );
}
