import { ExternalLink, Github, Linkedin } from "lucide-react";
import { Outlet } from "react-router-dom";

import { DemoDisclosure } from "@/components/shared/demo-disclosure";
import { ModeSelector } from "@/components/shared/mode-selector";

import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";

export function AppShell() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-100 rounded-md px-4 py-3 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex min-h-dvh w-full max-w-[1720px]">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <header className="border-border bg-background/75 hidden min-h-16 items-center justify-between gap-4 border-b px-5 backdrop-blur lg:flex xl:px-7">
            <DemoDisclosure />
            <ModeSelector compact />
          </header>
          <main id="main-content" className="flex-1 px-4 py-5 sm:px-5 sm:py-6 xl:px-7 xl:py-7">
            <Outlet />
          </main>
          <footer className="border-border text-muted-foreground border-t px-4 py-4 text-xs sm:px-5 xl:px-7">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <a
                  href="https://artmoram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span>Developed by</span>
                  <strong className="text-foreground font-medium">
                    Arturo Cesar Morales Montaño
                  </strong>
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>

                <nav aria-label="Developer and project links">
                  <ul className="flex flex-wrap items-center gap-2">
                    <li>
                      <a
                        href="https://www.linkedin.com/in/arturo-cesar-morales-montano/"
                        target="_blank"
                        rel="noreferrer"
                        className="border-border bg-surface hover:bg-surface-elevated hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-11 items-center gap-2 rounded-md border px-3 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <Linkedin aria-hidden="true" className="size-3.5" />
                        LinkedIn
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/TYNIP/DualLens_Analytics-Trustworthy_AI_Investment_Research"
                        target="_blank"
                        rel="noreferrer"
                        className="border-border bg-surface hover:bg-surface-elevated hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-11 items-center gap-2 rounded-md border px-3 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <Github aria-hidden="true" className="size-3.5" />
                        View repository
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="border-border flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span>DualLens Research Lab runs entirely in the browser.</span>
                <span>Research demonstration only · Not financial advice.</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
