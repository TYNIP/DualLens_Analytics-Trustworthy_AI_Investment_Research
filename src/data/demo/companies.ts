import type { DemoCompany, DemoTicker } from "./types";

export const demoCompanies: DemoCompany[] = [
  {
    ticker: "GOOGL",
    name: "Alphabet",
    rank: 1,
    pages: 7,
    chunks: 22,
    marketCapBillions: 4217.13,
    peRatio: 17.3,
    dividendYield: 0.26,
    beta: 1.24,
    revenueBillions: 445.87,
    initiatives: [
      { name: "Gemini", pages: [1, 2, 3, 5, 7] },
      { name: "Vertex AI", pages: [1, 3, 4] },
      { name: "Project Astra", pages: [5, 6, 7] },
      { name: "DeepMind", pages: [1, 2, 5, 7] },
    ],
    evidence: {
      page: 5,
      initiative: "Project Astra",
      paraphrase:
        "The source describes Astra as a Google DeepMind research prototype for a multimodal, real-time universal assistant.",
    },
    rationale:
      "The final synthesis ranked Google first, citing Project Astra, financial scale, and the breadth of its AI research and product integration.",
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    rank: 2,
    pages: 9,
    chunks: 27,
    marketCapBillions: 3588.32,
    peRatio: 26.95,
    dividendYield: 0.75,
    beta: 1.1,
    revenueBillions: 331.84,
    initiatives: [
      { name: "Azure AI Foundry Labs", pages: [1, 2, 3, 4] },
      { name: "Microsoft 365 Copilot", pages: [4, 5, 6] },
      { name: "IntelliCode", pages: [7, 8, 9] },
    ],
    evidence: {
      page: 1,
      initiative: "Azure AI Foundry Labs",
      paraphrase:
        "The corpus presents Azure AI Foundry Labs as an experimental platform intended to move advanced AI research into real applications.",
    },
    rationale:
      "Microsoft ranked second for embedding AI across Azure and productivity products while retaining substantial financial scale.",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    rank: 3,
    pages: 11,
    chunks: 33,
    marketCapBillions: 5200.73,
    peRatio: 32.88,
    dividendYield: 0.47,
    beta: 2.22,
    revenueBillions: 253.49,
    initiatives: [
      { name: "Project G-Assist", pages: [1, 2, 3] },
      { name: "DLSS 4", pages: [5, 6, 7, 8] },
      { name: "Audio Flamingo 2", pages: [9] },
      { name: "CUDA", pages: [1] },
      { name: "NIM", pages: [4] },
    ],
    evidence: {
      page: 1,
      initiative: "Project G-Assist",
      paraphrase:
        "The source identifies G-Assist as an on-device assistant for RTX PCs that provides contextual diagnostics and system control.",
    },
    rationale:
      "NVIDIA ranked third; the final synthesis connected G-Assist to an AI-centric portfolio while noting execution and experience risks.",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    rank: 4,
    pages: 9,
    chunks: 29,
    marketCapBillions: 2789.66,
    peRatio: 20.79,
    dividendYield: 0,
    beta: 1.45,
    revenueBillions: 775.68,
    initiatives: [
      { name: "SageMaker", pages: [1, 2, 3, 4, 8] },
      { name: "Olympus", pages: [4, 5, 6] },
      { name: "Bedrock", pages: [6, 7, 8, 9] },
      { name: "Trainium", pages: [2] },
    ],
    evidence: {
      page: 6,
      initiative: "Amazon Bedrock",
      paraphrase:
        "The source describes Bedrock as a managed, serverless AWS platform for building and deploying generative AI applications.",
    },
    rationale:
      "Amazon ranked fourth: Olympus and Bedrock showed ambition, while the final synthesis noted competition and data-privacy challenges.",
  },
  {
    ticker: "IBM",
    name: "IBM",
    rank: 5,
    pages: 8,
    chunks: 27,
    marketCapBillions: 222.04,
    peRatio: 20.91,
    dividendYield: 2.87,
    beta: 0.7,
    revenueBillions: 69.09,
    initiatives: [
      { name: "Granite", pages: [1, 2, 3] },
      { name: "watsonx", pages: [1, 2, 3, 4, 5, 6, 7, 8] },
      { name: "Guardium AI Security", pages: [5, 6, 7, 8] },
      { name: "Quantum", pages: [6, 7, 8] },
    ],
    evidence: {
      page: 5,
      initiative: "Guardium AI Security",
      paraphrase:
        "The source frames Guardium AI Security as protection and governance for model, data, usage, and agent-related AI risks.",
    },
    rationale:
      "IBM ranked fifth. Guardium supported a security-led narrative, but the final recommendation explicitly caveated thinner evidence.",
  },
];

export const demoCompanyByTicker = Object.fromEntries(
  demoCompanies.map((company) => [company.ticker, company]),
) as Record<DemoTicker, DemoCompany>;
