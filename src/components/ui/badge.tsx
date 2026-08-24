import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[0.6875rem] font-medium",
  {
    variants: {
      variant: {
        outline: "border-border bg-transparent text-muted-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "outline" | "success" | "warning";
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
