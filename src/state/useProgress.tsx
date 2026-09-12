import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { EMPTY_PROGRESS, type Progress } from '@/types/question';
import { applyCompletion, mergeProgress, withActiveDates } from './progressMath';
import { loadRemoteProgress, saveRemoteProgress } from './cloudProgress';
import { getJSON, setJSON, STORAGE_KEYS } from './storage';

export type SyncState = 'off' | 'local' | 'syncing' | 'synced' | 'error';

interface ProgressContextValue {
  progress: Progress;
  ready: boolean;
  sync: SyncState;
  isBookmarked: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  markCompleted: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { account, ready: authReady, configured } = useAuth();
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>(configured ? 'local' : 'off');

  // The uid whose cloud copy we have already merged with. Until this matches
  // the signed-in user, local writes must NOT be pushed — they would clobber
  // a richer history sitting in the cloud.
  const mergedUid = useRef<string | null>(null);
  const latest = useRef<Progress>(EMPTY_PROGRESS);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped to retry a sync that failed — e.g. signing in with no connection.
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setRetry((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    getJSON<Progress>(STORAGE_KEYS.progress, EMPTY_PROGRESS).then((p) => {
      const seeded = withActiveDates(p);
      latest.current = seeded;
      setProgress(seeded);
      setReady(true);
    });
  }, []);

  /** Writes locally now, and schedules a cloud push if we are in sync. */
  const persist = useCallback((next: Progress) => {
    latest.current = next;
    setProgress(next);
    void setJSON(STORAGE_KEYS.progress, next);

    const uid = mergedUid.current;
    if (!uid) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    // Coalesce bursts (tapping several bookmarks) into one write.
    pushTimer.current = setTimeout(() => {
      saveRemoteProgress(uid, latest.current)
        .then(() => setSync('synced'))
        .catch(() => setSync('error'));
    }, 1200);
  }, []);

  // Sign in: pull the cloud copy, merge it with whatever this device has,
  // then write the union back to both. Sign out: keep working locally.
  useEffect(() => {
    if (!configured) {
      setSync('off');
      return;
    }
    if (!ready || !authReady) return;

    if (!account) {
      mergedUid.current = null;
      setSync('local');
      return;
    }
    if (mergedUid.current === account.uid) return;

    let cancelled = false;
    setSync('syncing');
    loadRemoteProgress(account.uid)
      .then((remote) => {
        if (cancelled) return;
        const merged = remote ? mergeProgress(latest.current, remote) : withActiveDates(latest.current);
        latest.current = merged;
        setProgress(merged);
        void setJSON(STORAGE_KEYS.progress, merged);
        mergedUid.current = account.uid;
        return saveRemoteProgress(account.uid, merged);
      })
      .then(() => {
        if (!cancelled) setSync('synced');
      })
      .catch(() => {
        if (!cancelled) setSync('error');
      });

    return () => {
      cancelled = true;
    };
  }, [account, ready, authReady, configured, retry]);

  useEffect(() => () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
  }, []);

  const toggleBookmark = useCallback(
    (id: string) => {
      const prev = latest.current;
      const has = prev.bookmarkIds.includes(id);
      persist({
        ...prev,
        bookmarkIds: has ? prev.bookmarkIds.filter((x) => x !== id) : [...prev.bookmarkIds, id],
      });
    },
    [persist],
  );

  const markCompleted = useCallback(
    (id: string) => {
      persist(applyCompletion(latest.current, id));
    },
    [persist],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      ready,
      sync,
      isBookmarked: (id) => progress.bookmarkIds.includes(id),
      isCompleted: (id) => progress.completedIds.includes(id),
      toggleBookmark,
      markCompleted,
    }),
    [progress, ready, sync, toggleBookmark, markCompleted],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
