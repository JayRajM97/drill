import { z } from 'zod';

// The 6 categories surfaced in the app, plus the domain tags.
export const CATEGORIES = [
  'Product Design',
  'Product Strategy',
  'Analytical',
  'AI',
  'RCA',
  'Guesstimate',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const DOMAIN_TAGS = [
  'Mobility',
  'AI',
  'Fintech',
  'SaaS',
  'Startup',
  'Ecommerce',
  'Enterprise',
] as const;

/**
 * Schema the model must produce. `answer` uses discriminated optional fields
 * (bullets / text / table) instead of a `content` union — easier and more
 * reliable for structured outputs. We map it to the app's `AnswerSection`
 * shape (`{ heading, type, content }`) before writing to Firestore.
 */
export const GeneratedSection = z.object({
  heading: z.string(),
  type: z.enum(['bullets', 'callout', 'table', 'text']),
  bullets: z.array(z.string()).optional(),
  text: z.string().optional(),
  table: z
    .object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) })
    .optional(),
});

export const GeneratedQuestion = z.object({
  title: z.string(),
  categories: z.array(z.enum(CATEGORIES)).min(1),
  domain_tags: z.array(z.enum(DOMAIN_TAGS)).min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  question_type: z.string(),
  clarifying_questions: z.array(z.string()).min(5),
  user_segments: z.array(z.string()).min(3),
  framework: z.object({ name: z.string(), steps: z.array(z.string()).min(4) }),
  key_pointers: z.array(z.string()).min(4),
  answer: z.array(GeneratedSection).min(5),
  strong_vs_generic: z
    .array(z.object({ strong: z.string(), generic: z.string() }))
    .optional(),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestion>;

/** The app's persisted shape (matches src/types/question.ts in the app). */
export interface AnswerSection {
  heading: string;
  type: 'text' | 'bullets' | 'table' | 'callout' | 'code';
  content: string | string[] | { headers: string[]; rows: string[][] };
}

export interface Question {
  id: string;
  title: string;
  categories: string[];
  domain_tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_type: string;
  clarifying_questions: string[];
  user_segments: string[];
  framework: { name: string; steps: string[] };
  key_pointers: string[];
  answer: AnswerSection[];
  strong_vs_generic?: { strong: string; generic: string }[];
  source_url?: string;
  is_published: boolean;
  daily_date?: string;
  created_at?: unknown;
}

/** Map the generated shape to the app's `AnswerSection[]` (typed `content`). */
export function toAnswerSections(gen: GeneratedQuestion['answer']): AnswerSection[] {
  return gen.map((s) => {
    if (s.type === 'bullets') return { heading: s.heading, type: 'bullets', content: s.bullets ?? [] };
    if (s.type === 'table')
      return { heading: s.heading, type: 'table', content: s.table ?? { headers: [], rows: [] } };
    return { heading: s.heading, type: s.type, content: s.text ?? '' };
  });
}
