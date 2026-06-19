import type { CategoryTag, Question } from '@/types/question';
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

function matches(q: Question, f: QuestionFilters): boolean {
  if (f.category && !q.categories.includes(f.category)) return false;
  if (f.domain && !q.domain_tags.includes(f.domain as any)) return false;
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

  async getDaily() {
    // Today's question per category = the first (most recently added) in data
    // order. Curated questions sit at the top of QUESTIONS.
    const picks: Question[] = [];
    for (const category of CATEGORIES) {
      const first = QUESTIONS.find((q) => q.categories.includes(category));
      if (first) picks.push(first);
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

export const CATEGORY_LIST: CategoryTag[] = CATEGORIES;
