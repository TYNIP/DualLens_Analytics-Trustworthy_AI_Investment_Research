import { ArrowRight, CheckCircle2, Scale, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { experiment } from "@/data/demo";

const evolution = [
  {
    label: "Academic baseline",
    title: "Prove the evidence and evaluation loop",
    description:
      "A completed Jupyter experiment tested company-filtered RAG, gold-set evaluation, LLM-as-Judge, GEPA prompt optimization, fused ranking, and confidence routing.",
    stack: "Python · LangChain · ChromaDB · DSPy · OpenAI",
  },
  {
    label: "Product translation",
    title: "Make the reasoning path inspectable",
    description:
      "Typed Demo Mode fixtures preserve the measured story without presenting static notebook outputs as live market data or live model execution.",
    stack: "React · TypeScript · Vite · Tailwind · Recharts",
  },
  {
    label: "Local-first runtime",
    title: "Move private research into the browser",
    description:
      "PDF extraction, embeddings, scoped retrieval, generation, diagnostics, and persistence run on-device behind explicit capability and resource gates.",
    stack: "PDF.js · Transformers.js · WebLLM · Dexie",
  },
] as const;

const academicFlow = [
  ["RAG", "Company-filtered retrieval"],
  ["Evaluate", "LLM-as-Judge + 20-question Gold Set"],
  ["Optimize", "DSPy + GEPA on a held-out split"],
  ["Decide", "Fused ranking + confidence routing"],
] as const;

const lessons = [
  [
    "Retrieval and generation fail differently",
    "Prompt changes cannot recover evidence that never entered the context; each stage needs its own diagnostic.",
  ],
  [
    "Grounding must be inspectable",
    "A useful answer still needs visible source scope, evidence, and an explicit abstention path.",
  ],
  [
    "Optimization needs held-out proof",
    "GEPA was judged on eight questions excluded from optimization, not only on examples used to evolve the prompt.",
  ],
  [
    "Confidence must change the workflow",
    "The 79/100 result was routed to review instead of being presented as automatically trustworthy.",
  ],
] as const;

const results = [
  { value: `${experiment.companies}`, label: "companies", context: "Academic corpus" },
  { value: `${experiment.pages}`, label: "pages", context: "Academic corpus" },
  { value: `${experiment.chunks}`, label: "chunks", context: "Academic corpus" },
  {
    value: `${experiment.filteredRetrievalHit}%`,
    label: "retrieval hit",
    context: "Filtered and unfiltered slice",
  },
  { value: `${experiment.companyPurity}%`, label: "company purity", context: "Retrieval slice" },
  {
    value: `${experiment.baselineCorrect}/${experiment.baselineTotal}`,
    label: "gold baseline",
    context: `${experiment.baselineAccuracy}% exact-answer accuracy`,
  },
  {
    value: `${experiment.heldOutV1Correct}/${experiment.heldOutTotal} → ${experiment.heldOutV2Correct}/${experiment.heldOutTotal}`,
    label: "held-out GEPA",
    context: "+12.5 percentage points",
  },
  { value: `${experiment.judgeMean}%`, label: "judge mean", context: "Five judged answers" },
  {
    value: "5/5",
    label: "ranking groundedness",
    context: `${experiment.rankingGroundedness}% of ranked companies`,
  },
  {
    value: `${experiment.confidence}/100`,
    label: "confidence route",
    context: "FLAGGED for review",
    critical: true,
  },
] as const;

const decisions = [
  [
    "No backend",
    "Static delivery avoids credential handling, server operations, and recurring inference cost.",
  ],
  [
    "Two honest modes",
    "Demo Mode is precomputed; Local AI Mode is capability-dependent and user initiated.",
  ],
  [
    "Evidence before prose",
    "Retrieval scope, excerpts, citations, diagnostics, and abstention stay visible.",
  ],
  [
    "Preserved baseline",
    "The academic notebook remains the experimental record, separate from the product runtime.",
  ],
] as const;

const limitations = [
  "WebGPU is required for local generation; WASM retrieval remains available without it.",
  "The selected language model is an approximately 880 MB first download and reports about 1.63 GB VRAM.",
  "PDF extraction does not provide OCR for image-only documents and browser storage quotas vary.",
  "A small local model can be less capable than hosted frontier models; weak evidence must route to abstention or review.",
  "Academic metrics are fixed experiment results—not live market performance or investment advice.",
] as const;

export function ProjectPage() {
  return (
    <div className="route-enter space-y-8">
      <PageHeader
        eyebrow="Academic origin / Portfolio continuation"
        title="From experiment to research product"
        description="DualLens began as an academic Jupyter project asking whether AI investment research could be grounded, evaluated, optimized, and routed by confidence—not accepted on fluency alone."
        snapshot={false}
      >
        <Badge variant="success">Portfolio release · v1.0.0</Badge>
      </PageHeader>

      <section className="project-thesis" aria-labelledby="project-thesis-title">
        <span id="project-thesis-title">Good answer</span>
        <strong aria-label="does not equal">≠</strong>
        <span>Trustworthy answer</span>
        <p>
          Trust requires relevant retrieval, grounded generation, independent evaluation, measured
          optimization, and an explicit review route.
        </p>
      </section>

      <section aria-labelledby="academic-origin-title" className="case-study-section">
        <div className="case-study-intro">
          <p>01 / Original study</p>
          <div>
            <h2 id="academic-origin-title">What the academic experiment tested</h2>
            <p>
              Five technology companies were compared through quantitative financial evidence and
              qualitative AI-initiative documents, then carried through one measured research
              pipeline.
            </p>
          </div>
        </div>
        <div className="academic-research-flow">
          <div className="academic-research-flow__lenses" aria-label="Dual research lenses">
            <span>
              <small>Quantitative</small>
              Financial Lens
            </span>
            <strong aria-label="combined with">+</strong>
            <span>
              <small>Document evidence</small>
              Narrative Lens
            </span>
          </div>
          <ol aria-label="Academic evaluation pipeline">
            {academicFlow.map(([title, detail], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="evolution-title" className="case-study-section">
        <div className="case-study-intro">
          <p>02 / Evolution</p>
          <div>
            <h2 id="evolution-title">One evidence contract, three stages</h2>
            <p>
              The product changes the delivery architecture without erasing the experimental
              baseline that established its trust criteria.
            </p>
          </div>
        </div>
        <ol className="evolution-thread">
          {evolution.map((stage, index) => (
            <li key={stage.label}>
              <span className="evolution-thread__index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{stage.label}</p>
                <h3>{stage.title}</h3>
                <span>{stage.stack}</span>
                <p>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="academic-record-note">
          <span>Preserved academic record</span>
          <code>
            notebooks/academic/Week5-Project-DualLens_Analytics_Project_1_Learners_Notebook.ipynb
          </code>
          <small>The notebook is not bundled into the static application.</small>
        </p>
      </section>

      <section aria-labelledby="results-title" className="case-study-section">
        <div className="case-study-intro">
          <p>03 / Evidence</p>
          <div>
            <h2 id="results-title">Measured academic results</h2>
            <p>
              These values come from different evaluation slices. They are shown together for the
              product story, not treated as one interchangeable benchmark.
            </p>
          </div>
        </div>
        <dl className="results-ledger">
          {results.map((result) => (
            <div
              key={result.label}
              className={"critical" in result && result.critical ? "is-critical" : undefined}
            >
              <dt>{result.label}</dt>
              <dd>{result.value}</dd>
              <span>{result.context}</span>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="lessons-title" className="case-study-section">
        <div className="case-study-intro">
          <p>04 / Handoff</p>
          <div>
            <h2 id="lessons-title">Lessons carried into Local AI</h2>
            <p>
              The portfolio extension does not rerun the notebook. It converts the experiment&apos;s
              trust criteria into product and architecture decisions for a browser-native workflow.
            </p>
          </div>
        </div>
        <dl className="lesson-ledger">
          {lessons.map(([lesson, consequence]) => (
            <div key={lesson}>
              <dt>{lesson}</dt>
              <dd>{consequence}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ResearchPanel
          title="Engineering decisions"
          description="Constraints that make the trust boundary legible"
          icon={Scale}
        >
          <dl className="decision-ledger">
            {decisions.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </ResearchPanel>

        <ResearchPanel
          title="Known limitations"
          description="Operational constraints kept visible in the product"
          icon={ShieldAlert}
        >
          <ul className="limitation-list">
            {limitations.map((limitation) => (
              <li key={limitation}>
                <CheckCircle2 aria-hidden="true" />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </ResearchPanel>
      </div>

      <section className="case-study-next" aria-labelledby="next-title">
        <div>
          <p>Architecture</p>
          <h2 id="next-title">Trace both implementations step by step</h2>
          <span>
            Compare the completed academic pipeline with the browser-native Local AI pipeline and
            its data boundary.
          </span>
        </div>
        <Button asChild variant="secondary">
          <Link to="/how-it-works">
            How it works <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
