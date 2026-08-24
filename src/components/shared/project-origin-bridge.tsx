import { ArrowDown, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";

import { experiment } from "@/data/demo";
import { cn } from "@/lib/utils/cn";

interface ProjectOriginBridgeProps {
  emphasis: "academic" | "local";
}

export function ProjectOriginBridge({ emphasis }: ProjectOriginBridgeProps) {
  const localFirst = emphasis === "local";

  return (
    <section
      className={cn("origin-bridge", localFirst && "origin-bridge--local")}
      aria-label="DualLens project origin and evolution"
    >
      <article className={cn("origin-bridge__stage", !localFirst && "is-active")}>
        <p className="origin-bridge__eyebrow">Origin / 01</p>
        <h2>Academic experiment</h2>
        <p>
          {localFirst
            ? "DualLens began as an evaluation-driven Jupyter project measuring how retrieval, grounded generation, and prompt optimization affect trust."
            : "Demo Mode reconstructs the final evaluated run: a five-company study of financial context, company-specific RAG, evaluation, optimization, and confidence routing."}
        </p>
        <div className="origin-bridge__metadata" aria-label="Academic corpus summary">
          <span>{experiment.companies} companies</span>
          <span>{experiment.pages} source pages</span>
          <span>{experiment.chunks} indexed chunks</span>
        </div>
        <NavLink to="/project" className="research-link">
          Explore the experiment <ArrowRight aria-hidden="true" className="size-4" />
        </NavLink>
      </article>

      <div className="origin-bridge__transition" aria-hidden="true">
        <ArrowRight className="origin-bridge__arrow-wide size-4" />
        <ArrowDown className="origin-bridge__arrow-narrow size-4" />
      </div>

      <article className={cn("origin-bridge__stage", localFirst && "is-active")}>
        <p className="origin-bridge__eyebrow">Evolution / 02</p>
        <h2>From measured experiment to local product</h2>
        <p>
          {localFirst
            ? "Local AI applies the same evidence-first contract to your own documents with browser-native extraction, embeddings, retrieval, generation, and persistence."
            : "The measured failures inspired a second engineering question: can the same evidence-first workflow run as a zero-backend, browser-native research application?"}
        </p>
        <div className="origin-bridge__metadata" aria-label="Portfolio architecture summary">
          <span>Local PDFs</span>
          <span>Local models</span>
          <span>IndexedDB workspace</span>
        </div>
        <NavLink to="/how-it-works" className="research-link">
          Compare both architectures <ArrowRight aria-hidden="true" className="size-4" />
        </NavLink>
      </article>
    </section>
  );
}
