// Data & analytics playbooks. Two kinds of entry:
//  - 'method'   — a reusable analysis technique (funnels, cohorts, experiments…)
//  - 'scenario' — a worked example: a real PM situation walked through end to end.
// Every entry ends with what data to actually pull, the terms that travel with
// it, and the trap that catches most teams.

export interface PlaybookStep {
  label: string;
  detail: string;
}

export interface PlaybookTerm {
  term: string;
  def: string;
}

export interface Playbook {
  key: string;
  name: string;
  emoji: string;
  kind: 'method' | 'scenario';
  /** One-liner shown on the card. */
  tagline: string;
  /** Hero card: when to reach for it (method) or the situation (scenario). */
  when: string;
  /** The method / walkthrough, one card per step. */
  steps: PlaybookStep[];
  /** The concrete checklist: what data to actually pull. */
  pull: string[];
  /** Terms that travel with this playbook. */
  terms: PlaybookTerm[];
  /** What a PM should know / ask / say. */
  pmAngle: string[];
  /** The trap that catches most teams, in one line. */
  trap?: string;
}

export const PLAYBOOKS: Playbook[] = [
  {
    key: 'feed-revamp',
    name: 'Worked example: revamp a home feed',
    emoji: '📱',
    kind: 'scenario',
    tagline:
      'An exam-prep app with cinematic videos, PYQs and audio notes wants a new home feed. What do you look at before designing anything?',
    when:
      'You run a GK/GS learning app for government-exam aspirants — AI cinematic videos, previous-year questions, audio notes — across ancient, medieval and modern history, polity, geography, current affairs and Constitution articles. The ask is "revamp the home feed". Before a single mockup, the data has to answer three questions: what do users actually come for, what is the current feed showing them instead, and which behaviour predicts retention and payment. The revamp is whatever closes those three gaps.',
    steps: [
      {
        label: 'Define what the feed is FOR',
        detail:
          "A feed's job here isn't clicks — it's getting an aspirant into a study session fast and building the daily habit. Candidate success metrics: content starts within 30 seconds of open, study sessions per week, D7 retention. If you optimise CTR you will get clickbait thumbnails, not learning.",
      },
      {
        label: 'Audit the current feed, slot by slot',
        detail:
          'For every feed position: impressions, taps, content starts, completions. Plot scroll depth — what % of sessions ever see slot 5? Slot 10? You will find dead slots (always seen, never tapped) and buried gems (great completion, terrible position). That map alone usually pays for the analysis.',
      },
      {
        label: 'Compare the three formats honestly',
        detail:
          'Videos vs PYQs vs audio notes: starts, completion rate, and — the one that matters — next-day return after consuming each. The format users tap most is often not the format that retains. Cinematic video may win taps; a completed PYQ set may be what makes someone come back tomorrow. Also cut by hour: audio at commute time, PYQs close to exam dates.',
      },
      {
        label: 'Subject demand vs feed supply',
        detail:
          'Per subject (polity, modern history, geography, current affairs, articles…): share of consumption and share of search queries vs share of feed inventory. If polity is 30% of searches but 10% of the feed, the feed is misallocated. For current affairs, measure freshness decay — how fast does a CA story stop earning taps?',
      },
      {
        label: 'Segment by exam journey, not demographics',
        detail:
          'A fresh aspirant, a revision-mode user, and someone 30 days from the exam need different feeds. So do free users vs payers — and especially: what did payers consume in the weeks BEFORE paying? One serial feed cannot serve all of these; the data tells you which segments are big enough to deserve their own logic.',
      },
      {
        label: 'Find the retention driver',
        detail:
          'Correlate first-week behaviours with D30 retention: completed one PYQ set? finished one video? hit a 3-day streak? Whichever action best predicts coming back is the feed\'s real job — the revamp should push every new user toward that action, then verify causation with a holdout.',
      },
      {
        label: 'Ship the revamp as an experiment',
        detail:
          'A/B the new feed against the old with a holdout. Primary metric: content starts per session + D7 retention. Guardrails: PYQ attempts, payer conversion, uninstalls. Pre-commit the ship rule, and read week 4, not week 1 — every redesign wins week 1 on novelty.',
      },
    ],
    pull: [
      'Scroll-depth distribution: what % of sessions reach each slot',
      'Slot-wise impressions → taps → starts → completions',
      'Per-format completion rate and next-day return (video / PYQ / audio)',
      'Subject share: consumption vs search queries vs feed inventory',
      'Time-of-day × format consumption matrix',
      'First-week behaviours correlated with D30 retention',
      'What payers consumed in the 2 weeks before paying',
      'Current-affairs freshness decay (taps by content age)',
    ],
    terms: [
      { term: 'Position bias', def: 'Top slots always look good because they are seen most. Judge content by completion and downstream retention, never raw CTR.' },
      { term: 'Scroll depth', def: 'How far down the feed sessions actually go. Everything below the median depth is invisible inventory.' },
      { term: 'Content start', def: 'User began consuming (pressed play / opened the set) — a far stronger signal than a tap.' },
      { term: 'Completion rate', def: 'Share of starts that finish. The honest quality signal for videos and audio.' },
      { term: 'Inventory', def: 'The set of items the feed could show. Misallocated inventory = demand the feed ignores.' },
      { term: 'Novelty effect', def: 'Any redesign spikes engagement for days. Only week-3-plus numbers count.' },
    ],
    pmAngle: [
      '"Revamp the feed" is not a data question until you define what the feed is for — habit, discovery, or monetisation. Say that first, in the room or the interview.',
      'The feed should serve the exam date, not the algorithm. Syllabus stage and days-to-exam are ranking features generic feed ML will never invent on its own.',
      'The most valuable single query is usually payer pre-purchase paths — it tells you what the feed should push free users toward.',
    ],
    trap:
      'Ranking by CTR fills the feed with what is clickable (dramatic videos) and starves what retains (unglamorous PYQ practice). Engagement rises for a quarter; retention and results sink after.',
  },

  {
    key: 'push-journey',
    name: 'Worked example: 100 sign-ups, 8 buyers',
    emoji: '🔔',
    kind: 'scenario',
    tagline:
      'You onboard 100 users and 8 purchase. Where do the other 92 go — and what should the push journey do about each of them?',
    when:
      '100 users finish onboarding; 8 buy. First instinct is "send more notifications" — resist it. 8% signup-to-paid is not obviously bad (consumer edtech often runs 1–5%), and a push journey designed before you know WHERE the 92 drop will just burn opt-ins. The order is: diagnose the funnel, design one message per drop-off state, and measure every message against a holdout.',
    steps: [
      {
        label: 'Draw the real funnel, cohorted',
        detail:
          'Install → sign-up → onboarding complete → first content consumed → aha moment (say, first PYQ set completed) → paywall seen → checkout started → paid. Count each step for ONE weekly cohort, tracked forward. The story of the 92 lives between two specific adjacent steps — find which two.',
      },
      {
        label: 'Time every step',
        detail:
          'How many hours from sign-up to first content? Days to paywall? If 80% of buyers pay within 5 days, that is your journey length — messages after day 7 are talking to a decided audience. Timing data also sets each push\'s conversion window.',
      },
      {
        label: 'Diagnose before messaging',
        detail:
          'If 60 of the 92 never consumed content, you have an activation problem — push can genuinely help. If most saw the paywall and bounced, you have a value or pricing problem — no notification fixes that. Push amplifies value users already glimpsed; it cannot create it.',
      },
      {
        label: 'Design the journey per state, not per calendar',
        detail:
          'Trigger on behaviour: didn\'t finish onboarding → one nudge within 24h. Activated then dormant → day-2 push deep-linking to the subject they consumed. Hit aha but never saw paywall → a value-framing push. Paywall bounce → social proof or a time-boxed offer, used sparingly. Every push deep-links to the exact next action, personalised to their subject.',
      },
      {
        label: 'Measure each message like a product',
        detail:
          'Per message: delivered → opened → deep-link session → target action inside the conversion window. Journey-level: purchase rate vs a 10% no-push holdout — that lift is the only number that justifies the journey. "Opened a push, bought six days later" is not push credit.',
      },
      {
        label: 'Watch the guardrails',
        detail:
          'Opt-out rate per send, uninstalls within 24h of a send, and open-rate decay as frequency rises (fatigue). One tone-deaf blast can cost more lifetime value than the campaign earns. Cap frequency globally, not per campaign — users experience your app\'s total noise.',
      },
      {
        label: 'Iterate where the numbers say',
        detail:
          'Each journey message is its own experiment: copy, send time, deep-link target. Keep what beats holdout, kill what doesn\'t — a journey is a portfolio, and most first drafts have one message doing all the work.',
      },
    ],
    pull: [
      'Cohorted funnel counts, step by step, for one sign-up week',
      'Time-to-step distributions (sign-up → activation → paywall → paid)',
      'Paywall views vs bounces vs checkout starts',
      'Push opt-in rate by OS (iOS must be earned; ask after a value moment)',
      'Per-message delivered / opened / deep-link / target-action rates',
      'Purchase rate of the no-push holdout vs the journey group',
      'Opt-out and uninstall rate within 24h of each send',
      'Subject-level consumption per user, for personalised deep links',
    ],
    terms: [
      { term: 'Trigger-based push', def: 'Fired by a user\'s behaviour (or its absence), not a calendar. Almost always beats scheduled blasts.' },
      { term: 'Conversion window', def: 'How long after a push an action still counts as caused by it. Decide it before sending.' },
      { term: 'Holdout', def: 'Users who get no pushes at all. The only honest baseline for "did the journey work".' },
      { term: 'Notification fatigue', def: 'Open rates decay as frequency rises — you are spending a finite attention budget.' },
      { term: 'Deep link', def: 'The push lands on the exact screen of the promised action, not the home screen.' },
      { term: 'Journey / state machine', def: 'The map of user states and the one message each state gets. If a user fits no state, they get nothing.' },
    ],
    pmAngle: [
      'Benchmark before declaring a crisis: 8/100 may be healthy. The sharper question is whether high-intent users are leaking at one fixable step.',
      'Push is a channel, not a strategy. If activation is broken, fix onboarding first — a great journey on a broken funnel just accelerates churn.',
      'The metric for a push is target-action lift vs holdout. Open rate is a diagnostic, never the goal.',
    ],
    trap:
      'Judging pushes by open rate breeds louder pushes. A quiet message with 5% opens that beats holdout on purchases outranks a 30%-open blast that burns opt-ins.',
  },

  {
    key: 'deep-dive-loop',
    name: 'The deep-dive loop',
    emoji: '🔁',
    kind: 'method',
    tagline: 'One repeatable method for any "go look at the data" problem — decision, trend, segment, funnel, hypothesis, rule.',
    when:
      'Reach for this whenever the mandate is vague — "dig into the data", "why is engagement down", "should we revamp X". The loop turns dashboard-browsing into analysis by forcing one question first: what decision will this analysis change? Data that cannot change a decision is trivia, however pretty the chart.',
    steps: [
      {
        label: 'Start from the decision',
        detail:
          'Write down the decision the analysis feeds: "keep or rebuild the feed", "where retention effort goes next quarter". If you cannot name the decision, you are not analysing — you are browsing.',
      },
      {
        label: 'Map the journey and its instrumentation',
        detail:
          'Sketch the user path (open → browse → consume → return → pay) and mark where events actually exist. Gaps in tracking are findings too — "we cannot answer this" is a legitimate, senior sentence.',
      },
      {
        label: 'Baseline the trend before slicing',
        detail:
          'Look at each key metric over 8–12 weeks. Flat, seasonal, decaying, step-change? A single number without its trend is a Rorschach test — everyone sees what they already believed.',
      },
      {
        label: 'Segment ruthlessly',
        detail:
          'Averages lie. Cut by new vs returning, platform, acquisition source, geography, tenure, power vs casual. The insight is almost always in the difference between segments, not in the blended number.',
      },
      {
        label: 'Funnel it, then cohort it',
        detail:
          'Turn the journey into a funnel: of each 100, where do they drop? Then read retention by weekly cohort so product changes line up with behaviour changes in time.',
      },
      {
        label: 'Write hypotheses, then verify',
        detail:
          'Every "insight" becomes a falsifiable sentence — "users who complete X in session one retain 2×" — and gets checked against a holdout before it touches the roadmap. Correlation is promoted to causation only by experiment.',
      },
      {
        label: 'Pre-commit the decision rule',
        detail:
          'End where you started: "if the metric moves ≥X% with guardrails flat, we ship". Decide the threshold before you peek at results — after peeking, every threshold is negotiable.',
      },
    ],
    pull: [
      'DAU / WAU / MAU trend and stickiness (DAU÷MAU) over 12 weeks',
      'The core funnel, step conversion for one cohort',
      'Retention curves by weekly cohort',
      'Top 4–5 segment cuts of the headline metric',
      'Feature/content adoption rates',
      'The event dictionary — what each logged event really means',
    ],
    terms: [
      { term: 'Stickiness', def: 'DAU÷MAU — of monthly users, the share showing up daily.' },
      { term: 'Cohort', def: 'Users grouped by when they started, tracked forward together.' },
      { term: 'Holdout', def: 'A group deliberately left unchanged, so you can see what would have happened anyway.' },
      { term: 'Segment', def: 'A user slice defined by behaviour or source. If it does not change your action, it is not a segment.' },
      { term: 'Decision rule', def: 'The pre-registered "we ship if…" threshold, written before results exist.' },
    ],
    pmAngle: [
      'In interviews this loop IS the answer structure for any "metric dropped, investigate" question: decision, trend, segment, funnel, hypothesis, rule.',
      'The junior tell is jumping to solutions off one average number. The senior habit is asking "for whom?" before "why?".',
      'Saying "that is not instrumented, here is how I would log it" scores higher than pretending you have the data.',
    ],
    trap:
      'Dashboards reward looking busy. If a week of analysis has not changed anyone\'s decision, the analysis failed — no matter how good the charts were.',
  },

  {
    key: 'funnels-aarrr',
    name: 'Funnels & pirate metrics',
    emoji: '🏴‍☠️',
    kind: 'method',
    tagline: 'AARRR — Acquisition, Activation, Retention, Referral, Revenue. Find which stage leaks before fixing anything.',
    when:
      'Reach for AARRR whenever conversion looks wrong ("lots of sign-ups, few payers") or a growth conversation needs structure. Lay the five stages out, compute the conversion between each adjacent pair, and put your effort on the biggest fixable leak — which is almost never the stage people are staring at.',
    steps: [
      {
        label: 'Acquisition',
        detail:
          'Who arrives, from where, at what cost — and at what quality? A channel that delivers cheap installs which never activate is expensive. Judge sources by downstream retention, not install price.',
      },
      {
        label: 'Activation',
        detail:
          'Do new users reach the aha moment — the first taste of real value — and how fast? You must define the aha concretely (e.g., "completed first practice set"). No definition, no activation metric.',
      },
      {
        label: 'Retention',
        detail:
          'Do they come back? This is the stage that quietly kills most products, and every later stage compounds on it. A retention fix is worth several acquisition fixes.',
      },
      {
        label: 'Referral',
        detail:
          'Do users bring users? Measure invites sent, accepted, and the retention of referred users (usually your best cohort). Referral only works multiplied on top of retention.',
      },
      {
        label: 'Revenue',
        detail:
          'Paywall views → checkout starts → paid, and then LTV, not just first purchase. Revenue problems are frequently activation problems wearing a suit.',
      },
      {
        label: 'Read it as arithmetic',
        detail:
          'Write the conversion between every adjacent step for one cohort. The worst ratio × the easiest fix = your focus. Fixing revenue when activation is broken is pushing people faster into a wall.',
      },
    ],
    pull: [
      'Per-step counts for a single weekly cohort — never mixed dates',
      'Conversion rate between each adjacent pair of steps',
      'Time-to-step (sign-up → activation → purchase)',
      'The same funnel split by acquisition source',
      'This month\'s funnel vs the funnel 4–8 weeks ago',
    ],
    terms: [
      { term: 'Aha moment', def: 'The action where a user first feels the product\'s value. Define it, then engineer everything toward it.' },
      { term: 'Activation rate', def: 'Share of sign-ups reaching the aha moment within a set window.' },
      { term: 'Leaky bucket', def: 'Pouring acquisition into a product that cannot retain. The bucket, not the tap, is the problem.' },
      { term: 'LTV / CAC', def: 'Lifetime value vs acquisition cost. Under ~3× and growth is buying revenue, not earning it.' },
      { term: 'Conversion window', def: 'The time limit within which a step counts. Funnels without windows drift into fiction.' },
    ],
    pmAngle: [
      'Funnels must be cohorted — the same week\'s sign-ups tracked forward. A funnel computed on "this month\'s totals" mixes cohorts and lies.',
      'In an interview, quantify as you go: "of 100 sign-ups, 60 activate, 25 return in week 2, 8 pay — the leak is retention, not pricing."',
      'The last step gets the attention because money is visible; the real leak is usually two or three steps earlier.',
    ],
    trap:
      'Optimising the paywall while activation bleeds means A/B-testing the colour of a door most users never reach.',
  },

  {
    key: 'cohorts-retention',
    name: 'Cohorts & retention curves',
    emoji: '📈',
    kind: 'method',
    tagline: 'Group users by when they joined and watch each group over time — the only honest way to read growth.',
    when:
      'Reach for cohorts whenever a topline chart looks good and you need to know if the product is actually healthier. DAU can climb for months while retention rots underneath, as long as acquisition outruns churn. Cohorts separate "we are growing" from "we are refilling a leaky bucket faster".',
    steps: [
      {
        label: 'Define the return event',
        detail:
          '"Came back" must mean something real — opened the app is weak; consumed content or attempted questions is honest. The stricter your return event, the more truthful the curve.',
      },
      {
        label: 'Build weekly cohorts',
        detail:
          'Group users by sign-up week and track each group\'s activity forward: D1, D7, D30. Each cohort is one row; time-since-joining runs across. This triangle chart is the most information-dense view in product analytics.',
      },
      {
        label: 'Read the curve\'s shape',
        detail:
          'A curve that flattens means a core keeps coming back — a real product lives there. A curve that decays toward zero means a leaky bucket, and no acquisition spend fixes it.',
      },
      {
        label: 'Compare cohorts across changes',
        detail:
          'Did the cohort that joined after the redesign retain better than the one before it? This is how you read product impact without an A/B test — imperfect, but far better than topline DAU.',
      },
      {
        label: 'Hunt the retention drivers',
        detail:
          'What did week-1 retained users do that churned users did not? That difference is your activation candidate — then push it on new users with a holdout to confirm it is causal, not just survivorship.',
      },
    ],
    pull: [
      'D1 / D7 / D30 retention by weekly cohort (the triangle)',
      'Retention curve per acquisition source',
      'Retention of users who did action X in week 1 vs those who did not',
      'Resurrection rate — dormant users who come back, and what brought them',
      'New-cohort retention trend: is each month\'s cohort better or worse than the last?',
    ],
    terms: [
      { term: 'D1 / D7 / D30', def: 'Share of a cohort active 1, 7, 30 days after joining.' },
      { term: 'Flattening curve', def: 'Retention stabilising above zero — the visual signature of product-market fit.' },
      { term: 'Churn', def: 'Users gone past your dormancy threshold. Define the threshold explicitly.' },
      { term: 'Resurrection', def: 'A churned user returning. Cheap wins often hide here.' },
      { term: 'Survivorship bias', def: '"Power users do X" may only mean survivors do X. Only a holdout can tell.' },
    ],
    pmAngle: [
      'Retention is the truest single metric — every growth loop, referral and revenue line compounds on it.',
      'Averaged retention across all users hides the killer pattern: old loyal cohorts propping up a number while every new cohort churns faster than the last.',
      'Benchmarks are category-specific. A daily-study exam app should hold itself to social-app D7s, not e-commerce ones.',
    ],
    trap:
      'Celebrating DAU growth while per-cohort retention declines is celebrating how fast you can pour water into a bucket you have stopped patching.',
  },

  {
    key: 'segmentation-rfm',
    name: 'Segmentation & RFM',
    emoji: '🧩',
    kind: 'method',
    tagline: 'Recency, Frequency, Monetary — split users into behavioural groups before believing any average.',
    when:
      'Reach for segmentation before trusting any blended metric, and before any targeted campaign — push journeys especially. RFM is the classic scheme: how recently was each user active, how often, and how much have they paid? Three scores turn "our users" into five or six groups that each deserve a different move.',
    steps: [
      {
        label: 'Pick behavioural axes first',
        detail:
          'Behaviour (recency, frequency, spend, content mix) beats demographics for predicting action. "25-year-olds in Delhi" is a media-buying segment; "active daily, never seen the paywall" is a product segment.',
      },
      {
        label: 'Score R, F and M',
        detail:
          'Bucket each user 1–5 on recency of last activity, frequency of sessions, and monetary value (or its free-tier proxy: content consumed). Simple quintiles work — precision matters less than consistency.',
      },
      {
        label: 'Name the segments',
        detail:
          'Champions (high everything), loyal-but-cheap, promising newcomers, at-risk (were frequent, going quiet), hibernating. Names matter — a team acts on "at-risk champions", not on "R2F5M4".',
      },
      {
        label: 'One action per segment',
        detail:
          'Champions get the referral ask. At-risk get a win-back with their favourite subject. Newcomers get activation nudges. If two segments get the same action, merge them.',
      },
      {
        label: 'Re-score and watch migration',
        detail:
          'Re-run the scoring weekly or monthly. The real health metric is movement between segments — are newcomers becoming loyal, or are champions sliding to at-risk?',
      },
    ],
    pull: [
      'Days-since-last-active distribution across all users',
      'Session-frequency histogram (reveals your power curve)',
      'Payer vs free behavioural deltas — what payers do that free users do not',
      'Segment sizes and month-over-month migration between them',
      'Feature and subject adoption per segment',
    ],
    terms: [
      { term: 'RFM', def: 'Recency, Frequency, Monetary — the classic behavioural scoring scheme.' },
      { term: 'Power curve', def: 'Usage is never normal — a small head uses the product enormously more than the long tail.' },
      { term: 'At-risk', def: 'Historically engaged users whose recency is slipping — the highest-ROI group to catch early.' },
      { term: 'Migration', def: 'Users moving between segments over time. The trend that predicts next quarter.' },
    ],
    pmAngle: [
      'Whenever anyone says "usage dropped", the first words out of your mouth are "for whom?" — that reflex is what segmentation buys you.',
      'A message per segment beats a blast every time; blasts train users to opt out, and opt-outs are close to irreversible.',
      'Keep it small: five or six segments a team can name from memory beat twenty they have to look up.',
    ],
    trap:
      'If a segment does not map to a different action you would take, it is not a segment — it is a chart.',
  },

  {
    key: 'experiments',
    name: 'Experiments & decision rules',
    emoji: '🧪',
    kind: 'method',
    tagline: 'The only tool that turns "the metric moved" into "we moved the metric".',
    when:
      'Reach for an experiment before shipping any change you will later want credit for. Everything else — trends, cohort comparisons, before/after — is evidence; only a randomised control separates your change from seasonality, marketing pushes and luck. The discipline is 80% deciding things before you see data.',
    steps: [
      {
        label: 'One hypothesis, with direction and size',
        detail:
          '"The reordered feed lifts content starts per session by ≥5%." Direction and magnitude, written down. "Let\'s see what happens" is not a hypothesis, it is a fishing licence.',
      },
      {
        label: 'One primary metric, plus guardrails',
        detail:
          'A single primary metric decides the test. Guardrails (uninstalls, opt-outs, revenue) protect against winning the metric while losing the product. Ten primary metrics means one will "win" by chance.',
      },
      {
        label: 'Size and duration up front',
        detail:
          'Compute the sample you need for the effect you claimed, and run full weekly cycles — weekend users differ from weekday users. Stopping early "because it looks significant" is how noise gets shipped.',
      },
      {
        label: 'Keep a clean holdout',
        detail:
          'The control group experiences nothing new. Without it you count demand that already existed and call it impact — the exact trap of the Zomato buy-again drill.',
      },
      {
        label: 'Pre-register the decision rule',
        detail:
          '"Ship if primary is up ≥3% with guardrails flat" — agreed before results exist. After results exist, every stakeholder discovers a reason the rule should bend.',
      },
      {
        label: 'Treat sliced wins as new hypotheses',
        detail:
          'If the overall result is flat but "25–34 Android" won, that is not a victory — it is the hypothesis for the NEXT test. Slicing until something shines is how teams ship noise with confidence.',
      },
    ],
    pull: [
      'Baseline mean and variance of the primary metric (for sample sizing)',
      'Week-1 vs week-4 effect (novelty check)',
      'Guardrail metrics for both arms',
      'Assignment counts per arm (a lopsided split invalidates everything)',
      'Segment cuts — read only as next-test hypotheses',
    ],
    terms: [
      { term: 'Guardrail metric', def: 'A metric that must not degrade for the test to count as a win.' },
      { term: 'Peeking', def: 'Checking significance repeatedly and stopping when it flatters you. Inflates false positives massively.' },
      { term: 'Statistical power', def: 'The probability you detect a real effect of the size you claimed. Underpowered tests read as "no effect" forever.' },
      { term: 'Novelty effect', def: 'Fresh things get tapped. Effects that survive week 3 are real.' },
      { term: 'A/A test', def: 'Both arms identical — a cheap way to check your experiment plumbing before trusting it.' },
    ],
    pmAngle: [
      'On a small user base, be honest about power: run fewer tests with bigger swings, use painted-door tests for demand, and lean on cohort comparisons where experiments cannot reach.',
      'The PM\'s job in experimentation is not the stats — it is defending the pre-registered rule when the result disappoints someone senior.',
      'A flat result that stops a bad launch is a successful experiment. Say that in the retro.',
    ],
    trap:
      'A test with ten metrics, no pre-registered rule, and an early stop will always find you a reason to ship. That is its danger, not its value.',
  },

  {
    key: 'metric-trees',
    name: 'North Star & metric trees',
    emoji: '🌳',
    kind: 'method',
    tagline: 'One metric that means the mission, decomposed into inputs a team can actually move.',
    when:
      'Reach for a metric tree when setting goals, defining success for a launch (like a feed revamp), or when teams optimise their own corners in conflicting directions. The North Star sits at the top and must proxy value delivered to users — the tree below breaks it into input metrics small enough to assign.',
    steps: [
      {
        label: 'Choose a North Star that means user value',
        detail:
          'Revenue is an output, not a North Star — nobody can directly "move revenue". For an exam-prep product: questions practised (or mastered) per learner per week beats raw minutes-in-app, because time-spent can rise while learning falls.',
      },
      {
        label: 'Decompose into arithmetic',
        detail:
          'North Star = active learners × sessions per learner × practice per session. Each branch splits again until you reach metrics one team can own. If the tree\'s math doesn\'t multiply back up, the tree is decoration.',
      },
      {
        label: 'Assign inputs, not outputs',
        detail:
          'Teams get branches: onboarding owns activation, content owns practice depth, growth owns new learners. Everyone\'s local win provably rolls up to the North Star — that is the tree\'s whole point.',
      },
      {
        label: 'Attach counter-metrics',
        detail:
          'Every input metric gets a metric that catches its abuse: sessions per learner ↑ with completion ↓ means notification spam, not engagement. Build the abuse-detector into the tree itself.',
      },
      {
        label: 'Use HEART for feature-level quality',
        detail:
          'For a single feature or surface, Google\'s HEART frame: Happiness (surveys/ratings), Engagement, Adoption, Retention, Task success. It keeps a feature review from collapsing into just usage numbers.',
      },
    ],
    pull: [
      'Candidate North Star correlated against long-term retention and revenue',
      'Trend for every input branch of the tree',
      'Counter-metric baselines before goal-setting starts',
      'Per-team dashboards mapped one-to-one to branches',
    ],
    terms: [
      { term: 'North Star', def: 'The one metric that best proxies value delivered. Grows the business by growing users\' outcomes.' },
      { term: 'Input vs output', def: 'Outputs (revenue, DAU) are results; inputs (activation rate, practice depth) are levers. Assign levers.' },
      { term: 'Counter-metric', def: 'The paired metric that catches you gaming the primary one.' },
      { term: 'Vanity metric', def: 'A number that only goes up (total downloads, cumulative anything). Impressive, decision-free.' },
      { term: 'HEART', def: 'Happiness, Engagement, Adoption, Retention, Task success — feature-level quality frame.' },
    ],
    pmAngle: [
      'For a learning product, a time-spent North Star means your product wins when the student loses. Choose outcome proxies — questions mastered, syllabus covered — and say why out loud.',
      'The tree is an alignment device first and a dashboard second: its job is making every team\'s local goal provably add up.',
      'In interviews, drawing the tree — North Star, three inputs, one counter-metric — in the first two minutes structures everything after.',
    ],
    trap:
      'A North Star chosen because it is easy to measure, rather than because it means value, will be gamed within two quarters — precisely because it is easy to move.',
  },

  {
    key: 'instrumentation',
    name: 'Events & instrumentation',
    emoji: '🛰️',
    kind: 'method',
    tagline: 'You cannot analyse what you did not log. The tracking plan is the analysis, written in advance.',
    when:
      'Reach for this at PRD time, not launch time. Every playbook above assumes the events exist — funnel steps, content starts, subject properties. Instrumentation is where PMs have the most leverage and exercise it least: the questions you will ask in three months determine the events you must log today.',
    steps: [
      {
        label: 'Name events as verbs',
        detail:
          'video_started, pyq_attempted, audio_completed, paywall_viewed, checkout_started. One naming convention, enforced. A tracking plan with three styles of name is three half-plans.',
      },
      {
        label: 'Put the analysis in the properties',
        detail:
          'Each event carries properties: subject, topic, feed_position, source, days_to_exam. "Which subject drives retention?" is only answerable if subject rides on every content event — screen views alone can never tell you.',
      },
      {
        label: 'Log the funnel before the feature ships',
        detail:
          'Write the funnel steps into the PRD and instrument them in the same PR as the feature. Events added after launch mean your "before" baseline is gone forever.',
      },
      {
        label: 'Resolve identity deliberately',
        detail:
          'Decide how anonymous device activity ties to a signed-in user, across reinstalls and devices. Bad identity resolution silently double-counts users and halves retention.',
      },
      {
        label: 'QA events like code',
        detail:
          'A broken event is a month of blind data and it fails silently. Test events in review, alert on volume anomalies, and audit the dictionary quarterly for dead and duplicate events.',
      },
    ],
    pull: [
      'The event dictionary — and whether anyone can explain each event',
      'Orphan events (logged, never queried) and dead events (queried, no longer fired)',
      '% of sessions with zero content events — the instrumentation-gap smell',
      'Identity-resolution rate: share of activity tied to a known user',
    ],
    terms: [
      { term: 'Event', def: 'One logged user action, named as a verb, timestamped.' },
      { term: 'Property', def: 'Structured context on an event (subject, position, source). Where future questions live.' },
      { term: 'Tracking plan', def: 'The contract listing every event, its properties, and who owns it.' },
      { term: 'Identity resolution', def: 'Tying device-level activity to one human across sign-in, reinstall, and devices.' },
      { term: 'Session', def: 'A bounded burst of activity. Define the timeout; comparisons break without it.' },
    ],
    pmAngle: [
      'When you write the PRD, write the events. The engineering cost is minutes; the analytical cost of skipping it is permanent.',
      'The fastest credibility move on a new team: read the tracking plan end to end and list what cannot be answered.',
      '"We don\'t log that" said early is cheap; discovered during the deep-dive, it costs the whole quarter\'s question.',
    ],
    trap:
      'Every team believes its data is fine until the first serious question. By then the baseline you needed was six months ago.',
  },
];

export const PLAYBOOK_BY_KEY: Record<string, Playbook> = Object.fromEntries(PLAYBOOKS.map((p) => [p.key, p]));
