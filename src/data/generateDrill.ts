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
const STREAM_ENDPOINT =
  Platform.OS === 'web' ? '/api/generate-drill-stream' : `${BASE}/api/generate-drill-stream`;

// Optional shared secret, matching DRILL_API_SECRET on the server. It is not a
// real credential — it just stops a stranger who finds the URL from spending
// the key. Leave unset and the endpoint stays open.
const CLIENT_KEY = process.env.EXPO_PUBLIC_DRILL_API_KEY;

export type GenerateResult =
  | { ok: true; question: Question; placeholder?: boolean }
  | { ok: false; error: string };

export async function generateDrill(topic: string, context?: string): Promise<GenerateResult> {
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
      body: JSON.stringify({ topic, context: context?.trim() || undefined }),
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


export interface DrillProgress {
  /** The title as far as it has been written. */
  title: string;
  /** Section headings composed so far. */
  headings: string[];
}

/**
 * Streams the drill so the card can fill in as it is written.
 *
 * React Native's fetch cannot read a response body incrementally, so this uses
 * XMLHttpRequest, whose progress events expose the text as it arrives — and
 * which behaves the same on web. Falls back to the plain endpoint whenever
 * streaming is unavailable (another provider, or an old deployment).
 */
export function generateDrillStreaming(
  topic: string,
  context: string | undefined,
  onProgress: (p: DrillProgress) => void,
): Promise<GenerateResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (r: GenerateResult) => {
      if (!settled) {
        settled = true;
        resolve(r);
      }
    };
    const fallback = () => generateDrill(topic, context).then(finish);

    let xhr: XMLHttpRequest;
    try {
      xhr = new XMLHttpRequest();
    } catch {
      void fallback();
      return;
    }

    let cursor = 0;
    const consume = () => {
      const text = xhr.responseText ?? '';
      let nl: number;
      // Only parse whole lines; the last one may still be arriving.
      while ((nl = text.indexOf('\n', cursor)) !== -1) {
        const line = text.slice(cursor, nl).trim();
        cursor = nl + 1;
        if (!line) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === 'delta') onProgress({ title: ev.title ?? '', headings: ev.headings ?? [] });
          else if (ev.type === 'done' && ev.question) finish({ ok: true, question: ev.question });
          else if (ev.type === 'error') {
            // The stream cannot retry mid-flight; the plain endpoint does,
            // so hand off rather than returning nothing.
            void fallback();
          }
        } catch {
          // A partial or malformed line: skip it rather than fail the run.
        }
      }
    };

    xhr.open('POST', STREAM_ENDPOINT);
    xhr.setRequestHeader('content-type', 'application/json');
    if (CLIENT_KEY) xhr.setRequestHeader('x-drill-key', CLIENT_KEY);
    xhr.timeout = 120_000;

    xhr.onprogress = () => {
      if (xhr.status === 200) consume();
    };
    xhr.onload = () => {
      if (xhr.status !== 200) {
        void fallback();
        return;
      }
      consume();
      // Stream ended without a terminal event.
      if (!settled) void fallback();
    };
    xhr.onerror = () => void fallback();
    xhr.ontimeout = () =>
      finish({ ok: false, error: 'That took too long. Try a shorter, more specific topic.' });

    xhr.send(JSON.stringify({ topic, context: context?.trim() || undefined }));
  });
}
