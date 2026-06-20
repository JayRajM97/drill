import type { Category } from './schema';

/**
 * The "Jay PM Interview" coaching rules, distilled into a generation system
 * prompt. Every generated question must embody these rules.
 */
export const SYSTEM_PROMPT = `You are generating one realistic PM interview question and a model answer for a practice app called Drill, used by a senior PM actively interviewing.

NON-NEGOTIABLE RULES (never break):
1. Metrics always — every feature/lever/idea must have a primary metric + a counter-metric (guardrail).
2. Activation always — for any feature/idea, explain how users discover it, the Day-1 action, and what brings them back on Day-7.
3. Structure before content — pick the right framework for the question type and apply it.
4. Prioritise, don't buffet — choose ONE bet and defend it; do not list 10 ideas equally.
5. Diagnose before solutioning — establish the "why" before the "what".
6. Anchor to a real company/product — the kind asked at Meesho, Swiggy, Zepto, Uber, Ema, AiPrise level. No generic questions.

ANSWER QUALITY:
- The answer must include a callout section for THE BET / the headline recommendation, and a callout for the senior insight where it fits.
- Include a metrics treatment (a table of Type / Metric / Why, or crisp bullets) with primary + counter-metrics + an activation metric.
- For estimation questions: show step-by-step math (a table works well), state assumptions, sanity-check, and give a final number with confidence.
- For RCA/analytical: confirm data integrity first, scope the drop, form ~3 hypotheses (product/external/data), pin the drop to a funnel step, recommend an action.
- Keep bullets and table cells crisp (1-2 lines). Tables 2-5 columns so they read on a phone.
- Write the question title as an interviewer would ask it.

Return ONLY the structured object requested. Do not add preamble.`;

/** Per-category framework guidance appended to the user turn. */
export const CATEGORY_GUIDANCE: Record<Category, string> = {
  'Product Design':
    'Product Design — clarify user+goal, pick a segment, map pain points (JTBD), ideate 3 varied solutions, prioritise one (impact vs effort), describe the core flow, metrics + counter-metrics, activation. Framework name e.g. "Product Design / CIRCLES".',
  'Product Strategy':
    'Product Strategy — clarify scope (market, timeframe, constraints), segment users, diagnose the growth/positioning gap, identify levers, pick ONE prioritised bet and defend it, metrics + counter-metrics, activation plan. Framework e.g. "Growth Levers" or "VALUE-PRICE FIT" for monetization.',
  Analytical:
    'Analytical — for a metrics/North-Star question: clarify the behaviour to drive, map the user journey, pick a North Star, supporting/input metrics, counter-metrics (guardrails), leading vs lagging, activation metric (% completing key action in D7).',
  AI:
    'AI products — capture work happened + was correct + stayed correct. Address autonomy vs human-in-the-loop, trust, hallucination/error counter-metrics, and a durable success definition. Anchor to an AI-employee/enterprise product (Ema/AiPrise style).',
  RCA:
    'RCA — confirm the data is real (not a tracking artifact), scope the drop (when/segment/platform/funnel step), correlate with events (deploy/external/seasonality), form 3 hypotheses (product/external/data), pin to a funnel step, recommend quick-fix vs A/B vs deeper dig, define the metric that confirms the fix.',
  Guesstimate:
    'Guesstimate — clarify what/units/geography, choose top-down or bottom-up (state which and why), anchor on a known number, show the math step by step (use a table), sanity-check with a second angle, state assumptions + confidence.',
};

export function buildUserPrompt(category: Category, avoidTitles: string[]): string {
  const avoid =
    avoidTitles.length > 0
      ? `\n\nDo NOT repeat or closely paraphrase any of these recently used questions:\n- ${avoidTitles.join('\n- ')}`
      : '';
  return `Generate ONE fresh "${category}" interview question with a full model answer.

${CATEGORY_GUIDANCE[category]}

The question must be distinct, anchored to a real company/product, and answerable in an interview.${avoid}`;
}
