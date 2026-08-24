/* eslint-disable react-refresh/only-export-components -- runtime provider and hook share one stable boundary */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { localLanguageModel } from "@/lib/ai/webllm-language-model";
import type { LocalModelState } from "@/lib/ai/local-model-config";
import { inspectBrowserCapabilities } from "@/lib/browser/capabilities";
import type { BrowserCapabilities } from "@/lib/browser/capabilities";
import type { EmbeddingLoadProgress } from "@/lib/embeddings/provider";
import { TransformersEmbeddingProvider } from "@/lib/embeddings/transformers-provider";
import { WorkspaceService } from "@/lib/storage/workspace-service";
import type { WorkspaceCounts } from "@/lib/storage/workspace-service";
import type { ResearchRun, RetrievalResult } from "@/types/domain";

type EmbeddingState = "unloaded" | "loading" | "ready" | "error";

interface LocalRuntimeContextValue {
  capabilities: BrowserCapabilities | null;
  counts: WorkspaceCounts;
  modelState: LocalModelState;
  embeddingState: EmbeddingState;
  embeddingProgress: EmbeddingLoadProgress | null;
  embeddingProvider: TransformersEmbeddingProvider;
  lastRun: ResearchRun | null;
  lastRetrieval: RetrievalResult[];
  refreshWorkspace: () => Promise<void>;
  loadModel: () => Promise<void>;
  unloadModel: () => Promise<void>;
  interruptModel: () => Promise<void>;
  markEmbeddingReady: () => void;
  markEmbeddingError: () => void;
  setLastRun: (run: ResearchRun | null) => void;
  setLastRetrieval: (results: RetrievalResult[]) => void;
}

const emptyCounts: WorkspaceCounts = {
  companies: 0,
  documents: 0,
  chunks: 0,
  researchRuns: 0,
  evaluations: 0,
};

const LocalRuntimeContext = createContext<LocalRuntimeContextValue | null>(null);

export function LocalRuntimeProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [counts, setCounts] = useState(emptyCounts);
  const [modelState, setModelState] = useState<LocalModelState>(localLanguageModel.getState());
  const [embeddingState, setEmbeddingState] = useState<EmbeddingState>("unloaded");
  const [embeddingProgress, setEmbeddingProgress] = useState<EmbeddingLoadProgress | null>(null);
  const [lastRun, setLastRun] = useState<ResearchRun | null>(null);
  const [lastRetrieval, setLastRetrieval] = useState<RetrievalResult[]>([]);
  const [embeddingProvider] = useState(
    () =>
      new TransformersEmbeddingProvider((progress) => {
        setEmbeddingState("loading");
        setEmbeddingProgress(progress);
      }),
  );
  const [workspace] = useState(() => new WorkspaceService());

  const refreshWorkspace = useCallback(async () => {
    try {
      setCounts(await workspace.counts());
    } catch {
      setCounts(emptyCounts);
    }
  }, [workspace]);

  useEffect(() => {
    let active = true;
    void inspectBrowserCapabilities().then((value) => {
      if (active) setCapabilities(value);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- IndexedDB hydration resolves asynchronously inside this repository call.
    void refreshWorkspace();
    const unsubscribe = localLanguageModel.subscribe(setModelState);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshWorkspace]);

  const value = useMemo<LocalRuntimeContextValue>(
    () => ({
      capabilities,
      counts,
      modelState,
      embeddingState,
      embeddingProgress,
      embeddingProvider,
      lastRun,
      lastRetrieval,
      refreshWorkspace,
      async loadModel() {
        await localLanguageModel.load();
      },
      async unloadModel() {
        await localLanguageModel.unload();
      },
      async interruptModel() {
        await localLanguageModel.interrupt();
      },
      markEmbeddingReady() {
        setEmbeddingState("ready");
        setEmbeddingProgress({ status: "Embedding model ready", progress: 1 });
      },
      markEmbeddingError() {
        setEmbeddingState("error");
      },
      setLastRun,
      setLastRetrieval,
    }),
    [
      capabilities,
      counts,
      embeddingProgress,
      embeddingProvider,
      embeddingState,
      lastRetrieval,
      lastRun,
      modelState,
      refreshWorkspace,
    ],
  );

  return <LocalRuntimeContext.Provider value={value}>{children}</LocalRuntimeContext.Provider>;
}

export function useLocalRuntime(): LocalRuntimeContextValue {
  const context = useContext(LocalRuntimeContext);
  if (!context) throw new Error("useLocalRuntime must be used inside LocalRuntimeProvider.");
  return context;
}
