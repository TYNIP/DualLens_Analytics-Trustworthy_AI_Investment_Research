import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DualLensDatabase } from "@/lib/storage/database";
import type { DocumentChunk, ResearchDocument } from "@/types/domain";

import { DocumentRepository } from "./documents";

describe("DocumentRepository", () => {
  let database: DualLensDatabase;
  let repository: DocumentRepository;

  beforeEach(async () => {
    database = new DualLensDatabase(`Documents-${crypto.randomUUID()}`);
    await database.open();
    repository = new DocumentRepository(database);
  });

  afterEach(async () => database.delete());

  function document(status: ResearchDocument["indexingStatus"] = "pending"): ResearchDocument {
    return {
      id: "document",
      companyId: "company",
      filename: "research.pdf",
      fileSize: 100,
      pageCount: status === "ready" ? 1 : 0,
      chunkCount: status === "ready" ? 1 : 0,
      uploadedAt: "2026-01-01T00:00:00Z",
      indexingStatus: status,
      embeddingModel: status === "ready" ? "model" : undefined,
      embeddingDimension: status === "ready" ? 2 : undefined,
    };
  }

  function chunk(text: string): DocumentChunk {
    return {
      id: "chunk",
      documentId: "document",
      companyId: "company",
      page: 1,
      chunkIndex: 0,
      text,
      embedding: [1, 0],
      embeddingModel: "model",
      embeddingDimension: 2,
      chunkingVersion: "v1",
    };
  }

  it("creates, reads, updates, and lists document metadata", async () => {
    await repository.save(document());
    await repository.save({ ...document(), filename: "updated.pdf" });
    await expect(repository.get("document")).resolves.toMatchObject({ filename: "updated.pdf" });
    await expect(repository.listByCompany("company")).resolves.toHaveLength(1);
  });

  it("transactionally replaces chunks and cascades document deletion", async () => {
    await repository.saveReadyWithChunks(document("ready"), [chunk("first")]);
    await repository.saveReadyWithChunks(document("ready"), [chunk("replacement")]);
    await expect(database.chunks.toArray()).resolves.toMatchObject([{ text: "replacement" }]);
    await repository.delete("document");
    await expect(
      Promise.all([database.documents.count(), database.chunks.count()]),
    ).resolves.toEqual([0, 0]);
  });
});
