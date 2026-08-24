import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DualLensDatabase } from "@/lib/storage/database";
import type { WorkspaceExport } from "@/types/workspace";

import { WorkspaceService } from "./workspace-service";

const EMPTY_EXPORT: WorkspaceExport = {
  version: 2,
  exportedAt: "2026-08-23T00:00:00Z",
  companies: [],
  documents: [],
  chunks: [],
  researchRuns: [],
  evaluations: [],
  settings: [],
};

describe("WorkspaceService", () => {
  let database: DualLensDatabase;
  let service: WorkspaceService;

  beforeEach(async () => {
    database = new DualLensDatabase(`Workspace-${crypto.randomUUID()}`);
    await database.open();
    service = new WorkspaceService(database);
  });

  afterEach(async () => database.delete());

  it("round-trips local records, embeddings, runs, evaluations, and settings", async () => {
    const workspace: WorkspaceExport = {
      ...EMPTY_EXPORT,
      companies: [
        { id: "company", ticker: "ACME", name: "Acme", createdAt: "2026-01-01T00:00:00Z" },
      ],
      documents: [
        {
          id: "doc",
          companyId: "company",
          filename: "acme.pdf",
          fileSize: 100,
          pageCount: 1,
          chunkCount: 1,
          uploadedAt: "2026-01-01T00:00:00Z",
          indexingStatus: "ready",
          embeddingModel: "model",
          embeddingDimension: 2,
        },
      ],
      chunks: [
        {
          id: "chunk",
          documentId: "doc",
          companyId: "company",
          page: 1,
          chunkIndex: 0,
          text: "Local evidence",
          embedding: [0.1, 0.9],
          embeddingModel: "model",
          embeddingDimension: 2,
          chunkingVersion: "v1",
        },
      ],
      researchRuns: [
        {
          id: "run",
          companyId: "company",
          question: "Question?",
          answer: "Answer [S1].",
          citations: [],
          retrievalResults: [],
          createdAt: "2026-01-01T00:00:00Z",
          model: { provider: "local-webllm", modelId: "llm" },
          mode: "local-ai",
        },
      ],
      evaluations: [
        {
          id: "evaluation",
          researchRunId: "run",
          groundedness: null,
          contextRelevance: null,
          answerRelevance: null,
          retrievalHit: true,
          method: "deterministic",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      settings: [{ key: "topK", value: 4, updatedAt: "2026-01-01T00:00:00Z" }],
    };

    await service.replace(workspace);
    const exported = await service.export();
    expect({ ...exported, exportedAt: workspace.exportedAt }).toEqual(workspace);
    expect(JSON.stringify(exported)).not.toMatch(/demoCompanies|NVIDIA Investment Review/);
  });

  it("rejects malformed, wrong-version, unknown-field, and inconsistent imports", () => {
    expect(() => service.parse("not json")).toThrow(SyntaxError);
    expect(() => service.parse(JSON.stringify({ ...EMPTY_EXPORT, version: 1 }))).toThrow();
    expect(() => service.parse(JSON.stringify({ ...EMPTY_EXPORT, unexpected: true }))).toThrow();
    expect(() =>
      service.parse(JSON.stringify({ version: 2, exportedAt: "2026-08-23T00:00:00Z" })),
    ).toThrow();
    expect(() =>
      service.parse(
        JSON.stringify({
          ...EMPTY_EXPORT,
          documents: [
            {
              id: "orphan",
              companyId: "missing",
              filename: "x.pdf",
              fileSize: 1,
              pageCount: 0,
              chunkCount: 0,
              uploadedAt: "2026-01-01T00:00:00Z",
              indexingStatus: "pending",
            },
          ],
        }),
      ),
    ).toThrow(/unknown company/i);
  });

  it("validates before replace so an invalid payload cannot erase current data", async () => {
    await database.companies.add({
      id: "safe",
      ticker: "SAFE",
      name: "Safe record",
      createdAt: "2026-01-01T00:00:00Z",
    });
    await expect(
      service.replace({ ...EMPTY_EXPORT, version: 1 } as unknown as WorkspaceExport),
    ).rejects.toThrow();
    await expect(database.companies.get("safe")).resolves.toBeDefined();
  });

  it("clears only local workspace tables", async () => {
    await database.companies.add({
      id: "local",
      ticker: "LOCAL",
      name: "Local only",
      createdAt: "2026-01-01T00:00:00Z",
    });
    await service.clear();
    await expect(service.counts()).resolves.toEqual({
      companies: 0,
      documents: 0,
      chunks: 0,
      researchRuns: 0,
      evaluations: 0,
    });
  });
});
