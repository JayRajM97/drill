// Core domain types for Drill. These mirror the PRD `questions` schema and are
// the contract every data source (local JSON now, Firestore later) conforms to.

export type Category =
  | 'Product Design'
  | 'Product Strategy'
  | 'Analytical'
  | 'Guesstimate'
  | 'AI'
  | 'RCA';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const CATEGORIES: Category[] = [
  'Product Design',
  'Product Strategy',
  'Analytical',
  'Guesstimate',
  'AI',
  'RCA',
];

/** A single section of a structured answer: a heading plus bullet points. */
export interface AnswerSection {
  heading: string;
  bullets: string[];
}

export interface FullAnswer {
  sections: AnswerSection[];
}

/** A practice question. Field names match the PRD `questions` table. */
export interface Question {
  id: string;
  title: string;
  category: Category[];
  domain_tags: string[];
  difficulty: Difficulty;
  clarifying_qs: string[];
  user_segments: string[];
  pain_points: string[];
  framework: string;
  framework_steps: string[];
  full_answer: FullAnswer;
  source_url: string;
  is_published: boolean;
}

/** Per-question, per-user practice state (PRD `user_sessions`). */
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
