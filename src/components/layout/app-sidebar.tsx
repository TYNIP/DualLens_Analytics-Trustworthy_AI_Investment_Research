import { NavLink } from "react-router-dom";

import { routeDefinitions, routeGroups } from "@/app/routes/route-definitions";
import { LocalWorkspaceStatus } from "@/components/shared/local-workspace-status";
import { ModeSelector } from "@/components/shared/mode-selector";
import { PRODUCT_NAME } from "@/constants/brand";
import { cn } from "@/lib/utils/cn";

export function AppSidebar() {
  return (
    <aside className="border-border bg-sidebar hidden w-70 shrink-0 border-r lg:flex lg:flex-col">
      <div className="border-border border-b px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="brand-lens" aria-hidden="true">
            <i />
            <i />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[-0.02em]">{PRODUCT_NAME}</p>
            <p className="text-muted-foreground mt-0.5 text-[0.6875rem]">
              Evidence before confidence.
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {routeGroups.map((group) => {
          const routes = routeDefinitions.filter((route) => route.group === group);
          return (
            <div key={group} className="mb-4 last:mb-0">
              <p className="text-muted-foreground/80 px-2.5 text-[0.625rem] font-semibold tracking-[0.16em] uppercase">
                {group}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {routes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <li key={route.path}>
                      <NavLink
                        end={route.path === "/"}
                        to={route.path}
                        className={({ isActive }) => cn("nav-instrument", isActive && "is-active")}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span className="truncate">{route.label}</span>
                        {route.phase === 3 ? (
                          <span className="text-muted-foreground ml-auto font-mono text-[0.5625rem]">
                            P3
                          </span>
                        ) : null}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-border space-y-3 border-t p-3">
        <ModeSelector compact />
        <LocalWorkspaceStatus />
      </div>
    </aside>
  );
}
