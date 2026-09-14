import { Platform } from 'react-native';
import type { Question } from '@/types/question';

/**
 * Calls the server that turns a topic into a drill. The Anthropic key lives
 * there, never here — anything in the app ships inside the JS bundle.
 *
 * On web we can use a relative path (same origin as the site). The phone has
 * no origin, so it needs the deployed URL.
 */
const BASE = process.env.EXPO_PUBLIC_DRILL_API ?? 'https://drill-inky.vercel.app';
const ENDPOINT = Platform.OS === 'web' ? '/api/generate-drill' : `${BASE}/api/generate-drill`;

// Optional shared secret, matching DRILL_API_SECRET on the server. It is not a
// real credential — it just stops a stranger who finds the URL from spending
// the key. Leave unset and the endpoint stays open.
const CLIENT_KEY = process.env.EXPO_PUBLIC_DRILL_API_KEY;

export type GenerateResult =
  | { ok: true; question: Question; placeholder?: boolean }
  | { ok: false; error: string };

export async function generateDrill(topic: string): Promise<GenerateResult> {
  try {
    // Generation takes a while; give it room but don't hang forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(CLIENT_KEY ? { 'x-drill-key': CLIENT_KEY } : {}),
      },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = (await res.json().catch(() => null)) as
      | { question?: Question; placeholder?: boolean; error?: string }
      | null;

    if (!res.ok || !data?.question) {
      return { ok: false, error: data?.error ?? `Generation failed (${res.status}).` };
    }
    return { ok: true, question: data.question, placeholder: data.placeholder };
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      return { ok: false, error: 'That took too long. Try a shorter, more specific topic.' };
    }
    return { ok: false, error: 'Could not reach the drill server. Check your connection.' };
  }
}
