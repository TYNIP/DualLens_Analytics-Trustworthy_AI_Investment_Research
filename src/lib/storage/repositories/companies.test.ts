import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DualLensDatabase } from "@/lib/storage/database";
import type { Company } from "@/types/domain";

import { CompanyRepository } from "./companies";

describe("CompanyRepository", () => {
  let database: DualLensDatabase;
  let repository: CompanyRepository;

  beforeEach(async () => {
    database = new DualLensDatabase(`DualLensTest-${crypto.randomUUID()}`);
    repository = new CompanyRepository(database);
    await database.open();
  });

  afterEach(async () => {
    await database.delete();
  });

  it("persists and returns companies ordered by ticker", async () => {
    const companies: Company[] = [
      { id: "2", ticker: "MSFT", name: "Microsoft", createdAt: "2026-01-02T00:00:00Z" },
      { id: "1", ticker: "GOOGL", name: "Alphabet", createdAt: "2026-01-01T00:00:00Z" },
    ];

    await Promise.all(companies.map((company) => repository.save(company)));

    await expect(repository.list()).resolves.toEqual([companies[1], companies[0]]);
  });

  it("deletes a company by id", async () => {
    const company: Company = {
      id: "1",
      ticker: "IBM",
      name: "IBM",
      createdAt: "2026-01-01T00:00:00Z",
    };

    await repository.save(company);
    await repository.delete(company.id);

    await expect(repository.get(company.id)).resolves.toBeUndefined();
  });

  it("cascades company deletion through documents, chunks, runs, and evaluations", async () => {
    await repository.save({
      id: "company",
      ticker: "CASCADE",
      name: "Cascade",
      createdAt: "2026-01-01T00:00:00Z",
    });
    await database.documents.add({
      id: "document",
      companyId: "company",
      filename: "cascade.pdf",
      fileSize: 1,
      pageCount: 1,
      chunkCount: 1,
      uploadedAt: "2026-01-01T00:00:00Z",
      indexingStatus: "ready",
    });
    await database.chunks.add({
      id: "chunk",
      documentId: "document",
      companyId: "company",
      page: 1,
      chunkIndex: 0,
      text: "text",
      embedding: [1],
      embeddingModel: "model",
      embeddingDimension: 1,
      chunkingVersion: "v1",
    });
    await database.researchRuns.add({
      id: "run",
      companyId: "company",
      question: "question",
      answer: "answer",
      citations: [],
      retrievalResults: [],
      createdAt: "2026-01-01T00:00:00Z",
      model: { provider: "local-webllm", modelId: "model" },
    });
    await database.evaluations.add({
      id: "evaluation",
      researchRunId: "run",
      groundedness: null,
      contextRelevance: null,
      answerRelevance: null,
      retrievalHit: true,
      method: "deterministic",
      createdAt: "2026-01-01T00:00:00Z",
    });

    await repository.delete("company");
    await expect(
      Promise.all([
        database.documents.count(),
        database.chunks.count(),
        database.researchRuns.count(),
        database.evaluations.count(),
      ]),
    ).resolves.toEqual([0, 0, 0, 0]);
  });
});
