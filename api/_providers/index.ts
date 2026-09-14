import { z } from 'zod';
import { GeneratedQuestion } from '../../functions/src/schema';

/**
 * One drill generator, three providers. Pick with DRILL_PROVIDER
 * ("anthropic" | "openai" | "gemini"); override the model with DRILL_MODEL.
 *
 * All three are doing the same job: take the system prompt plus the topic and
 * return an object matching GeneratedQuestion. The difference is only how each
 * SDK expresses "obey this schema".
 */
export type Provider = 'anthropic' | 'openai' | 'gemini';

export interface GenerateArgs {
  system: string;
  user: string;
  model: string;
}

export const DEFAULT_MODEL: Record<Provider, string> = {
  anthropic: 'claude-haiku-4-5',
  openai: 'gpt-5-mini',
  gemini: 'gemini-3.1-flash-lite',
};

export function activeProvider(): Provider {
  const p = (process.env.DRILL_PROVIDER ?? 'anthropic').toLowerCase();
  return p === 'openai' || p === 'gemini' ? p : 'anthropic';
}

export function activeModel(provider: Provider): string {
  return process.env.DRILL_MODEL ?? DEFAULT_MODEL[provider];
}

export function apiKeyFor(provider: Provider): string | undefined {
  if (provider === 'openai') return process.env.OPENAI_API_KEY;
  if (provider === 'gemini') return process.env.GEMINI_API_KEY;
  return process.env.ANTHROPIC_API_KEY;
}

type Generated = z.infer<typeof GeneratedQuestion>;

export async function generate(
  provider: Provider,
  apiKey: string,
  args: GenerateArgs,
): Promise<Generated | null> {
  if (provider === 'openai') return generateOpenAI(apiKey, args);
  if (provider === 'gemini') return generateGemini(apiKey, args);
  return generateAnthropic(apiKey, args);
}

/* ------------------------------ Anthropic ------------------------------ */

/**
 * Thinking is configured per model family: 4.6-and-later take adaptive,
 * Haiku 4.5 takes a fixed budget and rejects adaptive outright.
 */
function thinkingFor(model: string) {
  return model.includes('haiku')
    ? { type: 'enabled' as const, budget_tokens: 2000 }
    : { type: 'adaptive' as const };
}

async function generateAnthropic(apiKey: string, { system, user, model }: GenerateArgs) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const { zodOutputFormat } = await import('@anthropic-ai/sdk/helpers/zod');

  const client = new Anthropic({ apiKey });
  const response = await client.messages.parse({
    model,
    max_tokens: 8000,
    thinking: thinkingFor(model),
    output_config: { format: zodOutputFormat(GeneratedQuestion) },
    system,
    messages: [{ role: 'user', content: user }],
  });
  return (response.parsed_output as Generated | null) ?? null;
}

/* -------------------------------- OpenAI ------------------------------- */

async function generateOpenAI(apiKey: string, { system, user, model }: GenerateArgs) {
  const { default: OpenAI } = await import('openai');
  const { zodTextFormat } = await import('openai/helpers/zod');

  const client = new OpenAI({ apiKey });
  const response = await client.responses.parse({
    model,
    instructions: system,
    input: user,
    max_output_tokens: 8000,
    text: { format: zodTextFormat(GeneratedQuestion, 'question') },
  });
  return (response.output_parsed as Generated | null) ?? null;
}

/* -------------------------------- Gemini ------------------------------- */

async function generateGemini(apiKey: string, { system, user, model }: GenerateArgs) {
  const { GoogleGenAI } = await import('@google/genai');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: user,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      // Gemini takes raw JSON Schema rather than a zod object.
      responseJsonSchema: z.toJSONSchema(GeneratedQuestion),
      maxOutputTokens: 8000,
    },
  });

  const text = response.text;
  if (!text) return null;
  // Gemini returns JSON text, so it still has to be validated against the
  // schema — unlike the other two, nothing has parsed it for us.
  const parsed = GeneratedQuestion.safeParse(JSON.parse(text));
  return parsed.success ? parsed.data : null;
}
