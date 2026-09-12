import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDbOrNull } from '@/auth/firebase';
import { EMPTY_PROGRESS, type Progress } from '@/types/question';
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
