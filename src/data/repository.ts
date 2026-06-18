import type { Category, Question } from '@/types/question';

export interface QuestionFilters {
  category?: Category;
  /** Domain tag to AND-filter against (PRD: domain filter is AND with category). */
  domain?: string;
  /** Free-text search across the title only (v1). */
  search?: string;
  limit?: number;
}

export interface CategorySummary {
  category: Category;
  count: number;
}

/**
 * The data contract for questions. `localRepository` implements this over a
 * bundled JSON file today; a `firestoreRepository` will implement the same
 * interface later, so swapping backends is a one-line change in `data/index.ts`.
 */
export interface QuestionRepository {
  list(filters?: QuestionFilters): Promise<Question[]>;
  getById(id: string): Promise<Question | null>;
  /** One question per category for today (PRD "Today's Drill"). */
  getDaily(seed: string): Promise<Question[]>;
  getCategories(): Promise<CategorySummary[]>;
  /** All distinct domain tags present in the dataset. */
  getDomains(): Promise<string[]>;
}
