import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin AsyncStorage helpers. All progress writes go through here so the
 * persistence layer can later be redirected to Firestore without touching
 * the hooks that consume it.
 */
export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort; ignore write failures in v1
  }
}

export const STORAGE_KEYS = {
  progress: 'drill:progress:v1',
  daily: 'drill:daily:v1',
} as const;
