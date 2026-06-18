import { localRepository } from './localRepository';
// import { firestoreRepository } from './firestoreRepository';
import type { QuestionRepository } from './repository';

// Active data source. v1 is local-only; swap to `firestoreRepository` here
// once Firestore is wired up — nothing else in the app needs to change.
export const questions: QuestionRepository = localRepository;

export * from './repository';
