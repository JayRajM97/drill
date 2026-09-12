import { EMPTY_PROGRESS, type Progress } from '@/types/question';

/** Today in the device's own timezone, as YYYY-MM-DD. */
export function todayISO(d: Date = new Date()): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return todayISO(d);
}

/**
 * The current streak: consecutive days ending at the most recent active day.
 * Counting back from the last active day (rather than from today) keeps the
 * number stable until the run is actually broken by a missed day.
 */
export function streakFrom(activeDates: string[]): number {
  if (!activeDates.length) return 0;
  const days = new Set(activeDates);
  const latest = [...days].sort().pop() as string;
  let streak = 0;
  let cursor = latest;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Older saves predate `activeDates` — seed it so the streak survives upgrade. */
export function withActiveDates(p: Progress): Progress {
  if (p.activeDates?.length) return p;
  const seed = p.lastCompletedDate ? [p.lastCompletedDate] : [];
  return { ...p, activeDates: seed };
}

/**
 * Merge two devices' progress without losing anything: union the sets, then
 * recompute the streak from the combined days. Practising on a phone one day
 * and a laptop the next is a two-day streak, which a max() would have missed.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const left = withActiveDates(a);
  const right = withActiveDates(b);
  const activeDates = [...new Set([...(left.activeDates ?? []), ...(right.activeDates ?? [])])].sort();
  const lastCompletedDate = activeDates.length ? activeDates[activeDates.length - 1] : null;
  return {
    ...EMPTY_PROGRESS,
    bookmarkIds: [...new Set([...left.bookmarkIds, ...right.bookmarkIds])],
    completedIds: [...new Set([...left.completedIds, ...right.completedIds])],
    activeDates,
    lastCompletedDate,
    // Never show less than a device already earned, even if its day list is thin.
    streak: Math.max(streakFrom(activeDates), left.streak, right.streak),
  };
}

/** Record one completion, returning the updated progress. */
export function applyCompletion(prev: Progress, id: string, today = todayISO()): Progress {
  const base = withActiveDates(prev);
  const activeDates = base.activeDates?.includes(today)
    ? (base.activeDates ?? [])
    : [...(base.activeDates ?? []), today].sort();
  return {
    ...base,
    completedIds: base.completedIds.includes(id) ? base.completedIds : [...base.completedIds, id],
    activeDates,
    lastCompletedDate: today,
    streak: streakFrom(activeDates),
  };
}
