import { Binary, Cpu, FlaskConical, LockKeyhole, Network } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/shared/research-panel";

const academicSteps = [
  ["01", "Two lenses", "Financial data + five AI initiative PDFs"],
  ["02", "Index", "Chunking + OpenAI embeddings + ChromaDB"],
  ["03", "Retrieve", "Company-filtered semantic search"],
  ["04", "Generate", "Grounded GPT-4o-mini answers"],
  ["05", "Evaluate", "Gold set + LLM-as-Judge"],
  ["06", "Optimize", "GEPA held-out prompt comparison"],
  ["07", "Decide", "Fused ranking + confidence route"],
] as const;

const localSteps = [
  ["01", "Import", "User-selected PDF, processed locally"],
  ["02", "Extract", "PDF.js page-aware text"],
  ["03", "Embed", "384-dimension MiniLM vectors in WASM"],
  ["04", "Persist", "IndexedDB records through Dexie"],
  ["05", "Retrieve", "Company/document-scoped cosine search"],
  ["06", "Guard", "Evidence sufficiency and exact abstention"],
  ["07", "Generate", "Qwen via WebLLM with [S#] citations"],
] as const;

function Pipeline({ steps }: { steps: ReadonlyArray<readonly [string, string, string]> }) {
  return (
    <ol className="architecture-pipeline">
      {steps.map(([index, title, detail]) => (
        <li key={index}>
          <span>{index}</span>
          <div>
            <strong>{title}</strong>
            <p>{detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorksPage() {
  return (
    <div className="route-enter space-y-8">
      <PageHeader
        eyebrow="About / Architecture"
        title="How It Works"
        description="Two implemented architectures share one evidence contract: scope retrieval, expose sources, measure quality, and route uncertainty to review."
        snapshot={false}
      />

      <section className="architecture-comparison" aria-label="Architecture comparison">
        <article>
          <header>
            <FlaskConical aria-hidden="true" />
            <div>
              <p>Completed experiment</p>
              <h2>Academic pipeline</h2>
            </div>
            <span>Demo Mode source</span>
          </header>
          <Pipeline steps={academicSteps} />
          <footer>
            Cloud-assisted experimental baseline · results preserved as typed fixtures
          </footer>
        </article>

        <article>
          <header>
            <Cpu aria-hidden="true" />
            <div>
              <p>Browser-native runtime</p>
              <h2>Local AI pipeline</h2>
            </div>
            <span>Opt-in execution</span>
          </header>
          <Pipeline steps={localSteps} />
          <footer>No application backend · private research state stays in this browser</footer>
        </article>
      </section>

      <section className="architecture-bridge" aria-labelledby="architecture-bridge-title">
        <p>Architecture bridge</p>
        <div>
          <h2 id="architecture-bridge-title">The runtime changed; the evidence contract did not</h2>
          <p>
            Local AI preserves company scope, inspectable evidence, measured diagnostics, and honest
            abstention while replacing the notebook runtime, cloud vector database, and paid
            inference API with browser-native components.
          </p>
        </div>
        <ul aria-label="Research principles preserved in both architectures">
          <li>Scoped retrieval</li>
          <li>Visible evidence</li>
          <li>Review before trust</li>
        </ul>
      </section>

      <ResearchPanel
        title="Local model contract"
        description="Explicit models, dimensions, and runtime boundaries"
        icon={Network}
      >
        <dl className="model-contract">
          <div>
            <dt>Embedding model</dt>
            <dd>onnx-community/all-MiniLM-L6-v2-ONNX</dd>
            <span>Transformers.js · q8 · WASM · 384 dimensions</span>
          </div>
          <div>
            <dt>Generation model</dt>
            <dd>Qwen2.5-1.5B-Instruct-q4f16_1-MLC</dd>
            <span>WebLLM · WebGPU · 4096-token configured context</span>
          </div>
        </dl>
      </ResearchPanel>

      <ResearchPanel
        title="Data boundary"
        description="What crosses—and does not cross—the browser boundary"
        icon={Binary}
      >
        <div className="data-boundary">
          <div>
            <span>Static application</span>
            <strong>JavaScript, styles, and compact academic demo fixtures</strong>
          </div>
          <div>
            <span>Downloaded on demand</span>
            <strong>Embedding and language-model assets from their hosting origins</strong>
          </div>
          <div>
            <span>Local workspace</span>
            <strong>Extracted text, embeddings, questions, answers, and diagnostics</strong>
          </div>
          <div>
            <span>Never introduced</span>
            <strong>Accounts, auth tokens, API routes, analytics, or a cloud database</strong>
          </div>
        </div>
      </ResearchPanel>

      <ResearchPanel
        title="Safety contract"
        description="Capability-aware execution with no cloud inference fallback"
        icon={LockKeyhole}
      >
        <div className="safety-contract">
          <p>
            PDF and model runtimes load only when their workflow needs them. The user must
            explicitly load the local language model, and the UI reports unsupported capabilities
            instead of changing providers.
          </p>
          <p>
            Retrieved excerpts are treated as untrusted data. The versioned prompt requires source
            citations, ignores instructions found inside documents, and returns exactly
            <code>I don&apos;t know.</code> when the evidence guardrail fails.
          </p>
        </div>
      </ResearchPanel>
    </div>
  );
}
