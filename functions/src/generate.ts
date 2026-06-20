import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { GeneratedQuestion, type Category } from './schema';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';

// User-selected model. Sonnet 4.6 is the cheaper choice for daily volume;
// swap to "claude-opus-4-8" for the highest-quality answers.
const MODEL = 'claude-sonnet-4-6';

/**
 * Generate one structured question for a category, avoiding the given titles.
 * Uses structured outputs so the result already matches our schema.
 */
export async function generateForCategory(
  client: Anthropic,
  category: Category,
  avoidTitles: string[],
): Promise<GeneratedQuestion> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: { format: zodOutputFormat(GeneratedQuestion, 'question') },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(category, avoidTitles) }],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error(
      `Generation for "${category}" did not return a valid question (stop_reason: ${response.stop_reason}).`,
    );
  }
  return parsed;
}
