import type { CategoryTag, Question } from '@/types/question';

export interface QuestionFilters {
  category?: CategoryTag;
  /** Domain tag to AND-filter against (domain filter is AND with category). */
  domain?: string;
  /** Free-text search across the title only (v1). */
  search?: string;
  limit?: number;
}

export interface CategorySummary {
  category: CategoryTag;
  count: number;
}

/**
 * The data contract for questions. `localRepository` implements this over
 * bundled data today; a `firestoreRepository` will implement the same
 * interface later, so swapping backends is a one-line change in `data/index.ts`.
 */
export interface QuestionRepository {
  list(filters?: QuestionFilters): Promise<Question[]>;
  getById(id: string): Promise<Question | null>;
  /** One question per category for today ("Today's Drill"). */
  getDaily(): Promise<Question[]>;
  getCategories(): Promise<CategorySummary[]>;
  /** All distinct domain tags present in the dataset. */
  getDomains(): Promise<string[]>;
}
