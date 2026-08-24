import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ResearchPanelProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  as?: "section" | "article" | "aside";
}

export function ResearchPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  as: Comp = "section",
  ...props
}: ResearchPanelProps) {
  return (
    <Comp className={cn("research-panel", className)} {...props}>
      {title ? (
        <div className="border-border flex min-h-13 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon ? <Icon aria-hidden="true" className="text-accent-blue size-4 shrink-0" /> : null}
            <div className="min-w-0">
              <h2 className="text-foreground text-sm font-semibold">{title}</h2>
              {description ? (
                <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
              ) : null}
            </div>
          </div>
          {action}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </Comp>
  );
}
