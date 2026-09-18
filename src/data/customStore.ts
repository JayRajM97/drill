import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Question } from '@/types/question';

/**
 * Drills the user generated from their own prompt. They live on the device,
 * alongside the bundled set, and behave like any other drill once saved.
 */
const KEY = 'drill:custom:v1';

let cache: Question[] | null = null;

export async function loadCustom(): Promise<Question[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Question[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function write(next: Question[]): Promise<void> {
  cache = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Best-effort: the drill still works for this session.
  }
}

/** Newest first, so a freshly made drill sits at the top of the library. */
export async function addCustom(q: Question): Promise<void> {
  const existing = await loadCustom();
  await write([q, ...existing.filter((x) => x.id !== q.id)]);
}

/** Merge drills pulled from the cloud, keeping the device's own as well. */
export async function mergeCustom(incoming: Question[]): Promise<Question[]> {
  const existing = await loadCustom();
  const byId = new Map<string, Question>();
  for (const q of [...incoming, ...existing]) if (q?.id) byId.set(q.id, q);
  const merged = [...byId.values()];
  await write(merged);
  return merged;
}

export async function removeCustom(id: string): Promise<void> {
  const existing = await loadCustom();
  await write(existing.filter((x) => x.id !== id));
}

export function isCustom(id: string): boolean {
  return id.startsWith('custom-');
}
