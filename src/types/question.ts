// Core domain types for Drill. Aligned to the v2 build spec: richer questions
// with typed answer sections and a structured framework.

export type CategoryTag =
  | 'Product Design'
  | 'Product Strategy'
  | 'Analytical'
  | 'AI'
  | 'RCA'
  | 'Guesstimate'
  | 'Behavioural'
  | 'Fav Product';

export type DomainTag =
  | 'Mobility'
  | 'AI'
  | 'Fintech'
  | 'SaaS'
  | 'Startup'
  | 'Ecommerce'
  | 'Enterprise';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** The six categories surfaced as home tiles, in display order. */
export const CATEGORIES: CategoryTag[] = [
  'Product Design',
  'Product Strategy',
  'Analytical',
  'AI',
  'RCA',
  'Guesstimate',
];

export interface TableData {
  headers: string[];
  rows: string[][];
}

/** One section of a structured answer; `content` shape depends on `type`. */
export interface AnswerSection {
  heading: string;
  type: 'text' | 'bullets' | 'table' | 'callout' | 'code';
  content: string | string[] | TableData;
}

/** A row in the optional "Strong answer vs. Generic" comparison. */
export interface StrongVsGenericRow {
  strong: string;
  generic: string;
}

/** A practice question (v2 schema). */
export interface Question {
  id: string;
  title: string;
  categories: CategoryTag[];
  domain_tags: DomainTag[];
  difficulty: Difficulty;
  /** One-line descriptor, e.g. "Product Design — Activation / Conversion problem". */
  question_type: string;
  clarifying_questions: string[];
  user_segments: string[];
  framework: { name: string; steps: string[] };
  /** "What a strong answer covers" hints. */
  key_pointers: string[];
  answer: AnswerSection[];
  strong_vs_generic?: StrongVsGenericRow[];
  /** Provenance for Notion-sourced questions (optional). */
  source_url?: string;
  /** Defaults to published; only `false` hides a question. */
  is_published?: boolean;
}

/** Per-question, per-user practice state. */
export interface Session {
  questionId: string;
  flipped: boolean;
  completed: boolean;
  bookmarked: boolean;
}

/** Aggregate local progress, persisted to AsyncStorage (Firestore later). */
export interface Progress {
  streak: number;
  /** ISO date (YYYY-MM-DD) of the last day a question was completed. */
  lastCompletedDate: string | null;
  bookmarkIds: string[];
  completedIds: string[];
}

export const EMPTY_PROGRESS: Progress = {
  streak: 0,
  lastCompletedDate: null,
  bookmarkIds: [],
  completedIds: [],
};
