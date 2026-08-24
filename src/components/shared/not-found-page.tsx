import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-12" aria-labelledby="not-found-title">
      <p className="text-accent-blue text-sm font-medium">404</p>
      <h1 id="not-found-title" className="mt-2 text-2xl font-semibold">
        Route not found
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        This module is not part of the current DualLens architecture.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Return to overview</Link>
      </Button>
    </section>
  );
}
