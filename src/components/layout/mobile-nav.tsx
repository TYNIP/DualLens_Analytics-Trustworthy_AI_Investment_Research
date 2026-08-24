import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { NavLink } from "react-router-dom";

import { useAppMode } from "@/app/providers/app-mode-provider";
import { routeDefinitions, routeGroups } from "@/app/routes/route-definitions";
import { ModeSelector } from "@/components/shared/mode-selector";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_NAME } from "@/constants/brand";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const { mode } = useAppMode();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function closeDrawer() {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }

  function containFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <>
      <header className="border-border bg-background/92 sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="brand-lens brand-lens--small" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="truncate text-sm font-semibold">{PRODUCT_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "demo" ? "success" : "outline"}>
            {mode === "demo" ? "Academic Demo" : "Local AI"}
          </Badge>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground focus-visible:ring-ring grid size-11 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Open navigation"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </header>

      {open ? (
        <div
          className="dialog-backdrop z-50 lg:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDrawer();
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Research navigation"
            className="mobile-drawer"
            onKeyDown={containFocus}
          >
            <div className="border-border flex min-h-16 items-center justify-between border-b px-4">
              <span className="text-sm font-semibold">Research index</span>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDrawer}
                className="text-muted-foreground hover:bg-surface-elevated focus-visible:ring-ring grid size-11 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Close navigation"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto p-3">
              {routeGroups.map((group) => (
                <div key={group} className="mb-5">
                  <p className="text-muted-foreground px-2 text-[0.625rem] font-semibold tracking-[0.16em] uppercase">
                    {group}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {routeDefinitions
                      .filter((route) => route.group === group)
                      .map((route) => {
                        const Icon = route.icon;
                        return (
                          <li key={route.path}>
                            <NavLink
                              end={route.path === "/"}
                              to={route.path}
                              onClick={closeDrawer}
                              className={({ isActive }) =>
                                cn("nav-instrument", isActive && "is-active")
                              }
                            >
                              <Icon aria-hidden="true" className="size-4" />
                              <span>{route.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="border-border border-t p-4">
              <ModeSelector />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
