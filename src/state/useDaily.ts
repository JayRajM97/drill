import { useEffect, useState } from 'react';
import { questions } from '@/data';
import type { Question } from '@/types/question';

/** Today's date as YYYY-MM-DD — used as the deterministic daily seed. */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * One question per category for today. Deterministic for a given date, so the
 * selection is stable across reloads without extra persistence.
 */
export function useDaily() {
  const [daily, setDaily] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    questions.getDaily(todayKey()).then((qs) => {
      if (active) {
        setDaily(qs);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { daily, loading };
}
