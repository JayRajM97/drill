import type {
  AnswerSection,
  CategoryTag,
  DomainTag,
  Difficulty,
  Question,
} from '@/types/question';
import legacyJson from '../../assets/seed/legacy-notion.json';

/** Shape of the original Notion-seeded records (assets/seed/legacy-notion.json). */
interface LegacyQuestion {
  id: string;
  title: string;
  category: string[];
  domain_tags: string[];
  difficulty: Difficulty;
  clarifying_qs: string[];
  user_segments: string[];
  pain_points: string[];
  framework: string;
  framework_steps: string[];
  full_answer: { sections: { heading: string; bullets: string[] }[] };
  source_url: string;
  is_published: boolean;
}

/**
 * Legacy ids whose content is superseded by a hand-authored curated question
 * (see curated.ts). These are dropped so we don't show two versions.
 */
export const SUPERSEDED_LEGACY_IDS = new Set<string>([
  'design-meesho-tier3-first-purchase',
  'design-zepto-oos-cart-abandonment',
  'grow-ubereats-user-base',
  'monetization-price-package-uber-mobility',
  'north-star-ai-employee-ema',
  'design-human-in-the-loop-ema-autonomy',
  'design-system-track-review-abuse-amazon',
  'rca-hallucination-spike-one-client',
]);

const KNOWN_CATEGORIES = new Set<CategoryTag>([
  'Product Design',
  'Product Strategy',
  'Analytical',
  'AI',
  'RCA',
  'Guesstimate',
  'Behavioural',
  'Fav Product',
]);

const KNOWN_DOMAINS = new Set<DomainTag>([
  'Mobility',
  'AI',
  'Fintech',
  'SaaS',
  'Startup',
  'Ecommerce',
  'Enterprise',
]);

function toQuestion(l: LegacyQuestion): Question {
  const categories = l.category.filter((c): c is CategoryTag =>
    KNOWN_CATEGORIES.has(c as CategoryTag),
  );
  const domain_tags = l.domain_tags.filter((d): d is DomainTag =>
    KNOWN_DOMAINS.has(d as DomainTag),
  );

  // The structured prose answer maps to bullet sections; pain_points carry the
  // "key pointers" role they served in the original card stack.
  const answer: AnswerSection[] = l.full_answer.sections.map((s) => ({
    heading: s.heading,
    type: 'bullets',
    content: s.bullets,
  }));

  return {
    id: l.id,
    title: l.title,
    categories: categories.length ? categories : ['Product Design'],
    domain_tags,
    difficulty: l.difficulty,
    question_type: `${categories[0] ?? 'PM'} — Practice question`,
    clarifying_questions: l.clarifying_qs,
    user_segments: l.user_segments,
    framework: { name: l.framework, steps: l.framework_steps },
    key_pointers: l.pain_points,
    answer,
    source_url: l.source_url,
    is_published: l.is_published,
  };
}

export const legacyQuestions: Question[] = (legacyJson as LegacyQuestion[])
  .filter((l) => !SUPERSEDED_LEGACY_IDS.has(l.id))
  .map(toQuestion);
