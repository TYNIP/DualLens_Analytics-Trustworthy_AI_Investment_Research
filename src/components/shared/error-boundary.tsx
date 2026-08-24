import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("DualLens application error", { error, componentStack: info.componentStack });
  }

  private recover = () => {
    this.setState({ hasError: false });
    window.location.hash = "#/";
    window.location.reload();
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="bg-background text-foreground grid min-h-dvh place-items-center p-6">
        <section className="border-border bg-surface max-w-md rounded-lg border p-6">
          <p className="text-danger text-sm font-medium">Application error</p>
          <h1 className="mt-2 text-xl font-semibold">DualLens could not render this view</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Your local workspace has not been deleted. Return to the overview and try again.
          </p>
          <Button className="mt-6" onClick={this.recover}>
            Return to overview
          </Button>
        </section>
      </main>
    );
  }
}
