import { describe, expect, it } from "vitest";

import { cosineSimilarity } from "./cosine-similarity";

describe("cosineSimilarity", () => {
  it("returns one for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it("returns zero for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("returns negative one for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(-1);
  });

  it("returns zero if either vector has zero magnitude", () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });

  it("rejects empty or mismatched vectors", () => {
    expect(() => cosineSimilarity([], [])).toThrow(/non-empty/);
    expect(() => cosineSimilarity([1], [1, 2])).toThrow(/equal dimensions/);
  });
});
