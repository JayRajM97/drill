// The framework toolbox: the structures the answers in this app actually use,
// written up so they can be learned on their own. Each one links back to the
// drills that apply it (by question id) so the abstract and the concrete sit
// side by side.

import type { Category } from '@/types/question';

export interface FrameworkStep {
  /** Short pill label. */
  label: string;
  /** What to actually say / do at this step. */
  detail: string;
}

export interface Framework {
  key: string;
  name: string;
  emoji: string;
  categories: Category[];
  /** One sentence: what the framework is for. */
  oneLiner: string;
  /** When to reach for it — the question shapes it fits. */
  whenToUse: string;
  steps: FrameworkStep[];
  /** How people misuse it. */
  trap: string;
  /** Question ids in this app that use it. */
  drills: string[];
  /** Well-known public cousin, if any. */
  alsoKnownAs?: string;
}

export const FRAMEWORKS: Framework[] = [
  // ---------------------------------------------------------------- Design
  {
    key: 'pain-point-design',
    name: 'Users → Pain → Solution → Metrics',
    emoji: '🎯',
    categories: ['Product Design'],
    alsoKnownAs: 'CIRCLES, design-thinking loop',
    oneLiner: 'The default shape for any "design X" or "improve Y" question.',
    whenToUse: 'Design a feature, redesign a flow, build X for segment Y, reduce a drop-off. Anything where the answer is a product change.',
    steps: [
      { label: 'Clarify', detail: 'Pin the scope in one breath: platform, user, geography, what "success" means. Then move on — do not stall here.' },
      { label: 'Users', detail: 'Name 3–4 segments and pick ONE to build for. Say who you are not building for and why.' },
      { label: 'Pain points', detail: 'Walk their journey and list the pains. Rank by severity × frequency; pick the top one or two.' },
      { label: 'Solutions', detail: 'Ideate 3–4 options, score on impact vs effort, choose one and go deep: the flow, the edge cases.' },
      { label: 'Metrics', detail: 'One primary metric tied to the pain, 2 supporting, 1–2 counter-metrics so you cannot win by accident.' },
      { label: 'Trade-offs', detail: 'Say what you gave up and what could go wrong. This is what separates senior from junior.' },
    ],
    trap: 'Jumping to a solution before naming the user and the pain. If your first sentence has a feature in it, restart.',
    drills: [
      'q-meesho-first-buyer',
      'q-zepto-cart-abandonment',
      'design-netflix-for-kids',
      'design-parking-features-google-maps',
      'design-recommendation-system-ecommerce',
      'design-zepto-cart-abandonment-checkout',
    ],
  },
  {
    key: 'flow-critique',
    name: 'Walk the flow → Friction → Fix',
    emoji: '🔍',
    categories: ['Product Design'],
    oneLiner: 'For "critique this app / flow" questions: audit, do not redesign.',
    whenToUse: 'App critique, onboarding review, "what would you change about X". The interviewer wants structured judgement, not a new product.',
    steps: [
      { label: 'Set context', detail: 'Who is the user, what is their goal in this flow, what does the business want from it.' },
      { label: 'Walk the flow', detail: 'Step through it screen by screen, out loud. Name what each screen is trying to do.' },
      { label: 'Find friction', detail: 'At each step: confusion, effort, doubt, dead ends. Tag severity (blocks / slows / annoys).' },
      { label: 'Prioritise', detail: 'Pick the top 2–3 frictions by severity × how many users hit them.' },
      { label: 'Propose fixes', detail: 'One concrete fix per friction, and the metric each should move.' },
      { label: 'Tie to goal', detail: 'Close by linking the fixes back to the user goal and the business goal.' },
    ],
    trap: 'Listing 15 nitpicks with equal weight. Three ranked problems beat fifteen unranked ones.',
    drills: ['app-critique-linkedin-job-application-flow', 'critique-linkedin-onboarding-new-graduates'],
  },
  {
    key: 'favourite-product',
    name: 'Pick → Problems solved → Vision',
    emoji: '💚',
    categories: ['Product Design'],
    oneLiner: 'For "what is your favourite product and why" — show PM thinking, not fandom.',
    whenToUse: 'Favourite product, a product you admire, a product you would improve.',
    steps: [
      { label: 'Pick', detail: 'Choose something you genuinely use and can talk about at depth. Not the interviewer\'s product.' },
      { label: '3 problems', detail: 'The three user problems it solves better than anything else, each in one line.' },
      { label: 'PM wrap', detail: 'Why it works as a business: the loop, the moat, the metric it must be optimising.' },
      { label: 'Vision', detail: 'Where it should go next and one thing you would change.' },
      { label: 'Differentiate', detail: 'Name the alternative and the structural reason this wins.' },
    ],
    trap: 'Describing features. Every sentence should be about a user problem or a business mechanic.',
    drills: ['favorite-product-duolingo'],
  },
  {
    key: 'trust-ladder',
    name: 'Action × Risk × Confidence',
    emoji: '🪜',
    categories: ['AI', 'Product Design'],
    alsoKnownAs: 'Human-in-the-loop trust ladder',
    oneLiner: 'Decide when an AI should act on its own, ask, or stay out of the way.',
    whenToUse: 'Autonomy vs approval, AI agents, review flows, "when should the model act without asking".',
    steps: [
      { label: 'Segment users', detail: 'Delegators vs cautious operators vs first-week users. Trust is per-person, not global.' },
      { label: 'Score actions', detail: 'Each action gets a risk (reversible? blast radius?) and the model gets a confidence.' },
      { label: 'Ladder', detail: 'Low risk + high confidence → act and notify. High risk or low confidence → propose and wait. Middle → act with an undo window.' },
      { label: 'Earn trust', detail: 'Precedent moves actions up the ladder: N clean approvals unlocks auto-mode for that action type.' },
      { label: 'Design the ask', detail: 'Approval requests show what, why, evidence, and one-tap approve / edit / reject.' },
      { label: 'Instrument', detail: 'Approval rate, edit distance, override rate, time-to-approve, and incidents per 1k autonomous actions.' },
    ],
    trap: 'One global "autonomy slider". Trust has to be per action type and per user, or it is either useless or dangerous.',
    drills: ['q-ema-hitl', 'design-trust-layer-enterprise-ai'],
  },
  {
    key: 'eval-loop',
    name: 'Capture → Aggregate → Eval-gate → Deploy',
    emoji: '🔁',
    categories: ['AI', 'Product Design'],
    oneLiner: 'Turn user corrections into safe model improvements.',
    whenToUse: 'Feedback mechanisms for AI output, "how do you learn from corrections", quality loops.',
    steps: [
      { label: 'Capture', detail: 'Collect feedback in the natural flow — edits, approvals, flags — never a survey.' },
      { label: 'Categorise', detail: 'Auto-label the diff: factual, format, tone, omission, hallucination.' },
      { label: 'Aggregate', detail: 'Roll up across users and time so one quirky user cannot steer the model.' },
      { label: 'Eval-gate', detail: 'Any change must pass the full eval set before it ships — no regressions for a fix.' },
      { label: 'Deploy safely', detail: 'Versioned, rollback-able, per-tenant first, then global.' },
      { label: 'Close the loop', detail: 'Show the user their feedback changed something. That is what keeps feedback coming.' },
    ],
    trap: 'Retraining on raw feedback. Without aggregation and an eval gate you ship one user\'s preference as everyone\'s bug.',
    drills: ['design-feedback-mechanism-ema-corrections'],
  },
  {
    key: 'trust-safety',
    name: 'Define abuse → Segment → Detect → Enforce → Measure',
    emoji: '🛡️',
    categories: ['Product Design', 'Analytical'],
    oneLiner: 'Systems that fight fraud, spam, fake reviews and other adversaries.',
    whenToUse: 'Review abuse, fake accounts, fraud, harassment, anything with an adversary who adapts.',
    steps: [
      { label: 'Define abuse', detail: 'Precisely: what counts, what is merely low quality, and why it hurts trust.' },
      { label: 'Segment actors', detail: 'Group bad actors by motive and signal — each segment gets its own detection.' },
      { label: 'Detect', detail: 'A score, not a rule: combine behavioural, network and content signals.' },
      { label: 'Enforce', detail: 'Graduated: down-weight → shadow → remove → ban. Reversible before irreversible.' },
      { label: 'Experiment', detail: 'Holdouts to prove enforcement lifts trust without killing honest volume.' },
      { label: 'Measure', detail: 'Prevalence, precision / recall, false-positive appeals, and the trust metric you set out to move.' },
    ],
    trap: 'Optimising catch rate. Precision matters more — one honest user wrongly banned costs more than ten fakes missed.',
    drills: ['q-amazon-reviews-abuse'],
  },
  // -------------------------------------------------------------- Strategy
  {
    key: 'positioning-stack',
    name: 'The Positioning Stack',
    emoji: '🧭',
    categories: ['Product Strategy'],
    alsoKnownAs: 'April Dunford, "Obviously Awesome"',
    oneLiner: 'Category → target → alternatives → gap → statement → proof → metrics.',
    whenToUse: '"How would you position X vs Y", go-to-market messaging, "why would anyone switch".',
    steps: [
      { label: 'Category', detail: 'Name the category you are playing in — or creating. The wrong category shrinks your market and your price.' },
      { label: 'Target', detail: 'The one customer this is for, and explicitly who it is NOT for.' },
      { label: 'Alternatives', detail: 'What people actually switch from (often a spreadsheet, not a competitor).' },
      { label: 'The gap', detail: 'The structural thing alternatives cannot do without becoming something else.' },
      { label: 'Statement', detail: 'One quotable sentence: for [target] who [need], X is the [category] that [gap].' },
      { label: 'Proof', detail: 'Two or three proof points and the aha moment where the user feels the gap close.' },
      { label: 'Metrics', detail: 'Is the positioning landing? Win rate vs the named alternative, message recall, time-to-aha.' },
    ],
    trap: 'Positioning against the biggest competitor instead of against what customers actually use today.',
    drills: ['position-notion-vs-confluence-google-docs'],
  },
  {
    key: 'value-price-fit',
    name: 'Value–Price Fit',
    emoji: '💳',
    categories: ['Product Strategy'],
    oneLiner: 'Who pays, for what value, how much, in what model, packaged how.',
    whenToUse: 'Pricing, packaging, monetisation, subscriptions, take rates.',
    steps: [
      { label: 'Payer', detail: 'Segment who pays — user, driver, restaurant, advertiser. Each is a different pricing problem.' },
      { label: 'Value', detail: 'What they actually get: time, convenience, income, reach. Quantify it where you can.' },
      { label: 'Willingness', detail: 'Price sensitivity by segment; the reference price in their head.' },
      { label: 'Model', detail: 'Per-use, subscription, freemium, marketplace take rate — pick the one that matches the value rhythm.' },
      { label: 'Package', detail: 'Tiers, bundles, add-ons. Anchor with a decoy; make the target tier obvious.' },
      { label: 'Metrics', detail: 'ARPU, attach rate, churn by tier, and the counter-metric: volume lost to the price.' },
    ],
    trap: 'Starting from the price. Start from the value and the payer; the price falls out.',
    drills: ['q-uber-monetization', 'monetization-price-package-uber-swiggy'],
  },
  {
    key: 'growth-bet',
    name: 'Diagnose the engine → Find the ceiling → One bet',
    emoji: '🚀',
    categories: ['Product Strategy'],
    oneLiner: 'For "how would you grow / 10x / monetise X" — one defended bet, not a list.',
    whenToUse: 'Grow the user base, 10x the business, new revenue lines, "what would you do as CEO".',
    steps: [
      { label: 'Define the goal', detail: 'What does 10x mean and over what horizon — users, revenue, or margin?' },
      { label: 'Diagnose', detail: 'Acquisition, engagement, monetisation: which is strong, which is the ceiling?' },
      { label: 'Reframe assets', detail: 'What does the company own that is undermonetised or underused?' },
      { label: 'Generate levers', detail: 'Three or four genuinely new levers — not "add ads", not "expand".' },
      { label: 'Pick one bet', detail: 'Go deep on one. Say why this and not the others.' },
      { label: 'Metrics & risks', detail: 'North Star for the bet, counter-metrics, and the two things that could kill it.' },
    ],
    trap: 'Presenting five ideas at equal depth. The interviewer is testing whether you can choose.',
    drills: ['q-ubereats-growth', 'how-would-you-10x-duolingo', 'whatsapp-monetization-strategy'],
  },
  {
    key: 'now-next-later',
    name: 'Now / Next / Later with a North Star',
    emoji: '🗺️',
    categories: ['Product Strategy'],
    oneLiner: 'Sequence a strategy over time; each phase gets its own metric.',
    whenToUse: 'Market entry, 1-year strategy, roadmaps, "how would you launch in country X".',
    steps: [
      { label: 'North Star', detail: 'What does winning look like at month 12? One number.' },
      { label: 'Current state', detail: 'Assets and liabilities going in — what you can lean on and what you lack.' },
      { label: 'Entry point', detail: 'Pick the beachhead (city-first, segment-first) and defend the choice.' },
      { label: 'Now (0–3M)', detail: 'Foundation: usually supply before demand. Its own metric.' },
      { label: 'Next (3–6M)', detail: 'Demand engine: first 100k users. Its own metric.' },
      { label: 'Later (6–12M)', detail: 'Defensibility: raise switching costs. Its own metric.' },
    ],
    trap: 'A roadmap with no sequencing logic — say why Now must come before Next.',
    drills: ['swiggy-international-expansion-strategy'],
  },
  {
    key: 'radar',
    name: 'RADAR',
    emoji: '📡',
    categories: ['Product Strategy'],
    oneLiner: 'Respond to a competitor move without panicking: Reality, Analyse, Decide, Act, Results.',
    whenToUse: '"Competitor X just launched / cut prices / copied us — what do you do?"',
    steps: [
      { label: 'Reality check', detail: 'Is this actually a threat? How big, to which segment, over what horizon?' },
      { label: 'Analyse the gap', detail: 'Where are we structurally vulnerable vs strong? Data, distribution, brand, cost.' },
      { label: 'Decide', detail: 'Match / Differentiate / Ignore — pick one and defend it.' },
      { label: 'Act on one bet', detail: 'A focused response, not scattershot.' },
      { label: 'Results', detail: 'The metric that tells you it worked, and when you would revisit.' },
    ],
    trap: 'Matching by reflex. "Ignore" is a legitimate answer if you can show the segment overlap is small.',
    drills: ['competitor-cheaper-spotify-instagram'],
  },
  {
    key: 'stamp',
    name: 'STAMP',
    emoji: '🎟️',
    categories: ['Product Strategy', 'AI'],
    oneLiner: 'Should we enter this market? Strategic fit, TAM & timing, Advantage, Mode, Proof.',
    whenToUse: '"Should Apple build an LLM", new market entry, build-vs-buy-vs-partner.',
    steps: [
      { label: 'Strategic fit', detail: 'Does this align with where the company is going, or is it a distraction?' },
      { label: 'TAM & timing', detail: 'Big enough? Early or late? What changed that makes now the moment?' },
      { label: 'Advantage', detail: 'Right to win: distribution, data, brand, cost. If none, say so.' },
      { label: 'Mode', detail: 'Build, buy, partner or invest — and why that mode for this advantage.' },
      { label: 'Proof', detail: 'Metrics and the milestone at which you would double down or stop.' },
    ],
    trap: 'Answering "yes" because the market is big. Without an advantage, big markets are where money goes to die.',
    drills: ['enter-new-market-apple-ai-llms'],
  },
  {
    key: 'invest-case',
    name: 'Mission → Why invest → Goal → Two-sided metrics',
    emoji: '🏗️',
    categories: ['Product Strategy'],
    oneLiner: 'Justify continued investment in a product line and how you would measure it.',
    whenToUse: '"Should we keep investing in Reels", platform bets, two-sided products.',
    steps: [
      { label: 'Mission fit', detail: 'Anchor to the company mission — one sentence.' },
      { label: 'Why invest', detail: 'Competition, engagement, revenue, creators, synergy — the case in five beats.' },
      { label: 'Goal', detail: 'Pick the product goal for this phase: engagement, supply retention, or monetisation.' },
      { label: 'Two sides', detail: 'Metrics for both sides of the marketplace — viewers and creators, riders and drivers.' },
      { label: 'North Star', detail: 'One North Star with supporting metrics.' },
      { label: 'Guardrails', detail: 'Counter-metrics and an evaluation plan with a decision date.' },
    ],
    trap: 'Measuring only the demand side. Two-sided products die on the supply side first.',
    drills: ['meta-reels-invest-strategy-metrics'],
  },
  // ------------------------------------------------------------ Analytical
  {
    key: 'metric-tree',
    name: 'Goal → Behaviour → Metric tree',
    emoji: '🌳',
    categories: ['Analytical'],
    alsoKnownAs: 'North Star + input metrics, AARRR',
    oneLiner: 'Derive success metrics for a feature from the behaviour it is meant to change.',
    whenToUse: '"How would you measure the success of X", launch metrics, dashboards.',
    steps: [
      { label: 'Goal', detail: 'Why does the feature exist? One sentence, in the business\'s words.' },
      { label: 'Behaviour', detail: 'Map the user path: see → tap → complete → return. The metric lives on this path.' },
      { label: 'North Star', detail: 'One metric on the path that captures the goal. Frequency or completion, not clicks.' },
      { label: 'Supporting', detail: 'Two or three inputs that explain the North Star moving: adoption, time-to-X, share of volume.' },
      { label: 'Counter', detail: 'What could this quietly break? AOV, discovery, quality, cannibalisation.' },
      { label: 'Design', detail: 'Holdout, duration, segments, and the decision rule before you see data.' },
    ],
    trap: 'Reporting shortcut clicks as success. If the number would have happened anyway, it is not a lift — use a holdout.',
    drills: ['q-zomato-buy-again-metrics', 'measure-success-zepto-buy-again-shortcut', 'measure-success-meesho-video-shopping'],
  },
  {
    key: 'north-star',
    name: 'Value → Outcome → North Star',
    emoji: '⭐',
    categories: ['Analytical', 'AI'],
    oneLiner: 'Pick a North Star that measures value delivered, not activity generated.',
    whenToUse: '"Define the North Star for X", especially AI products where output ≠ outcome.',
    steps: [
      { label: 'Core value', detail: 'What transformation does the product deliver — time, risk, revenue?' },
      { label: 'Journey', detail: 'Map to the aha moment: the step where the user feels the value.' },
      { label: 'Candidates', detail: 'List 3: a vanity metric, an efficiency metric, an outcome metric. Say why each fails or wins.' },
      { label: 'Pick', detail: 'Choose the outcome metric that has breadth (many users) and depth (real value).' },
      { label: 'Stress-test', detail: 'Can it be gamed? Does it correlate with retention and revenue?' },
      { label: 'Health metrics', detail: 'For AI: acceptance rate, edit distance, regeneration, accuracy guardrail.' },
    ],
    trap: '"Emails sent" or "actions taken" as the North Star. AI can generate infinite output; measure what the human kept.',
    drills: ['q-ema-north-star', 'nsm-ai-legal-document-reviewer-smbs', 'nsm-ai-sales-email-assistant-gaming', 'nsm-ai-email-assistant-sales-quality'],
  },
  {
    key: 'what-changed',
    name: 'What changed? → Scope → Decompose → Hypothesise → Validate',
    emoji: '🩺',
    categories: ['RCA', 'Analytical', 'AI'],
    alsoKnownAs: '5 Whys, segment-and-isolate',
    oneLiner: 'Diagnose a metric drop without guessing.',
    whenToUse: 'Any "X dropped by Y% — why?" question.',
    steps: [
      { label: 'Clarify the metric', detail: 'Exact definition, time window, and is it real (measurement / logging change)?' },
      { label: 'Scope', detail: 'Internal vs external: did we ship anything? Did the world change (competitor, season, outage)?' },
      { label: 'Decompose', detail: 'Segment by platform, geo, cohort, funnel stage, time-of-day. Find where the drop concentrates.' },
      { label: 'Hypothesise', detail: 'Two or three causes that fit the concentration. Rank by likelihood × ease of checking.' },
      { label: 'Validate', detail: 'Name the data pull or experiment that confirms each. Say what you would see if right.' },
      { label: 'Act', detail: 'The fix, the rollback, and the counter-metric to confirm the fix did not break something else.' },
    ],
    trap: 'Hypothesising before decomposing. "Maybe a competitor" is a guess; "iOS only, from Tuesday" is a lead.',
    drills: ['rca-support-agent-resolution-drop', 'rca-recruiting-candidate-quality-model-update', 'rca-aov-drops-18-percent-wow'],
  },
  // ------------------------------------------------------------ Guesstimate
  {
    key: 'top-down',
    name: 'Top-down: population → funnel → frequency',
    emoji: '🧮',
    categories: ['Guesstimate'],
    oneLiner: 'Size a market by narrowing a population through penetration and frequency.',
    whenToUse: 'How many X per day / month in city Y. Rides, orders, searches, users.',
    steps: [
      { label: 'Clarify', detail: 'Exact definition and unit: what counts, what does not, over what period.' },
      { label: 'Population', detail: 'Start from a number you know (city population, households, internet users).' },
      { label: 'Funnel', detail: 'Narrow with penetration rates: has a smartphone → uses the app → active this month.' },
      { label: 'Frequency', detail: 'Orders per active user per period. Split by segment if behaviour differs a lot.' },
      { label: 'Shape', detail: 'Adjust for time-of-day, weekday vs weekend, seasonality when the question asks for a slice.' },
      { label: 'Sanity check', detail: 'Cross-check with supply (drivers × trips) or a known anchor. Round; say the range.' },
    ],
    trap: 'False precision. "About 1.2M, could be 0.8–1.6" beats "1,237,500".',
    drills: ['guesstimate-ride-hailing-trips-bangalore-monday', 'guesstimate-blinkit-grocery-orders-delhi-sunday', 'guesstimate-uber-rides-mumbai-weekday-morning'],
  },
  {
    key: 'triangulate',
    name: 'Two-method triangulation',
    emoji: '📐',
    categories: ['Guesstimate'],
    oneLiner: 'Estimate the same number two ways and reconcile.',
    whenToUse: 'Counting things in a place (restaurants, ATMs, shops) — anything with both a demand view and a supply / area view.',
    steps: [
      { label: 'Define', detail: 'What counts. Sit-down restaurants and cafés, not hotels or cloud kitchens.' },
      { label: 'Method 1', detail: 'Demand: population ÷ people served per unit.' },
      { label: 'Method 2', detail: 'Supply / area: density zones × units per km².' },
      { label: 'Compare', detail: 'If they differ by more than 2×, one assumption is wrong — find it.' },
      { label: 'Pick', detail: 'Say which method you trust more and why.' },
      { label: 'Anchor', detail: 'Sanity check against a real data point you know.' },
    ],
    trap: 'Averaging two wildly different answers instead of finding the broken assumption.',
    drills: ['guesstimate-restaurants-in-bengaluru'],
  },
];

export const FRAMEWORK_BY_KEY: Record<string, Framework> = Object.fromEntries(FRAMEWORKS.map((f) => [f.key, f]));

/** Frameworks that apply to a category, most-used first. */
export function frameworksFor(category: Category): Framework[] {
  return FRAMEWORKS.filter((f) => f.categories.includes(category)).sort((a, b) => b.drills.length - a.drills.length);
}

/** The framework a question uses, if it is in the library. */
export function frameworkForQuestion(questionId: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.drills.includes(questionId));
}
