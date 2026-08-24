import {
  BarChart3,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  CircleGauge,
  DatabaseZap,
  FileSearch,
  Files,
  FlaskConical,
  FolderSearch2,
  Info,
  LayoutDashboard,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RouteGroup =
  "Main" | "Research Lenses" | "Evaluation Lab" | "Decision Layer" | "Workspace" | "About";

export interface RouteDefinition {
  path: string;
  label: string;
  description: string;
  phase: 2 | 3;
  icon: LucideIcon;
  group: RouteGroup;
}

export const routeGroups: RouteGroup[] = [
  "Main",
  "Research Lenses",
  "Evaluation Lab",
  "Decision Layer",
  "Workspace",
  "About",
];

export const routeDefinitions: RouteDefinition[] = [
  {
    path: "/",
    label: "Overview",
    description: "The experiment, evidence chain, and final confidence route.",
    phase: 2,
    icon: LayoutDashboard,
    group: "Main",
  },
  {
    path: "/financial",
    label: "Financial Lens",
    description: "The five-company academic financial snapshot.",
    phase: 2,
    icon: BarChart3,
    group: "Research Lenses",
  },
  {
    path: "/narrative",
    label: "Narrative Lens",
    description: "AI initiative coverage and source evidence.",
    phase: 2,
    icon: FileSearch,
    group: "Research Lenses",
  },
  {
    path: "/assistant",
    label: "RAG Assistant",
    description: "Curated academic examples or local grounded research runs.",
    phase: 2,
    icon: Bot,
    group: "Research Lenses",
  },
  {
    path: "/retrieval",
    label: "Retrieval Diagnostics",
    description: "Retrieval hits, purity, and failure origins.",
    phase: 2,
    icon: FolderSearch2,
    group: "Evaluation Lab",
  },
  {
    path: "/evaluation",
    label: "LLM-as-Judge",
    description: "Groundedness, context, and answer relevance.",
    phase: 2,
    icon: Scale,
    group: "Evaluation Lab",
  },
  {
    path: "/gold-set",
    label: "Gold Set Results",
    description: "Objective exact-answer baseline results.",
    phase: 2,
    icon: BookOpenCheck,
    group: "Evaluation Lab",
  },
  {
    path: "/optimization",
    label: "GEPA Optimization",
    description: "Measured prompt evolution on held-out questions.",
    phase: 2,
    icon: FlaskConical,
    group: "Evaluation Lab",
  },
  {
    path: "/ranking",
    label: "Fused Ranking",
    description: "Financial and narrative evidence in one synthesis.",
    phase: 2,
    icon: ChartNoAxesCombined,
    group: "Decision Layer",
  },
  {
    path: "/confidence",
    label: "Confidence Routing",
    description: "Weighted trust signals and final review route.",
    phase: 2,
    icon: CircleGauge,
    group: "Decision Layer",
  },
  {
    path: "/documents",
    label: "My Documents",
    description: "Academic corpus metadata or local PDF indexing.",
    phase: 2,
    icon: Files,
    group: "Workspace",
  },
  {
    path: "/storage",
    label: "Local Storage",
    description: "Local workspace records, portability, and browser storage.",
    phase: 3,
    icon: DatabaseZap,
    group: "Workspace",
  },
  {
    path: "/project",
    label: "Project Overview",
    description: "Academic origin, problem, and portfolio evolution.",
    phase: 2,
    icon: BrainCircuit,
    group: "About",
  },
  {
    path: "/how-it-works",
    label: "How It Works",
    description: "Academic and browser-native architecture paths.",
    phase: 2,
    icon: Info,
    group: "About",
  },
];
