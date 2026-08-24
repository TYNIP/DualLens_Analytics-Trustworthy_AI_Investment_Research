import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pipeline: vi.fn(),
  extractor: Object.assign(vi.fn(), { dispose: vi.fn() }),
}));

vi.mock("@huggingface/transformers", () => ({ pipeline: mocks.pipeline }));

import {
  LOCAL_EMBEDDING_DIMENSION,
  LOCAL_EMBEDDING_MODEL,
  TransformersEmbeddingProvider,
} from "./transformers-provider";

describe("TransformersEmbeddingProvider", () => {
  beforeEach(() => {
    mocks.pipeline.mockReset();
    mocks.extractor.mockReset();
    mocks.extractor.dispose.mockReset();
    mocks.pipeline.mockResolvedValue(mocks.extractor);
  });

  it("loads the selected q8 WASM model and returns normalized 384-dimension vectors", async () => {
    const progress = vi.fn();
    const vectors = [
      Array.from({ length: LOCAL_EMBEDDING_DIMENSION }, (_, index) => index / 1000),
      Array.from({ length: LOCAL_EMBEDDING_DIMENSION }, (_, index) => index / 2000),
    ];
    mocks.extractor.mockResolvedValue({ tolist: () => vectors });
    const provider = new TransformersEmbeddingProvider(progress);

    await expect(provider.load()).resolves.toEqual({
      modelId: LOCAL_EMBEDDING_MODEL,
      dimensions: LOCAL_EMBEDDING_DIMENSION,
      ready: true,
    });
    expect(mocks.pipeline).toHaveBeenCalledWith(
      "feature-extraction",
      LOCAL_EMBEDDING_MODEL,
      expect.objectContaining({ device: "wasm", dtype: "q8" }),
    );
    await expect(provider.embed(["alpha", "beta"])).resolves.toEqual(vectors);
    expect(mocks.extractor).toHaveBeenCalledWith(["alpha", "beta"], {
      pooling: "mean",
      normalize: true,
    });
    await provider.unload();
    expect(mocks.extractor.dispose).toHaveBeenCalledOnce();
  });

  it("rejects a malformed embedding dimension", async () => {
    mocks.extractor.mockResolvedValue({ tolist: () => [[1, 2]] });
    const provider = new TransformersEmbeddingProvider();
    await expect(provider.embed(["bad vector"])).rejects.toThrow(/vector dimension/i);
  });
});
