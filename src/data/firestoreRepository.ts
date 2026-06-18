import type { QuestionRepository } from './repository';

/**
 * Firestore-backed repository — STUB for the future production backend.
 *
 * Firestore (not Supabase) is the intended backend. When wiring it up:
 *   1. Add the Firebase SDK (`firebase` or `@react-native-firebase/firestore`).
 *   2. Map a `questions` collection to the `Question` type.
 *   3. Implement each method below, then switch the export in `data/index.ts`.
 *
 * Kept as a typed placeholder so the app already programs against the
 * interface and the swap is a one-line change.
 */
const notImplemented = (method: string): never => {
  throw new Error(
    `firestoreRepository.${method} is not implemented yet — using localRepository in v1.`,
  );
};

export const firestoreRepository: QuestionRepository = {
  async list() {
    return notImplemented('list');
  },
  async getById() {
    return notImplemented('getById');
  },
  async getDaily() {
    return notImplemented('getDaily');
  },
  async getCategories() {
    return notImplemented('getCategories');
  },
  async getDomains() {
    return notImplemented('getDomains');
  },
};
