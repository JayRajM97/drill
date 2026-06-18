import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EMPTY_PROGRESS, type Progress } from '@/types/question';
import { getJSON, setJSON, STORAGE_KEYS } from './storage';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(prev: string, today: string): boolean {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10) === prev;
}

interface ProgressContextValue {
  progress: Progress;
  ready: boolean;
  isBookmarked: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  markCompleted: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getJSON<Progress>(STORAGE_KEYS.progress, EMPTY_PROGRESS).then((p) => {
      setProgress(p);
      setReady(true);
    });
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    void setJSON(STORAGE_KEYS.progress, next);
  }, []);

  const toggleBookmark = useCallback(
    (id: string) => {
      setProgress((prev) => {
        const has = prev.bookmarkIds.includes(id);
        const next: Progress = {
          ...prev,
          bookmarkIds: has
            ? prev.bookmarkIds.filter((x) => x !== id)
            : [...prev.bookmarkIds, id],
        };
        void setJSON(STORAGE_KEYS.progress, next);
        return next;
      });
    },
    [],
  );

  const markCompleted = useCallback((id: string) => {
    setProgress((prev) => {
      const today = todayISO();
      const completedIds = prev.completedIds.includes(id)
        ? prev.completedIds
        : [...prev.completedIds, id];

      // Streak: bump once per day. Consecutive day → +1, same day → unchanged,
      // gap → reset to 1.
      let streak = prev.streak;
      if (prev.lastCompletedDate !== today) {
        streak =
          prev.lastCompletedDate && isYesterday(prev.lastCompletedDate, today)
            ? prev.streak + 1
            : 1;
      }

      const next: Progress = {
        ...prev,
        completedIds,
        streak,
        lastCompletedDate: today,
      };
      void setJSON(STORAGE_KEYS.progress, next);
      return next;
    });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      ready,
      isBookmarked: (id) => progress.bookmarkIds.includes(id),
      isCompleted: (id) => progress.completedIds.includes(id),
      toggleBookmark,
      markCompleted,
    }),
    [progress, ready, toggleBookmark, markCompleted],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
