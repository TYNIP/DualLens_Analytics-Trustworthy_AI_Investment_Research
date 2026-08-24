import type {
  EmbeddingLoadProgress,
  EmbeddingModelInfo,
  EmbeddingProvider,
} from "@/lib/embeddings/provider";
import type { EmbeddingVector } from "@/types/domain";

export const LOCAL_EMBEDDING_MODEL = "onnx-community/all-MiniLM-L6-v2-ONNX";
export const LOCAL_EMBEDDING_DIMENSION = 384;

interface FeatureExtractor {
  (
    texts: string[],
    options: { pooling: "mean"; normalize: true },
  ): Promise<{
    tolist(): unknown[];
  }>;
  dispose(): void;
}

interface TransformersProgress {
  status?: string;
  progress?: number;
  file?: string;
}

export class TransformersEmbeddingProvider implements EmbeddingProvider {
  private extractor: FeatureExtractor | null = null;

  public constructor(private readonly onProgress?: (progress: EmbeddingLoadProgress) => void) {}

  public async load(): Promise<EmbeddingModelInfo> {
    if (!this.extractor) {
      this.onProgress?.({ status: "Loading embedding runtime" });
      const { pipeline } = await import("@huggingface/transformers");
      this.extractor = (await pipeline("feature-extraction", LOCAL_EMBEDDING_MODEL, {
        device: "wasm",
        dtype: "q8",
        progress_callback: (event: TransformersProgress) =>
          this.onProgress?.({
            status: event.file
              ? `${event.status ?? "Downloading"} · ${event.file}`
              : (event.status ?? "Loading"),
            progress: typeof event.progress === "number" ? event.progress / 100 : undefined,
          }),
      })) as unknown as FeatureExtractor;
    }
    return {
      modelId: LOCAL_EMBEDDING_MODEL,
      dimensions: LOCAL_EMBEDDING_DIMENSION,
      ready: true,
    };
  }

  public async embed(texts: string[]): Promise<EmbeddingVector[]> {
    if (!texts.length) return [];
    await this.load();
    const output = await this.extractor!(texts, { pooling: "mean", normalize: true });
    const nested = output.tolist();
    if (!Array.isArray(nested) || nested.length !== texts.length)
      throw new Error("Embedding model returned an unexpected batch shape.");
    return nested.map((vector) => {
      if (!Array.isArray(vector) || vector.length !== LOCAL_EMBEDDING_DIMENSION)
        throw new Error("Embedding model returned an unexpected vector dimension.");
      return vector.map(Number);
    });
  }

  public async unload(): Promise<void> {
    this.extractor?.dispose();
    this.extractor = null;
  }
}
