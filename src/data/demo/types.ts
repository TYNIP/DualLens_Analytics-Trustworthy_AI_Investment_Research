export type DemoTicker = "GOOGL" | "MSFT" | "IBM" | "NVDA" | "AMZN";

export interface AcademicMetric {
  label: string;
  value: number;
  unit: "count" | "percent" | "score";
  context: string;
}

export interface DemoCompany {
  ticker: DemoTicker;
  name: string;
  rank: number;
  pages: number;
  chunks: number;
  marketCapBillions: number;
  peRatio: number;
  dividendYield: number;
  beta: number;
  revenueBillions: number;
  initiatives: Array<{ name: string; pages: number[] }>;
  evidence: {
    page: number;
    initiative: string;
    paraphrase: string;
  };
  rationale: string;
}

export interface EvidenceRecord {
  id: string;
  rank: number;
  company: DemoTicker;
  document: string;
  pageLabel: string;
  chunkId: string | null;
  score: number | null;
  text: string;
  contributed: boolean;
  provenance: "notebook-output" | "corpus-coverage";
}

export interface DemoQuestion {
  id: string;
  company: DemoTicker;
  question: string;
  answer: string;
  status: "passed" | "failed" | "improved" | "observed";
  source: string;
  judges: {
    groundedness: number | null;
    contextRelevance: number | null;
    answerRelevance: number | null;
  };
  evidence: EvidenceRecord[];
}

export type FailureType = "none" | "retrieval" | "generation";

export interface GoldQuestionResult {
  ticker: DemoTicker;
  question: string;
  expected: string;
  answer: string;
  retrievalHit: boolean;
  exactHit: boolean;
  purity: number;
  failureType: FailureType;
}

export interface HeldOutResult {
  ticker: DemoTicker;
  question: string;
  expected: string;
  v1Hit: boolean;
  v2Answer: string;
  v2Hit: boolean;
}

export interface JudgeResult {
  id: string;
  question: string;
  answer: string;
  groundedness: number;
  contextRelevance: number;
  answerRelevance: number;
  passAll: boolean;
}
