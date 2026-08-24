import { z } from "zod";

const experimentSchema = z.object({
  companies: z.literal(5),
  pages: z.literal(44),
  chunks: z.literal(138),
  filteredRetrievalHit: z.literal(75),
  unfilteredRetrievalHit: z.literal(75),
  companyPurity: z.literal(96),
  baselineCorrect: z.literal(11),
  baselineTotal: z.literal(20),
  baselineAccuracy: z.literal(55),
  heldOutV1Correct: z.literal(4),
  heldOutV2Correct: z.literal(5),
  heldOutTotal: z.literal(8),
  heldOutV1Accuracy: z.literal(50),
  heldOutV2Accuracy: z.literal(62.5),
  judgeMean: z.literal(80),
  rankingGroundedness: z.literal(100),
  confidence: z.literal(79),
  verdict: z.literal("flagged"),
  confidenceWeights: z.object({
    gold: z.literal(40),
    judges: z.literal(30),
    ranking: z.literal(30),
  }),
  thresholds: z.object({ clientReady: z.literal(80), flagged: z.literal(60) }),
});

export const experiment = experimentSchema.parse({
  companies: 5,
  pages: 44,
  chunks: 138,
  filteredRetrievalHit: 75,
  unfilteredRetrievalHit: 75,
  companyPurity: 96,
  baselineCorrect: 11,
  baselineTotal: 20,
  baselineAccuracy: 55,
  heldOutV1Correct: 4,
  heldOutV2Correct: 5,
  heldOutTotal: 8,
  heldOutV1Accuracy: 50,
  heldOutV2Accuracy: 62.5,
  judgeMean: 80,
  rankingGroundedness: 100,
  confidence: 79,
  verdict: "flagged",
  confidenceWeights: { gold: 40, judges: 30, ranking: 30 },
  thresholds: { clientReady: 80, flagged: 60 },
});

export function academicConfidenceVerdict(
  score: number,
): "client-ready" | "flagged" | "human-review" {
  if (score >= experiment.thresholds.clientReady) return "client-ready";
  if (score >= experiment.thresholds.flagged) return "flagged";
  return "human-review";
}
