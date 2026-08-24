import { demoCompanyByTicker } from "./companies";
import type { DemoQuestion, DemoTicker, EvidenceRecord } from "./types";

function corpusEvidence(ticker: DemoTicker, initiative: string, pages: number[]): EvidenceRecord {
  const company = demoCompanyByTicker[ticker];
  return {
    id: `${ticker}-${initiative.toLowerCase().replaceAll(" ", "-")}`,
    rank: 1,
    company: ticker,
    document: `${ticker}.pdf`,
    pageLabel: `Corpus coverage: p.${pages.join(", ")}`,
    chunkId: null,
    score: null,
    text: company.evidence.paraphrase,
    contributed: true,
    provenance: "corpus-coverage",
  };
}

export const demoQuestions: DemoQuestion[] = [
  {
    id: "google-gemini",
    company: "GOOGL",
    question: "What is Google's primary foundation-model family?",
    answer: "Google's primary foundation-model family is Gemini.",
    status: "passed",
    source: "Judge harness Q1 · precomputed academic run",
    judges: { groundedness: 5, contextRelevance: 5, answerRelevance: 5 },
    evidence: [corpusEvidence("GOOGL", "Gemini", [1, 2, 3, 5, 7])],
  },
  {
    id: "nvidia-initiatives",
    company: "NVDA",
    question: "What are the main AI initiatives NVIDIA is working on?",
    answer:
      "The academic run identified Project G-Assist, an on-device AI assistant for GeForce RTX PCs, and DLSS 4, an AI-driven upscaling and frame-generation technology.",
    status: "observed",
    source: "Notebook narrative query output · precomputed academic run",
    judges: { groundedness: null, contextRelevance: null, answerRelevance: null },
    evidence: [
      corpusEvidence("NVDA", "Project G-Assist", [1, 2, 3]),
      { ...corpusEvidence("NVDA", "DLSS 4", [5, 6, 7, 8]), id: "NVDA-dlss-4", rank: 2 },
    ],
  },
  {
    id: "amazon-timeline",
    company: "AMZN",
    question: "What timelines are mentioned for Amazon's foundation-model initiatives?",
    answer:
      "Olympus development was described as ongoing since at least 2023, while Amazon Bedrock launched in 2023 and was operational in the source snapshot.",
    status: "passed",
    source: "Judge harness Q5 · precomputed academic run",
    judges: { groundedness: 5, contextRelevance: 4, answerRelevance: 5 },
    evidence: [corpusEvidence("AMZN", "Bedrock", [6, 7, 8, 9])],
  },
  {
    id: "ibm-guardium",
    company: "IBM",
    question: "What is IBM's data security and governance product family?",
    answer:
      "The GEPA-optimized v2 answer identified Guardium, including Guardium AI Security and the Guardium Data Security Center.",
    status: "improved",
    source: "Held-out v2 result · corrected by the optimized program",
    judges: { groundedness: null, contextRelevance: null, answerRelevance: null },
    evidence: [corpusEvidence("IBM", "Guardium AI Security", [5, 6, 7, 8])],
  },
  {
    id: "strategy-comparison-failure",
    company: "NVDA",
    question: "How does NVIDIA's AI strategy differ from Amazon's AI strategy?",
    answer: "I don't know.",
    status: "failed",
    source: "Judge harness Q3 · precomputed academic run",
    judges: { groundedness: 1, contextRelevance: 2, answerRelevance: 1 },
    evidence: [
      {
        id: "Q3-context-gap",
        rank: 1,
        company: "NVDA",
        document: "Academic judge output",
        pageLabel: "Exact retrieved page not persisted",
        chunkId: null,
        score: null,
        text: "The saved run recorded insufficient comparative context and did not persist the retrieved passages or similarity values.",
        contributed: false,
        provenance: "notebook-output",
      },
    ],
  },
];
