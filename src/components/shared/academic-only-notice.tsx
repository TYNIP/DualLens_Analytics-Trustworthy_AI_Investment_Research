import { Archive } from "lucide-react";

import { useAppMode } from "@/app/providers/app-mode-provider";

export function AcademicOnlyNotice({ children }: { children: string }) {
  const { mode } = useAppMode();
  if (mode !== "local-ai") return null;
  return (
    <div className="border-accent-violet bg-accent-violet/7 text-muted-foreground flex gap-3 border-l-2 p-4 text-sm leading-6">
      <Archive aria-hidden="true" className="text-accent-violet mt-0.5 size-4 shrink-0" />
      <p>
        <strong className="text-foreground">Academic Demo surface.</strong> {children}
      </p>
    </div>
  );
}
