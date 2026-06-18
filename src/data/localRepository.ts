import type { Category, Question } from '@/types/question';
import { CATEGORIES } from '@/types/question';
import seed from '../../assets/seed/questions.json';
import type {
  CategorySummary,
  QuestionFilters,
  QuestionRepository,
} from './repository';

// The bundled seed is generated from Notion at build time (see scripts/README).
// Cast through unknown because JSON loses the literal-union typing.
const QUESTIONS = (seed as unknown as Question[]).filter((q) => q.is_published);

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
  if (f.category && !q.category.includes(f.category)) return false;
  if (f.domain && !q.domain_tags.includes(f.domain)) return false;
  if (f.search) {
    const needle = f.search.trim().toLowerCase();
    if (needle && !q.title.toLowerCase().includes(needle)) return false;
  }
  return true;
}

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
    const picks: Question[] = [];
    for (const category of CATEGORIES) {
      const pool = QUESTIONS.filter((q) => q.category.includes(category));
      if (pool.length === 0) continue;
      const idx = hashString(`${seedStr}:${category}`) % pool.length;
      picks.push(pool[idx]);
    }
    return picks;
  },

  async getCategories() {
    return CATEGORIES.map<CategorySummary>((category) => ({
      category,
      count: QUESTIONS.filter((q) => q.category.includes(category)).length,
    }));
  },

  async getDomains() {
    const set = new Set<string>();
    QUESTIONS.forEach((q) => q.domain_tags.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  },
};

export const CATEGORY_LIST: Category[] = CATEGORIES;
