// APP READ-SIDE — drop this into `src/data/firestoreRepository.ts` once you:
//   1. `npx expo install firebase`
//   2. add `src/data/firebase.ts` exporting `db` (see README), and
//   3. switch the active export in `src/data/index.ts` to `firestoreRepository`.
//
// Until then it lives here so it doesn't enter the app's build (the app has no
// `firebase` dependency yet).
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category, Question } from '@/types/question';
import { CATEGORIES } from '@/types/question';
import type {
  CategorySummary,
  QuestionFilters,
  QuestionRepository,
} from './repository';

const PUBLISHED = where('is_published', '==', true);

function fromDoc(d: { id: string; data: () => any }): Question {
  const data = d.data();
  return { ...(data as Question), id: data.id ?? d.id };
}

export const firestoreRepository: QuestionRepository = {
  async list(filters = {}) {
    const constraints: any[] = [PUBLISHED];
    if (filters.category) constraints.push(where('categories', 'array-contains', filters.category));
    if (filters.limit != null) constraints.push(fbLimit(filters.limit));
    const snap = await getDocs(query(collection(db, 'questions'), ...constraints));
    let results = snap.docs.map(fromDoc);
    // Domain + title search are applied client-side (Firestore can't do both).
    if (filters.domain) results = results.filter((q) => q.domain_tags.includes(filters.domain!));
    if (filters.search) {
      const needle = filters.search.trim().toLowerCase();
      if (needle) results = results.filter((q) => q.title.toLowerCase().includes(needle));
    }
    return results;
  },

  async getById(id) {
    const snap = await getDoc(doc(db, 'questions', id));
    return snap.exists() ? fromDoc({ id: snap.id, data: () => snap.data() }) : null;
  },

  async getDaily(seed) {
    // Read the precomputed daily index, then fetch each question by id.
    const dailySnap = await getDoc(doc(db, 'daily', seed));
    if (!dailySnap.exists()) return [];
    const ids: Record<string, string> = dailySnap.data().questionIdsByCategory ?? {};
    const picks = await Promise.all(
      CATEGORIES.map((c) => (ids[c] ? this.getById(ids[c]) : Promise.resolve(null))),
    );
    return picks.filter((q): q is Question => q != null);
  },

  async getCategories() {
    const all = await this.list();
    return CATEGORIES.map<CategorySummary>((category) => ({
      category,
      count: all.filter((q) => q.categories.includes(category)).length,
    }));
  },

  async getDomains() {
    const all = await this.list();
    const set = new Set<string>();
    all.forEach((q) => q.domain_tags.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  },
};

export const CATEGORY_LIST: Category[] = CATEGORIES;
