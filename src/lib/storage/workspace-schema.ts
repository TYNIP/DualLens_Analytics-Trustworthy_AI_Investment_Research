import { z } from "zod";

import { WORKSPACE_EXPORT_VERSION } from "@/types/workspace";

const id = z.string().min(1).max(256);
const text = z.string().max(200_000);
const isoDate = z.string().min(10).max(64);
const embedding = z.array(z.number().finite()).min(1).max(4096);

export const companySchema = z.strictObject({
  id,
  ticker: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(160),
  description: z.string().max(2000).optional(),
  notes: z.string().max(10_000).optional(),
  createdAt: isoDate,
  updatedAt: isoDate.optional(),
});

export const documentSchema = z.strictObject({
  id,
  companyId: id,
  filename: z.string().min(1).max(512),
  fileSize: z
    .number()
    .int()
    .nonnegative()
    .max(100 * 1024 * 1024),
  pageCount: z.number().int().nonnegative().max(20_000),
  chunkCount: z.number().int().nonnegative().max(200_000),
  uploadedAt: isoDate,
  indexedAt: isoDate.optional(),
  indexingStatus: z.enum([
    "pending",
    "extracting",
    "chunking",
    "embedding",
    "saving",
    "ready",
    "error",
    "cancelled",
  ]),
  embeddingModel: z.string().max(256).optional(),
  embeddingDimension: z.number().int().positive().max(4096).optional(),
  chunkingVersion: z.string().max(64).optional(),
  errorMessage: z.string().max(2000).optional(),
});

export const chunkSchema = z.strictObject({
  id,
  documentId: id,
  companyId: id,
  page: z.number().int().positive().max(20_000),
  chunkIndex: z.number().int().nonnegative().max(200_000),
  text: z.string().min(1).max(20_000),
  embedding,
  embeddingModel: z.string().min(1).max(256),
  embeddingDimension: z.number().int().positive().max(4096),
  chunkingVersion: z.string().min(1).max(64),
});

const citationSchema = z.strictObject({
  documentId: id,
  filename: z.string().min(1).max(512),
  page: z.number().int().positive(),
  chunkId: id,
  text: z.string().max(20_000),
  similarity: z.number().finite().min(-1).max(1),
});

const retrievalResultSchema = z.strictObject({
  chunk: chunkSchema,
  score: z.number().finite().min(-1).max(1),
  rank: z.number().int().positive().max(100),
});

const diagnosticsSchema = z.strictObject({
  retrievalSufficient: z.boolean(),
  retrievalThreshold: z.number().finite().min(-1).max(1),
  evidenceCount: z.number().int().nonnegative(),
  referencedEvidenceCount: z.number().int().nonnegative(),
  citationCoverage: z.number().finite().min(0).max(1),
  companyPurity: z.number().finite().min(0).max(1),
  guardrailTriggered: z.boolean(),
  retrievalLatencyMs: z.number().finite().nonnegative(),
  generationLatencyMs: z.number().finite().nonnegative().optional(),
});

export const researchRunSchema = z.strictObject({
  id,
  question: z.string().min(1).max(10_000),
  companyId: id.optional(),
  answer: text,
  citations: z.array(citationSchema).max(20),
  retrievalResults: z.array(retrievalResultSchema).max(20),
  evaluationId: id.optional(),
  createdAt: isoDate,
  model: z.strictObject({
    provider: z.enum(["demo", "local-webllm"]),
    modelId: z.string().min(1).max(256),
    executionDevice: z.string().max(128).optional(),
  }),
  mode: z.enum(["demo", "local-ai"]).optional(),
  promptVersion: z.string().max(64).optional(),
  diagnostics: diagnosticsSchema.optional(),
});

export const evaluationSchema = z.strictObject({
  id,
  researchRunId: id,
  groundedness: z.number().finite().nullable(),
  contextRelevance: z.number().finite().nullable(),
  answerRelevance: z.number().finite().nullable(),
  retrievalHit: z.boolean().nullable(),
  notes: z.string().max(10_000).optional(),
  method: z.enum(["deterministic", "local-model", "human"]),
  createdAt: isoDate,
});

export const settingSchema = z.strictObject({
  key: z.string().min(1).max(128),
  value: z.union([z.string().max(10_000), z.number().finite(), z.boolean()]),
  updatedAt: isoDate,
});

export const workspaceExportSchema = z
  .strictObject({
    version: z.literal(WORKSPACE_EXPORT_VERSION),
    exportedAt: isoDate,
    companies: z.array(companySchema).max(1000),
    documents: z.array(documentSchema).max(5000),
    chunks: z.array(chunkSchema).max(100_000),
    researchRuns: z.array(researchRunSchema).max(25_000),
    evaluations: z.array(evaluationSchema).max(25_000),
    settings: z.array(settingSchema).max(1000),
  })
  .superRefine((workspace, context) => {
    const unique = (values: string[], path: string) => {
      if (new Set(values).size !== values.length)
        context.addIssue({ code: "custom", path: [path], message: `Duplicate ${path} keys.` });
    };
    unique(
      workspace.companies.map((record) => record.id),
      "companies",
    );
    unique(
      workspace.documents.map((record) => record.id),
      "documents",
    );
    unique(
      workspace.chunks.map((record) => record.id),
      "chunks",
    );
    unique(
      workspace.researchRuns.map((record) => record.id),
      "researchRuns",
    );
    unique(
      workspace.evaluations.map((record) => record.id),
      "evaluations",
    );
    unique(
      workspace.settings.map((record) => record.key),
      "settings",
    );

    const companyIds = new Set(workspace.companies.map((record) => record.id));
    const documents = new Map(workspace.documents.map((record) => [record.id, record]));
    const runIds = new Set(workspace.researchRuns.map((record) => record.id));
    workspace.documents.forEach((record, index) => {
      if (!companyIds.has(record.companyId))
        context.addIssue({
          code: "custom",
          path: ["documents", index, "companyId"],
          message: "Document references an unknown company.",
        });
    });
    workspace.chunks.forEach((record, index) => {
      const document = documents.get(record.documentId);
      if (!document || document.companyId !== record.companyId)
        context.addIssue({
          code: "custom",
          path: ["chunks", index, "documentId"],
          message: "Chunk references an unknown or mismatched document.",
        });
      if (record.embedding.length !== record.embeddingDimension)
        context.addIssue({
          code: "custom",
          path: ["chunks", index, "embedding"],
          message: "Embedding length does not match embeddingDimension.",
        });
    });
    workspace.researchRuns.forEach((record, index) => {
      if (record.companyId && !companyIds.has(record.companyId))
        context.addIssue({
          code: "custom",
          path: ["researchRuns", index, "companyId"],
          message: "Research run references an unknown company.",
        });
    });
    workspace.evaluations.forEach((record, index) => {
      if (!runIds.has(record.researchRunId))
        context.addIssue({
          code: "custom",
          path: ["evaluations", index, "researchRunId"],
          message: "Evaluation references an unknown research run.",
        });
    });
  });
