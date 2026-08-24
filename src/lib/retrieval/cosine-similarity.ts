import type { EmbeddingVector } from "@/types/domain";

export function cosineSimilarity(left: EmbeddingVector, right: EmbeddingVector): number {
  if (left.length === 0 || left.length !== right.length) {
    throw new Error("Embedding vectors must be non-empty and have equal dimensions.");
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}
