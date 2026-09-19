import { GeneratedQuestion } from '../functions/src/schema';
import { cleanQuestion } from '../functions/src/validate';
import { SYSTEM_PROMPT, buildTopicPrompt } from '../functions/src/prompt';
import { activeModel, activeProvider, apiKeyFor } from './_providers';

/**
 * Same generation as /api/generate-drill, but streamed as newline-delimited
 * JSON so the app can show the drill being written rather than a spinner.
 *
 * Each line is one event:
 *   {"type":"delta","title":"…","headings":["…"]}   progress so far
 *   {"type":"done","question":{…}}                  the finished drill
 *   {"type":"error","error":"…"}
 *
 * Only OpenAI streams here; other providers fall back to the non-streaming
 * endpoint, which the client handles.
 */

const MAX_TOPIC = 500;
const MAX_CONTEXT = 1000;

/** Pull the title out of a partially-written JSON object. */
function partialTitle(buf: string): string {
  const m = /"title"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(buf);
  if (!m) return '';
  try {
    return JSON.parse(`"${m[1]}"`);
  } catch {
    return m[1].replace(/\\$/, '');
  }
}

/** Headings written so far, so sections can appear as they are composed. */
function partialHeadings(buf: string): string[] {
  const out: string[] = [];
  const re = /"heading"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(buf))) {
    try {
      out.push(JSON.parse(`"${m[1]}"`));
    } catch {
      out.push(m[1]);
    }
  }
  return out;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
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
  const context = typeof body?.context === 'string' ? body.context.trim().slice(0, MAX_CONTEXT) : '';
  if (topic.length < 3 || topic.length > MAX_TOPIC) {
    res.status(400).json({ error: 'Tell me a bit more about what you want to practise.' });
    return;
  }

  const provider = activeProvider();
  const apiKey = apiKeyFor(provider);
  if (provider !== 'openai' || !apiKey) {
    // Nothing to stream — the client falls back to the plain endpoint.
    res.status(409).json({ error: 'Streaming is only available on the OpenAI provider.' });
    return;
  }

  res.writeHead(200, {
    'content-type': 'application/x-ndjson; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
  });
  const send = (o: unknown) => res.write(`${JSON.stringify(o)}\n`);

  try {
    const { default: OpenAI } = await import('openai');
    const { zodTextFormat } = await import('openai/helpers/zod');

    const client = new OpenAI({ apiKey });
    const stream = await client.responses.stream({
      model: activeModel(provider),
      instructions: SYSTEM_PROMPT,
      input: buildTopicPrompt(topic, context),
      max_output_tokens: 8000,
      text: { format: zodTextFormat(GeneratedQuestion, 'question') },
    });

    let buf = '';
    let lastTitle = '';
    let lastCount = -1;

    for await (const event of stream) {
      if (event.type !== 'response.output_text.delta') continue;
      buf += event.delta ?? '';
      const title = partialTitle(buf);
      const headings = partialHeadings(buf);
      // Only speak when something visible actually changed.
      if (title !== lastTitle || headings.length !== lastCount) {
        lastTitle = title;
        lastCount = headings.length;
        send({ type: 'delta', title, headings });
      }
    }

    const final = await stream.finalResponse();
    const parsed = cleanQuestion(final.output_parsed ?? null);
    if (!parsed) {
      send({
        type: 'error',
        error: 'That drill came back incomplete. Tap again and it will usually work.',
      });
      res.end();
      return;
    }

    send({
      type: 'done',
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
        answer: parsed.answer,
        strong_vs_generic: parsed.strong_vs_generic,
        is_published: true,
      },
    });
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    send({ type: 'error', error: `Could not generate that drill. ${message.slice(0, 160)}` });
    res.end();
  }
}

function safeParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
