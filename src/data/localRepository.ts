import type { Category, Question } from '@/types/question';
import { CATEGORIES } from '@/types/question';
import { curatedQuestions } from './curated';
import { loadCustom } from './customStore';
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

/**
 * The three case studies shown on Home rotate daily. They used to be a fixed
 * pinned list, so the same three appeared every day from install onwards.
 */
const DAILY_COUNT = 3;

/** Everything the app can show: the user's own drills first, then the bundled set. */
async function allQuestions(): Promise<Question[]> {
  return [...(await loadCustom()), ...QUESTIONS];
}

export const localRepository: QuestionRepository = {
  async list(filters = {}) {
    let results = (await allQuestions()).filter((q) => matches(q, filters));
    if (filters.limit != null) results = results.slice(0, filters.limit);
    return results;
  },

  async getById(id) {
    return (await allQuestions()).find((q) => q.id === id) ?? null;
  },

  async getDaily(seedStr) {
    // Walk the whole set from a date-derived offset, in a stride that is
    // coprime-ish with the pool, so each day gets a different trio and every
    // question comes round rather than the same three forever.
    const pool = await allQuestions();
    if (pool.length === 0) return [];
    const start = hashString(seedStr) % pool.length;
    const stride = 7;
    const picks: Question[] = [];
    for (let k = 0; picks.length < Math.min(DAILY_COUNT, pool.length); k++) {
      const q = pool[(start + k * stride) % pool.length];
      if (!picks.some((p) => p.id === q.id)) picks.push(q);
      if (k > pool.length * 2) break;
    }
    return picks;
  },

  async getCategories() {
    const all = await allQuestions();
    return CATEGORIES.map<CategorySummary>((category) => ({
      category,
      count: all.filter((q) => q.categories.includes(category)).length,
    }));
  },

  async getDomains() {
    const set = new Set<string>();
    (await allQuestions()).forEach((q) => q.domain_tags.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  },
};

export const CATEGORY_LIST: Category[] = CATEGORIES;
