import { LockKeyhole } from "lucide-react";

interface LockedNoticeProps {
  title: string;
  description: string;
}

export function LockedNotice({ title, description }: LockedNoticeProps) {
  return (
    <div className="border-border bg-background/35 flex gap-3 border p-4">
      <LockKeyhole aria-hidden="true" className="text-accent-violet mt-0.5 size-4 shrink-0" />
      <div>
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-6">{description}</p>
      </div>
    </div>
  );
}
