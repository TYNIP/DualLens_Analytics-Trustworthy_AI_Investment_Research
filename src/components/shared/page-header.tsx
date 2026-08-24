import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  snapshot?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  snapshot = true,
}: PageHeaderProps) {
  return (
    <header className="research-header border-border relative overflow-hidden border-b pb-6">
      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-accent-blue font-mono text-[0.6875rem] font-medium tracking-[0.18em] uppercase">
              {eyebrow}
            </p>
            {snapshot ? <Badge variant="outline">Academic snapshot</Badge> : null}
          </div>
          <h1 className="text-foreground mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6 sm:text-base">
            {description}
          </p>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </header>
  );
}
