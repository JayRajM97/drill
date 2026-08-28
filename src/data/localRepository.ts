import type { Category, Question } from '@/types/question';
import { CATEGORIES } from '@/types/question';
import { curatedQuestions } from './curated';
import { notionQuestions } from './notionQuestions';
import type {
  CategorySummary,
  QuestionFilters,
  QuestionRepository,
} from './repository';

// Curated (hand-authored) questions first, then the enriched Notion set.
// `is_published === false` hides a question; everything else is shown.
const QUESTIONS: Question[] = [...curatedQuestions, ...notionQuestions].filter(
  (q) => q.is_published !== false,
);

/** Stable, order-preserving picker driven by a string seed (date) → index. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function matches(q: Question, f: QuestionFilters): boolean {
  if (f.category && !q.categories.includes(f.category)) return false;
  if (f.domain && !q.domain_tags.includes(f.domain)) return false;
  if (f.search) {
    const needle = f.search.trim().toLowerCase();
    if (needle && !q.title.toLowerCase().includes(needle)) return false;
  }
  return true;
}

/** Ordered ids shown in Home → Today. */
const TODAY_PINNED = [
  'position-notion-vs-confluence-google-docs',
  'q-zomato-buy-again-metrics',
  'design-netflix-for-kids',
];

export const localRepository: QuestionRepository = {
  async list(filters = {}) {
    let results = QUESTIONS.filter((q) => matches(q, filters));
    if (filters.limit != null) results = results.slice(0, filters.limit);
    return results;
  },

  async getById(id) {
    return QUESTIONS.find((q) => q.id === id) ?? null;
  },

  async getDaily(seedStr) {
    // Today is a pinned, ordered set; fall back to one-per-category picks only
    // for pinned ids that do not exist in this build.
    const pinned = TODAY_PINNED.map((id) => QUESTIONS.find((q) => q.id === id)).filter((q): q is Question => !!q);
    if (pinned.length) return pinned;
    const picks: Question[] = [];
    for (const category of CATEGORIES) {
      const pool = QUESTIONS.filter((q) => q.categories.includes(category));
      if (pool.length === 0) continue;
      const idx = hashString(`${seedStr}:${category}`) % pool.length;
      for (let k = 0; k < pool.length; k++) {
        const q = pool[(idx + k) % pool.length];
        if (!picks.some((p) => p.id === q.id)) {
          picks.push(q);
          break;
        }
      }
    }
    return picks;
  },

  async getCategories() {
    return CATEGORIES.map<CategorySummary>((category) => ({
      category,
      count: QUESTIONS.filter((q) => q.categories.includes(category)).length,
    }));
  },

  async getDomains() {
    const set = new Set<string>();
    QUESTIONS.forEach((q) => q.domain_tags.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  },
};

export const CATEGORY_LIST: Category[] = CATEGORIES;
