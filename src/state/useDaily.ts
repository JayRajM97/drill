import { useEffect, useState } from 'react';
import { questions } from '@/data';
import type { Question } from '@/types/question';

/**
 * One question per category for "Today's Drill" — the most recently added
 * question in each category (data order).
 */
export function useDaily() {
  const [daily, setDaily] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    questions.getDaily().then((qs) => {
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
