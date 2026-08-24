import type { EmbeddingVector } from "@/types/domain";

export interface EmbeddingModelInfo {
  modelId: string;
  dimensions: number;
  ready: boolean;
}

export interface EmbeddingProvider {
  load(): Promise<EmbeddingModelInfo>;
  embed(texts: string[]): Promise<EmbeddingVector[]>;
  unload(): Promise<void>;
}

export interface EmbeddingLoadProgress {
  status: string;
  progress?: number;
}
