/* eslint-disable react-refresh/only-export-components -- route modules intentionally compose lazy page components */
import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { createHashRouter } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { NotFoundPage } from "@/components/shared/not-found-page";

const OverviewPage = lazy(() =>
  import("@/features/overview/overview-page").then((module) => ({ default: module.OverviewPage })),
);
const FinancialPage = lazy(() =>
  import("@/features/financial/financial-page").then((module) => ({
    default: module.FinancialPage,
  })),
);
const NarrativePage = lazy(() =>
  import("@/features/narrative/narrative-page").then((module) => ({
    default: module.NarrativePage,
  })),
);
const RagPage = lazy(() =>
  import("@/features/rag/rag-page").then((module) => ({ default: module.RagPage })),
);
const RetrievalPage = lazy(() =>
  import("@/features/retrieval/retrieval-page").then((module) => ({
    default: module.RetrievalPage,
  })),
);
const EvaluationPage = lazy(() =>
  import("@/features/evaluation/evaluation-page").then((module) => ({
    default: module.EvaluationPage,
  })),
);
const GoldSetPage = lazy(() =>
  import("@/features/evaluation/gold-set-page").then((module) => ({ default: module.GoldSetPage })),
);
const OptimizationPage = lazy(() =>
  import("@/features/optimization/optimization-page").then((module) => ({
    default: module.OptimizationPage,
  })),
);
const RankingPage = lazy(() =>
  import("@/features/ranking/ranking-page").then((module) => ({ default: module.RankingPage })),
);
const ConfidencePage = lazy(() =>
  import("@/features/confidence/confidence-page").then((module) => ({
    default: module.ConfidencePage,
  })),
);
const DocumentsPage = lazy(() =>
  import("@/features/documents/documents-page").then((module) => ({
    default: module.DocumentsPage,
  })),
);
const StoragePage = lazy(() =>
  import("@/features/documents/storage-page").then((module) => ({ default: module.StoragePage })),
);
const ProjectPage = lazy(() =>
  import("@/features/about/project-page").then((module) => ({ default: module.ProjectPage })),
);
const HowItWorksPage = lazy(() =>
  import("@/features/about/how-it-works-page").then((module) => ({
    default: module.HowItWorksPage,
  })),
);

function RouteLoading() {
  return (
    <div role="status" className="space-y-4 py-6" aria-label="Loading research view">
      <div className="bg-surface-elevated h-3 w-28 animate-pulse" />
      <div className="bg-surface-elevated h-8 w-64 max-w-full animate-pulse" />
      <div className="border-border bg-surface/50 h-40 animate-pulse border" />
    </div>
  );
}

function page(Component: ComponentType) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Component />
    </Suspense>
  );
}

export const appRouter = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: page(OverviewPage) },
      { path: "financial", element: page(FinancialPage) },
      { path: "narrative", element: page(NarrativePage) },
      { path: "assistant", element: page(RagPage) },
      { path: "retrieval", element: page(RetrievalPage) },
      { path: "evaluation", element: page(EvaluationPage) },
      { path: "gold-set", element: page(GoldSetPage) },
      { path: "optimization", element: page(OptimizationPage) },
      { path: "ranking", element: page(RankingPage) },
      { path: "confidence", element: page(ConfidencePage) },
      { path: "documents", element: page(DocumentsPage) },
      { path: "storage", element: page(StoragePage) },
      { path: "project", element: page(ProjectPage) },
      { path: "how-it-works", element: page(HowItWorksPage) },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
