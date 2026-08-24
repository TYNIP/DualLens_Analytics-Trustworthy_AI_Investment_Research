import { RouterProvider } from "react-router-dom";

import { AppModeProvider } from "@/app/providers/app-mode-provider";
import { LocalRuntimeProvider } from "@/app/providers/local-runtime-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";

import { appRouter } from "./routes/router";

export function App() {
  return (
    <AppModeProvider>
      <LocalRuntimeProvider>
        <ErrorBoundary>
          <RouterProvider router={appRouter} />
        </ErrorBoundary>
      </LocalRuntimeProvider>
    </AppModeProvider>
  );
}
