import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DualLensDatabase } from "@/lib/storage/database";
import { ChunkRepository } from "@/lib/storage/repositories/chunks";
import { DocumentRepository } from "@/lib/storage/repositories/documents";
import type { DocumentChunk, ResearchDocument } from "@/types/domain";

import { LocalVectorRetriever, retrievalIsSufficient } from "./local-vector-retriever";

const MODEL = "test-mini-lm";

describe("LocalVectorRetriever", () => {
  let database: DualLensDatabase;
  let chunks: ChunkRepository;
  let documents: DocumentRepository;
  let retriever: LocalVectorRetriever;

  beforeEach(async () => {
    database = new DualLensDatabase(`Retriever-${crypto.randomUUID()}`);
    await database.open();
    chunks = new ChunkRepository(database);
    documents = new DocumentRepository(database);
    retriever = new LocalVectorRetriever(chunks, MODEL, documents);
  });

  afterEach(async () => database.delete());

  async function seedDocument(id: string, companyId: string, dimension = 2, status = "ready") {
    const document: ResearchDocument = {
      id,
      companyId,
      filename: `${id}.pdf`,
      fileSize: 100,
      pageCount: 1,
      chunkCount: 0,
      uploadedAt: "2026-01-01T00:00:00Z",
      indexingStatus: status as ResearchDocument["indexingStatus"],
      embeddingModel: MODEL,
      embeddingDimension: dimension,
    };
    await documents.save(document);
  }

  async function seedChunk(id: string, documentId: string, companyId: string, embedding: number[]) {
    const chunk: DocumentChunk = {
      id,
      documentId,
      companyId,
      page: 1,
      chunkIndex: 0,
      text: id,
      embedding,
      embeddingModel: MODEL,
      embeddingDimension: embedding.length,
      chunkingVersion: "test-v1",
    };
    await chunks.saveMany([chunk]);
  }

  it("ranks by cosine similarity with stable ties and top-k", async () => {
    await seedDocument("doc", "acme");
    await seedChunk("z-low", "doc", "acme", [0, 1]);
    await seedChunk("b-high", "doc", "acme", [1, 0]);
    await seedChunk("a-high", "doc", "acme", [1, 0]);

    const results = await retriever.search([1, 0], { companyId: "acme", topK: 2 });
    expect(results.map(({ chunk, rank, score }) => [chunk.id, rank, score])).toEqual([
      ["a-high", 1, 1],
      ["b-high", 2, 1],
    ]);
  });

  it("enforces company, document, ready-state, model, and dimension scope", async () => {
    await seedDocument("allowed", "acme");
    await seedDocument("other-company", "other");
    await seedDocument("not-ready", "acme", 2, "error");
    await seedDocument("wrong-dimension", "acme", 3);
    await seedChunk("allowed-chunk", "allowed", "acme", [1, 0]);
    await seedChunk("foreign-chunk", "other-company", "other", [1, 0]);
    await seedChunk("error-chunk", "not-ready", "acme", [1, 0]);
    await seedChunk("dimension-chunk", "wrong-dimension", "acme", [1, 0, 0]);

    await expect(
      retriever.search([1, 0], { companyId: "acme", documentIds: ["allowed"], topK: 10 }),
    ).resolves.toMatchObject([{ chunk: { id: "allowed-chunk" } }]);
  });

  it("requires a company and handles empty or weak results", async () => {
    await expect(retriever.search([1, 0], { companyId: "", topK: 4 })).rejects.toThrow(/company/i);
    expect(retrievalIsSufficient([])).toBe(false);
    expect(retrievalIsSufficient([{ chunk: {} as DocumentChunk, rank: 1, score: 0.29 }])).toBe(
      false,
    );
    expect(retrievalIsSufficient([{ chunk: {} as DocumentChunk, rank: 1, score: 0.3 }])).toBe(true);
  });
});
