import type { EmbeddingProvider } from "@/lib/embeddings/provider";
import {
  DEFAULT_TOP_K,
  LocalVectorRetriever,
  RETRIEVAL_SUFFICIENCY_THRESHOLD,
  retrievalIsSufficient,
} from "@/lib/retrieval/local-vector-retriever";
import type { RetrievalResult } from "@/types/domain";

export interface LocalRetrievalResponse {
  results: RetrievalResult[];
  sufficient: boolean;
  threshold: number;
  latencyMs: number;
}

export class LocalRetrievalService {
  public constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly retriever = new LocalVectorRetriever(),
  ) {}

  public async search(
    question: string,
    companyId: string,
    topK = DEFAULT_TOP_K,
    documentIds?: string[],
  ): Promise<LocalRetrievalResponse> {
    if (!question.trim()) throw new Error("Enter a research question.");
    const start = performance.now();
    await this.embeddings.load();
    const [queryEmbedding] = await this.embeddings.embed([question.trim()]);
    if (!queryEmbedding) throw new Error("The query embedding could not be generated.");
    const results = await this.retriever.search(queryEmbedding, { companyId, topK, documentIds });
    return {
      results,
      sufficient: retrievalIsSufficient(results),
      threshold: RETRIEVAL_SUFFICIENCY_THRESHOLD,
      latencyMs: performance.now() - start,
    };
  }
}
