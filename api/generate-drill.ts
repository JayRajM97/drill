import { toAnswerSections } from '../functions/src/schema';
import { SYSTEM_PROMPT, buildTopicPrompt } from '../functions/src/prompt';
import { activeModel, activeProvider, apiKeyFor, generate } from './_providers';

/**
 * Turns a topic the user typed into a full Drill question.
 *
 * Provider is chosen with DRILL_PROVIDER (anthropic | openai | gemini); the
 * key for whichever one is active lives here and never reaches the app —
 * anything bundled into the client ships inside the JavaScript, where anyone
 * could read it.
 */

const MAX_TOPIC = 300;

// Best-effort throttle. Serverless instances are reused, so this catches the
// common case of one client hammering the endpoint. It is a speed bump, not a
// security control — the shared secret below is what keeps strangers out.
const RECENT = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (RECENT.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  RECENT.set(key, hits);
  if (RECENT.size > 500) RECENT.clear(); // crude guard against unbounded growth
  return hits.length > MAX_PER_WINDOW;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST.' });
    return;
  }

  const secret = process.env.DRILL_API_SECRET;
  if (secret && req.headers['x-drill-key'] !== secret) {
    res.status(401).json({ error: 'Not authorised.' });
    return;
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
  if (topic.length < 3) {
    res.status(400).json({ error: 'Tell me a bit more about what you want to practise.' });
    return;
  }
  if (topic.length > MAX_TOPIC) {
    res.status(400).json({ error: `Keep it under ${MAX_TOPIC} characters.` });
    return;
  }

  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'That is a lot of drills at once. Try again in a minute.' });
    return;
  }

  const provider = activeProvider();
  const model = activeModel(provider);
  const apiKey = apiKeyFor(provider);
  if (!apiKey) {
    // No key configured yet — hand back a clearly-labelled placeholder so the
    // whole flow (generate, save, open, practise) is testable end to end.
    res.status(200).json({ question: placeholder(topic), placeholder: true });
    return;
  }

  try {
    const parsed = await generate(provider, apiKey, {
      system: SYSTEM_PROMPT,
      user: buildTopicPrompt(topic),
      model,
    });
    if (!parsed) {
      res.status(502).json({ error: 'The model did not return a usable drill. Try rephrasing.' });
      return;
    }

    res.status(200).json({
      question: {
        id: `custom-${slugify(parsed.title)}-${Date.now().toString(36)}`,
        title: parsed.title,
        categories: parsed.categories,
        domain_tags: parsed.domain_tags,
        difficulty: parsed.difficulty,
        question_type: parsed.question_type,
        clarifying_questions: parsed.clarifying_questions,
        user_segments: parsed.user_segments,
        framework: parsed.framework,
        key_pointers: parsed.key_pointers,
        answer: toAnswerSections(parsed.answer),
        strong_vs_generic: parsed.strong_vs_generic ?? undefined,
        is_published: true,
      },
      generatedBy: `${provider}:${model}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Surface the shape of the failure without leaking the key or full trace.
    res.status(502).json({ error: `Could not generate that drill. ${message.slice(0, 160)}` });
  }
}

function safeParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function placeholder(topic: string) {
  const title = `Sample drill: ${topic.slice(0, 80)}`;
  return {
    id: `custom-sample-${Date.now().toString(36)}`,
    title,
    categories: ['Product Strategy'],
    domain_tags: ['Startup'],
    difficulty: 'Medium',
    question_type: 'Placeholder — no API key configured on the server',
    clarifying_questions: [
      'Who exactly is the user we are solving for?',
      'What business goal does this serve?',
      'What constraints are we working under?',
      'What does success look like in one quarter?',
      'What are we explicitly not doing?',
    ],
    user_segments: ['Primary user', 'Secondary user', 'The buyer'],
    framework: {
      name: 'Placeholder',
      steps: ['Clarify', 'Segment', 'Diagnose', 'Pick one bet', 'Metrics'],
    },
    key_pointers: [
      'This drill is a placeholder, not a generated answer.',
      'Set ANTHROPIC_API_KEY on the server to switch on real generation.',
      'Everything else in this flow is real: saving, opening, practising.',
      'Your topic was received intact and is shown in the title.',
    ],
    answer: [
      {
        heading: 'Not generated yet',
        type: 'callout',
        content:
          'The server has no ANTHROPIC_API_KEY set, so Drill returned this placeholder instead of calling the model. Add the key and generate again for a real drill.',
      },
      { heading: 'Your topic', type: 'text', content: topic },
      { heading: 'What would normally appear here', type: 'bullets', content: [
        'A question written the way an interviewer would ask it',
        'Clarifying questions worth asking first',
        'One prioritised bet, defended',
        'Primary and counter-metrics, plus activation',
      ] },
      { heading: 'Next step', type: 'text', content: 'Add the key in Vercel, redeploy, and try again.' },
      { heading: 'Note', type: 'text', content: 'Placeholder drills can be deleted like any other custom drill.' },
    ],
    is_published: true,
  };
}
