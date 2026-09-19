import { GeneratedQuestion, toAnswerSections, type AnswerSection } from './schema';
import type { z } from 'zod';

/**
 * Length limits taken from the bundled drills (p90 of 29 questions, 187
 * clarifiers, 236 bullets), so generated drills sit in the same range as the
 * hand-written ones instead of overflowing the cards.
 */
export const LIMITS = {
  title: 140,
  clarifying: 95,
  heading: 40,
  text: 500,
  bullet: 150,
  pointer: 110,
} as const;

type Generated = z.infer<typeof GeneratedQuestion>;

/** A clarifier must read like a question, not like a field name. */
function isSentence(s: string): boolean {
  const t = s.trim();
  if (t.length < 12) return false;
  if (!t.includes(' ')) return false; // "user_segments"
  if (/^[a-z0-9_]+$/.test(t)) return false; // snake_case identifier
  if (/_/.test(t) && !/\s/.test(t.replace(/_/g, ''))) return false;
  return true;
}

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  // Cut at a word boundary rather than mid-word.
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:\s]+$/, '') + '…';
}

export interface CleanQuestion {
  title: string;
  categories: string[];
  domain_tags: string[];
  difficulty: string;
  question_type: string;
  clarifying_questions: string[];
  user_segments: string[];
  framework: { name: string; steps: string[] };
  key_pointers: string[];
  answer: AnswerSection[];
  strong_vs_generic?: { strong: string; generic: string }[];
}

/**
 * The guarantee the UI is built on: either a drill with every part present and
 * within length, or null so the caller can retry rather than ship a card with
 * a heading and nothing under it.
 */
export function cleanQuestion(parsed: Generated | null): CleanQuestion | null {
  if (!parsed) return null;

  const title = clip(parsed.title ?? '', LIMITS.title);
  const clarifying = (parsed.clarifying_questions ?? [])
    .filter(isSentence)
    .map((c) => clip(c, LIMITS.clarifying));
  const pointers = (parsed.key_pointers ?? [])
    .filter(isSentence)
    .map((p) => clip(p, LIMITS.pointer));
  const segments = (parsed.user_segments ?? []).filter(isSentence);
  const steps = (parsed.framework?.steps ?? []).filter((s) => s && s.trim().length > 1);

  const answer = toAnswerSections(parsed.answer ?? []).map((s) => ({
    ...s,
    heading: clip(s.heading, LIMITS.heading),
    content:
      typeof s.content === 'string'
        ? clip(s.content, LIMITS.text)
        : Array.isArray(s.content)
          ? s.content.map((b) => clip(b, LIMITS.bullet))
          : s.content,
  }));

  // Anything below this and the deck has holes the UI cannot paper over.
  if (title.length < 12) return null;
  if (clarifying.length < 3) return null;
  if (answer.length < 3) return null;
  if (!parsed.framework?.name || steps.length < 3) return null;

  return {
    title,
    categories: parsed.categories ?? [],
    domain_tags: parsed.domain_tags ?? [],
    difficulty: parsed.difficulty,
    question_type: parsed.question_type ?? '',
    clarifying_questions: clarifying,
    user_segments: segments,
    framework: { name: parsed.framework.name, steps },
    key_pointers: pointers,
    answer,
    strong_vs_generic: parsed.strong_vs_generic ?? undefined,
  };
}
