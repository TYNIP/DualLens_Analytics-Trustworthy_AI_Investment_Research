import type { HeldOutResult, JudgeResult } from "./types";

export const judgeResults: JudgeResult[] = [
  {
    id: "Q1",
    question: "What is Google's primary foundation-model family?",
    answer: "Google's primary foundation-model family is Gemini.",
    groundedness: 5,
    contextRelevance: 5,
    answerRelevance: 5,
    passAll: true,
  },
  {
    id: "Q2",
    question: "What are the main AI initiatives IBM is pursuing?",
    answer:
      "IBM's answer referenced Watson, watsonx, and Granite as scalable enterprise AI platforms and models.",
    groundedness: 5,
    contextRelevance: 5,
    answerRelevance: 5,
    passAll: true,
  },
  {
    id: "Q3",
    question: "How does NVIDIA's AI strategy differ from Amazon's AI strategy?",
    answer: "I don't know.",
    groundedness: 1,
    contextRelevance: 2,
    answerRelevance: 1,
    passAll: false,
  },
  {
    id: "Q4",
    question: "What was Microsoft's total AI revenue for fiscal year 2025?",
    answer: "I don't know.",
    groundedness: 1,
    contextRelevance: 1,
    answerRelevance: 1,
    passAll: false,
  },
  {
    id: "Q5",
    question: "What timelines are mentioned for Amazon's foundation-model initiatives?",
    answer:
      "Olympus development was described as ongoing since at least 2023; Amazon Bedrock launched in 2023.",
    groundedness: 5,
    contextRelevance: 4,
    answerRelevance: 5,
    passAll: true,
  },
];

export const heldOutResults: HeldOutResult[] = [
  {
    ticker: "AMZN",
    question: "Which Amazon custom accelerator targets model training?",
    expected: "Trainium",
    v1Hit: false,
    v2Answer: "I don't know.",
    v2Hit: false,
  },
  {
    ticker: "NVDA",
    question: "What is the NVIDIA in-game assistance initiative codenamed?",
    expected: "Flamingo",
    v1Hit: false,
    v2Answer: "The NVIDIA in-game assistance initiative is codenamed Project G-Assist.",
    v2Hit: false,
  },
  {
    ticker: "MSFT",
    question: "Which Microsoft tool delivers AI-assisted code completion?",
    expected: "IntelliCode",
    v1Hit: true,
    v2Answer: "The Microsoft tool that delivers AI-assisted code completion is IntelliCode.",
    v2Hit: true,
  },
  {
    ticker: "GOOGL",
    question: "What is Google's AI research subsidiary?",
    expected: "DeepMind",
    v1Hit: true,
    v2Answer: "Google's AI research subsidiary is DeepMind.",
    v2Hit: true,
  },
  {
    ticker: "MSFT",
    question: "What is Microsoft's flagship AI assistant product brand?",
    expected: "Copilot",
    v1Hit: true,
    v2Answer: "Microsoft 365 Copilot",
    v2Hit: true,
  },
  {
    ticker: "AMZN",
    question: "Which AWS service hosts managed foundation models?",
    expected: "Bedrock",
    v1Hit: true,
    v2Answer: "Amazon Bedrock hosts managed foundation models.",
    v2Hit: true,
  },
  {
    ticker: "IBM",
    question: "What advanced computing area does IBM emphasise alongside AI?",
    expected: "Quantum",
    v1Hit: false,
    v2Answer: "I don't know.",
    v2Hit: false,
  },
  {
    ticker: "IBM",
    question: "What is IBM's data security and governance product family?",
    expected: "Guardium",
    v1Hit: false,
    v2Answer:
      "IBM's data security and governance product family includes Guardium, Guardium AI Security, and the Guardium Data Security Center.",
    v2Hit: true,
  },
];

export const promptV1 =
  "Answer only using the supplied context. If the context is insufficient, answer exactly: I don't know. Do not invent unsupported facts or use outside knowledge.";

export const promptV2Summary = [
  "Use only the supplied context and abstain only when evidence is genuinely absent.",
  "Extract exact product or initiative names instead of vague descriptions.",
  "Keep short factual answers concise while preserving relevant specificity.",
];
