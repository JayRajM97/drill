import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDbOrNull } from '@/auth/firebase';
import { EMPTY_PROGRESS, type Progress, type Question } from '@/types/question';
import { withActiveDates } from './progressMath';

/** One document per user: users/{uid}. Firestore rules restrict it to its owner. */
function progressDoc(uid: string) {
  const db = getDbOrNull();
  return db ? doc(db, 'users', uid) : null;
}

export async function loadRemoteProgress(uid: string): Promise<Progress | null> {
  const ref = progressDoc(uid);
  if (!ref) return null;
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data() as Partial<Progress>;
  return withActiveDates({
    ...EMPTY_PROGRESS,
    streak: typeof d.streak === 'number' ? d.streak : 0,
    lastCompletedDate: d.lastCompletedDate ?? null,
    bookmarkIds: Array.isArray(d.bookmarkIds) ? d.bookmarkIds : [],
    completedIds: Array.isArray(d.completedIds) ? d.completedIds : [],
    activeDates: Array.isArray(d.activeDates) ? d.activeDates : undefined,
  });
}

export async function saveRemoteProgress(uid: string, p: Progress): Promise<void> {
  const ref = progressDoc(uid);
  if (!ref) return;
  const full = withActiveDates(p);
  await setDoc(
    ref,
    {
      streak: full.streak,
      lastCompletedDate: full.lastCompletedDate,
      bookmarkIds: full.bookmarkIds,
      completedIds: full.completedIds,
      activeDates: full.activeDates ?? [],
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}


/**
 * Drills the user generated live at users/{uid}/drills/{id} — one document
 * each rather than a field on the progress doc, because a drill is several
 * kilobytes and Firestore caps a document at a megabyte.
 */
function drillsCollection(uid: string) {
  const db = getDbOrNull();
  return db ? collection(db, 'users', uid, 'drills') : null;
}

export async function loadRemoteDrills(uid: string): Promise<Question[]> {
  const col = drillsCollection(uid);
  if (!col) return [];
  const snap = await getDocs(col);
  return snap.docs.map((d) => d.data() as Question).filter((q) => q && q.id && q.title);
}

export async function saveRemoteDrill(uid: string, q: Question): Promise<void> {
  const col = drillsCollection(uid);
  if (!col) return;
  await setDoc(doc(col, q.id), q, { merge: true });
}
