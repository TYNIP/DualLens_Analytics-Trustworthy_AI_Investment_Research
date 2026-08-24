import { LOCAL_EMBEDDING_MODEL } from "@/lib/embeddings/transformers-provider";
import { cosineSimilarity } from "@/lib/retrieval/cosine-similarity";
import type { RetrievalOptions, VectorRetriever } from "@/lib/retrieval/vector-retriever";
import { ChunkRepository } from "@/lib/storage/repositories/chunks";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import type { EmbeddingVector, RetrievalResult } from "@/types/domain";

export const DEFAULT_TOP_K = 4;
export const RETRIEVAL_SUFFICIENCY_THRESHOLD = 0.3;

export class LocalVectorRetriever implements VectorRetriever {
  public constructor(
    private readonly chunks = new ChunkRepository(),
    private readonly embeddingModel = LOCAL_EMBEDDING_MODEL,
    private readonly documents = new DocumentRepository(),
  ) {}

  public async search(
    queryEmbedding: EmbeddingVector,
    options: RetrievalOptions,
  ): Promise<RetrievalResult[]> {
    if (!options.companyId) throw new Error("Company-scoped retrieval requires a company.");
    const [allCandidates, documents] = await Promise.all([
      this.chunks.listByCompanyAndModel(options.companyId, this.embeddingModel),
      this.documents.listByCompany(options.companyId),
    ]);
    const documentScope = options.documentIds?.length ? new Set(options.documentIds) : null;
    const readyIds = new Set(
      documents
        .filter(
          (document) =>
            document.indexingStatus === "ready" &&
            document.embeddingModel === this.embeddingModel &&
            document.embeddingDimension === queryEmbedding.length &&
            (!documentScope || documentScope.has(document.id)),
        )
        .map((document) => document.id),
    );
    const candidates = allCandidates.filter((chunk) => readyIds.has(chunk.documentId));
    return candidates
      .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
      .sort(
        (left, right) => right.score - left.score || left.chunk.id.localeCompare(right.chunk.id),
      )
      .slice(0, Math.max(1, options.topK))
      .map((result, index) => ({ ...result, rank: index + 1 }));
  }
}

export function retrievalIsSufficient(
  results: RetrievalResult[],
  threshold = RETRIEVAL_SUFFICIENCY_THRESHOLD,
): boolean {
  return results.length > 0 && (results[0]?.score ?? -1) >= threshold;
}
