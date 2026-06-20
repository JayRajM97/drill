import type { Question } from '@/types/question';

/**
 * The 8 hand-authored questions from the v2 build spec. These are the
 * high-fidelity versions; they supersede the matching Notion-seeded records
 * (see SUPERSEDED_LEGACY_IDS in normalizeLegacy.ts).
 */
export const curatedQuestions: Question[] = [
  {
    id: 'q-meesho-first-buyer',
    title:
      'Design a feature for Meesho to help first-time buyers in Tier 3 cities who browse but never complete their first purchase',
    categories: ['Product Design'],
    domain_tags: ['Ecommerce'],
    difficulty: 'Medium',
    question_type: 'Product Design — Activation / Conversion problem',
    clarifying_questions: [
      'Are we focused on the app or also the web experience?',
      'First-time buyers only, or also users who ordered once and dropped?',
      'Tier 3 cities specifically — what defines Tier 3 here (population, pincode data)?',
      'Is COD (cash on delivery) available in the target geos?',
      'Do we have data on where in the funnel they drop — PDP, cart, or payment?',
      'Budget constraint on the feature? Or is this a zero-constraint greenfield brief?',
    ],
    user_segments: [
      "First-time buyer (end user) — price-sensitive, trust-anxious, likely influenced by WhatsApp word-of-mouth",
      "Reseller / referrer — brings in the first-time buyer, cares about their friend's experience",
      'Parents / family member — often the one who introduces app to someone in the household',
      "Meesho's seller — wants more volume, needs trust signals to convert new buyers",
    ],
    framework: {
      name: 'Product Design Framework',
      steps: [
        "Clarify scope — who is the user (Tier 3, first-time buyer, price-sensitive), what platform (app), what 'complete first purchase' means",
        'Understand the problem — why do they browse but not buy? (trust, payment anxiety, peer validation, price doubt)',
        'Define goals and constraints — goal: increase first-purchase completion; no drastic UI overhaul',
        'Ideate solutions — rank by impact vs. effort',
        'Pick 1–2 and go deep — spec it out with flows, edge cases',
        'Define success metrics',
      ],
    },
    key_pointers: [
      "Don't jump to 'add a discount' — go deeper into the psychology of a Tier 3 first-time buyer (trust deficit, not knowing if product will arrive, language barriers)",
      'Best answers address trust signals (COD prominence, delivery promise, social proof from nearby pincodes) AND simplify the final step',
      'Tie the feature back to Meesho’s identity: reseller-driven, WhatsApp-heavy social commerce',
      'Name the ICP split: reseller-referred buyer vs. organic discovery — different fear profiles',
      "Activation angle: 'Your first order, guaranteed' trust widget on PDP — delivery time for their pincode, COD badge, one real buyer review from a nearby city",
    ],
    answer: [
      {
        heading: 'THE BET: Trust-First Checkout Widget',
        type: 'callout',
        content:
          'A pincode-aware trust layer on the product detail page (PDP) for first-time buyers only. Shows: estimated delivery time for their pincode, COD availability badge, one verified buyer review from a city within 100km. Zero new screens. Slots into existing PDP.',
      },
      {
        heading: 'Why they browse but don’t buy — root causes',
        type: 'bullets',
        content: [
          "Trust gap: 'Will it actually arrive?' — especially for users whose first exposure was via WhatsApp, not an ad",
          "Payment anxiety: UPI and card feel risky for a first transaction with a brand they don't know",
          "Social proof gap: Reviews on Meesho skew towards urban pincodes — Tier 3 user doesn't see themselves in the reviewer",
          'Language: Product descriptions often in English; Tier 3 user may not fully understand what they’re buying',
          "Price doubt: 'Is this too cheap to be real?' — paradox of low prices creating distrust",
        ],
      },
      {
        heading: 'Solution options considered',
        type: 'table',
        content: {
          headers: ['Idea', 'Impact', 'Effort', 'Decision'],
          rows: [
            ['Trust widget on PDP (pincode delivery + COD + local review)', 'High', 'Low', 'BUILD — no new screens, highest impact on the drop-off moment'],
            ['WhatsApp-based order tracking from day 1 for first order', 'High', 'Medium', 'Phase 2 — builds post-purchase trust, not pre-purchase'],
            ['First-order discount', 'Medium', 'Low', 'Avoid — cheapens brand, attracts one-time buyers not loyal ones'],
            ['Vernacular PDP (Hindi / regional language toggle)', 'Medium', 'High', 'Phase 2 — high engineering lift, needed but not the primary lever'],
          ],
        },
      },
      {
        heading: 'The core flow',
        type: 'bullets',
        content: [
          'User opens PDP → system detects first-time buyer flag (no prior order) + pincode',
          "Trust widget appears below the price: 'Delivers to [city] in 3–5 days · COD available · 1 buyer from [nearby city] bought this'",
          "CTA changes from 'Buy Now' to 'Order with COD — pay on delivery'",
          "Post-order: WhatsApp confirmation sent immediately — 'Order placed! We'll keep you posted' with tracking link",
          'On delivery: one-tap review prompt in WhatsApp — drives the social proof loop for the next first-time buyer',
        ],
      },
      {
        heading: 'Metrics',
        type: 'bullets',
        content: [
          'Primary: First purchase conversion rate (browse → order placed) within 7 days of install',
          'Supporting: COD selection rate among first-time buyers (signal of trust activation)',
          'Supporting: D30 repeat purchase rate — did the first order build a habit?',
          "Counter-metric: Don't tank average order value or increase return rates by over-incentivising low-trust purchases",
          'Leading signal: Trust widget click-through rate within 48hr of launch',
        ],
      },
      {
        heading: 'What makes this answer strong vs. generic',
        type: 'bullets',
        content: [
          'STRONG: Names the specific fear (delivery uncertainty to their pincode) and designs against it directly',
          'STRONG: Avoids discounts — addresses root cause, not a band-aid',
          'STRONG: Activation plan loops back into social proof (WhatsApp review → feeds next buyer’s trust widget)',
          "GENERIC: 'Show alternatives' or 'add a referral bonus' without understanding the Tier 3 psychology",
          'GENERIC: Designing for urban users and assuming Tier 3 is the same',
        ],
      },
    ],
  },
  {
    id: 'q-zepto-cart-abandonment',
    title:
      'Design a feature for Zepto to reduce cart abandonment caused by out-of-stock items at checkout',
    categories: ['Product Design'],
    domain_tags: ['Ecommerce', 'Mobility'],
    difficulty: 'Medium',
    question_type: 'Product Design — Checkout friction problem',
    clarifying_questions: [
      'Which user segment — repeat buyers with saved carts vs. new users?',
      'Which category has highest OOS rate — grocery essentials, fresh produce, FMCG?',
      'Is the OOS happening at real-time checkout or earlier in the browse session?',
      'Do we have data on what % of abandoned carts had 1 OOS item vs. multiple?',
      'Can we touch the substitution algorithm or only the UX surface?',
      "What's the 10-minute delivery SLA implication — can substitution break it?",
    ],
    user_segments: [
      'Convenience buyer — wants speed, will accept a smart auto-substitute if it’s close enough',
      'Value buyer — price-conscious, wants to pick their own substitute, not trust the algorithm',
      'Planner buyer — doing a weekly shop, OOS one item feels manageable, just remove and proceed',
      'Impulse buyer — the OOS disrupts the mood; often just abandons entirely',
    ],
    framework: {
      name: 'Product Design Framework',
      steps: [
        'Clarify — which user segment? which category? is OOS at browse or at checkout?',
        'Problem depth — why do OOS items cause abandonment vs. substitution?',
        'Solution space — pre-cart signals, real-time alternatives, save-for-later, preference-based substitution',
        'Prioritise — score ideas on user impact × feasibility × business value',
        'Define MVP — pick one solution, sketch the flow, state constraints',
      ],
    },
    key_pointers: [
      "Don't just say 'show alternatives' — anchor it: who decides the alternative (user vs. algorithm), what's the trust mechanism?",
      'Mention the ICP split: convenience buyer wants speed (auto-substitute), value buyer wants control (pick your own)',
      'Zepto-specific: 10-minute promise means substitution must not break SLA — any new picker step can’t add delay',
      'The real problem is trust in the substitute, not lack of alternatives — design for that',
      "Activation angle: opt-in 'Smart Replace' preference during onboarding — users who set it upfront convert 2x better on OOS events",
    ],
    answer: [
      {
        heading: 'THE BET: Smart Replace — a preference layer, not a modal',
        type: 'callout',
        content:
          "An onboarding-time preference that lets users set their substitution style once ('Auto-replace with similar' vs. 'Always ask me'). When OOS hits at checkout, the experience is personalised — no jarring modal, no decision fatigue in the moment.",
      },
      {
        heading: 'Why OOS causes abandonment (not just friction)',
        type: 'bullets',
        content: [
          "Trust collapse: 'If this item is out of stock, what else is wrong with my order?'",
          'Decision fatigue: a forced choice at checkout (pick a sub OR remove item) breaks the purchase momentum',
          "Substitute quality anxiety: 'Will the alternative brand taste the same?' — especially for groceries",
          'For convenience buyers, the 10-min promise is the whole point — any uncertainty feels like the promise is breaking',
        ],
      },
      {
        heading: 'Solution options',
        type: 'table',
        content: {
          headers: ['Idea', 'Impact', 'Effort', 'Decision'],
          rows: [
            ['Smart Replace preference at onboarding', 'High', 'Medium', 'BUILD — removes decision at checkout entirely for pre-committed users'],
            ['Real-time OOS signal on PDP before cart', 'High', 'High', 'Phase 2 — prevents the problem upstream, but infra-heavy'],
            ['One-tap substitute suggestion at checkout', 'Medium', 'Low', "Ship alongside Smart Replace — fallback for users who haven't set preference"],
            ['Save-for-later when OOS', 'Low', 'Low', "Nice-to-have — doesn't solve abandonment, just defers it"],
          ],
        },
      },
      {
        heading: 'The flow',
        type: 'bullets',
        content: [
          "Onboarding step 3 of 4: 'If an item is out of stock, what should we do?' → two options with brief explanation → preference saved",
          "Auto-replace users: OOS at checkout → item silently replaced, toast notification 'We swapped X for Y (same brand, similar size)' → one-tap undo",
          'Ask-me users: OOS at checkout → bottom sheet with top 2 substitutes, ranked by similarity score → pick one or remove → proceed',
          "No preference set (existing users): default to 'Ask me' mode, prompt to set preference post-order",
        ],
      },
      {
        heading: 'Zepto-specific constraint',
        type: 'bullets',
        content: [
          'Substitution must not add picker time — the substitute must already be in the same dark store section',
          'Auto-sub algorithm must be location-aware — the sub item must be in stock at the specific fulfillment centre',
          "If no good sub exists (similarity score below threshold), always fall back to 'remove and proceed' — never make a bad substitute",
        ],
      },
      {
        heading: 'Metrics',
        type: 'bullets',
        content: [
          'Primary: Cart-to-order conversion rate for sessions with 1+ OOS item (before vs. after)',
          'Supporting: Smart Replace opt-in rate at onboarding',
          'Supporting: Substitute acceptance rate (did they keep the auto-sub or undo it?)',
          'Counter-metric: Substitution rejection rate — if high, algorithm is wrong, not the UX',
          'Counter-metric: NPS impact for users who experienced a substitution — did it improve or hurt satisfaction?',
          'Leading signal: Preference set rate within 48hr of onboarding for new cohorts',
        ],
      },
    ],
  },
  {
    id: 'q-ubereats-growth',
    title: "How would you grow UberEats' user base?",
    categories: ['Product Strategy'],
    domain_tags: ['Mobility', 'Ecommerce'],
    difficulty: 'Hard',
    question_type: 'Product Strategy — Growth / user acquisition',
    clarifying_questions: [
      'Which market — India/SEA (vs. Swiggy/Zomato) or US (vs. DoorDash)?',
      'Growth definition: net new users, reactivation of lapsed, or frequency of existing?',
      'Budget constraint — are we talking paid acquisition or organic/product-led?',
      'Time horizon — next 6 months (tactical) or 2 years (strategic)?',
      'Any segments off-limits — e.g. is corporate already handled by a separate team?',
    ],
    user_segments: [
      'Never tried food delivery — price-sensitive, Tier 2/3 cities, price + supply gap',
      'Tried once and dropped — bad first experience, trust + experience gap',
      'Competitor users (Swiggy/Zomato) — habituated elsewhere, habit + switching cost gap',
      'Occasional UberEats users — low frequency, habit formation gap',
    ],
    framework: {
      name: 'Product Strategy Framework',
      steps: [
        'Clarify scope (market, timeframe, constraints)',
        'Segment users — who are the distinct groups?',
        "Diagnose why they're not using / churning / not converting",
        'Identify growth levers (supply, demand, habit, switching)',
        'Pick ONE bet — defend it with logic',
        'Metrics + counter-metrics',
        'Activation plan for the chosen lever',
      ],
    },
    key_pointers: [
      'Segment before solutioning — who are you growing with, specifically?',
      "Diagnose the why before jumping to tactics — a discount doesn't fix a supply gap",
      "UberEats' structural moat vs. Swiggy/Zomato is the rides business — use it",
      'Pick ONE bet and defend it — listing 8 tactics without prioritising is the #1 failure mode',
      "Activation must be specific: Day 1 action, Day 7 return trigger — not just 'send a push notification'",
    ],
    answer: [
      {
        heading: 'Scope: India/SEA, net new acquisition + reactivation, 6-month horizon',
        type: 'bullets',
        content: [
          'Market: India/SEA — high-growth, competitive battleground vs. Swiggy/Zomato',
          'Focus: net new user acquisition + reactivation of lapsed users',
          'No budget/channel constraints — treating as open',
        ],
      },
      {
        heading: 'User segments and their gaps',
        type: 'table',
        content: {
          headers: ['Segment', 'Who', 'Primary Gap'],
          rows: [
            ['Never tried food delivery', 'Price-sensitive, Tier 2/3 cities', 'Price + supply gap'],
            ['Tried once, dropped', 'Bad first experience', 'Trust + experience gap'],
            ['Competitor users (Swiggy/Zomato)', 'Habituated elsewhere', 'Habit + switching cost'],
            ['Occasional UberEats users', 'Low frequency', 'Habit formation gap'],
          ],
        },
      },
      {
        heading: 'THE BET: Uber One cross-product bundling',
        type: 'callout',
        content:
          "Uber One (rides + food combined subscription) is the single highest-ROI lever. UberEats' structural moat vs. Swiggy/Zomato is the ride business. A combined subscription with shared benefits is something competitors literally cannot replicate. This is where to concentrate resources in the next 6 months.",
      },
      {
        heading: 'Why this bet and not the others',
        type: 'bullets',
        content: [
          'Supply expansion (Tier 2): high impact but takes 12–18 months to build restaurant density — not a 6-month play',
          'First-order discounting: Swiggy/Zomato will match immediately, CAC war benefits neither player',
          "Group ordering: reduces friction but doesn't solve the acquisition gap — it's an engagement feature",
          "Uber One: Swiggy CAN'T replicate (no ride business). It's the asymmetric bet.",
        ],
      },
      {
        heading: 'Activation plan for Uber One lever',
        type: 'bullets',
        content: [
          "Discovery: shown on ride confirmation screen + post-ride push notification ('Save on your next meal too')",
          'Day 1 action: complete first food order using Uber One trial — triggered immediately after ride',
          "Day 7 return: weekly 'your Uber One savings' summary nudge + personalised restaurant recommendation",
          'Activation metric: % of Uber ride users who place first food order within 7 days of Uber One upsell',
        ],
      },
      {
        heading: 'Metrics',
        type: 'table',
        content: {
          headers: ['Type', 'Metric'],
          rows: [
            ['Primary', 'New user activations per week (by segment + city)'],
            ['Supporting', 'D7 repeat order rate — are new users forming a habit?'],
            ['Supporting', 'Uber One subscription attach rate among new food users'],
            ['Counter-metric', 'CAC / first-order contribution margin — are we growing profitably?'],
            ['Leading signal', 'First-order completion rate within 48hr of app install'],
            ['Activation metric', '% of new users who place a second order within 7 days'],
          ],
        },
      },
      {
        heading: 'Common mistakes to avoid',
        type: 'bullets',
        content: [
          "Listing 8 tactics without prioritising — shows you can't make decisions under ambiguity",
          'Skipping the diagnosis step and jumping straight to discounts',
          "Saying 'track DAU and revenue' without tying metrics to the chosen lever",
          "Ignoring Swiggy/Zomato and failing to explain what makes UberEats' bet defensible",
        ],
      },
    ],
  },
  {
    id: 'q-uber-monetization',
    title: 'How would you price and package Uber Mobility?',
    categories: ['Product Strategy'],
    domain_tags: ['Mobility'],
    difficulty: 'Hard',
    question_type: 'Product Strategy — Monetization / Pricing',
    clarifying_questions: [
      'Are we designing for riders only, or also the driver side of the marketplace?',
      'Which market — India (vs. Rapido/Ola) or global?',
      'Is the goal to grow revenue, grow users, or both?',
      'Are we touching the surge pricing model or working within it?',
      'Do we have a specific segment in focus — commuters, premium, corporate?',
    ],
    user_segments: [
      'Daily commuter — office-goer, 5 days/week, fixed routes, surge kills the budget',
      'Occasional user — weekend outings, airport trips, purely transactional',
      'Premium user — senior executive, client meetings, wants comfort + reliability',
      'Corporate traveller — expense account, B2B, centralized billing needed',
      'Price-sensitive user — students, Tier 2 cities, auto/metro is the alternative',
    ],
    framework: {
      name: 'VALUE-PRICE FIT Framework',
      steps: [
        'Who is paying? (segment the payer — rider, driver, enterprise, advertiser)',
        'What value are they getting? (certainty, speed, predictability, comfort)',
        'What are they willing to pay? (price sensitivity by segment)',
        'What model fits? (per-use, subscription, weekly pass, enterprise contract)',
        'How do you package? (tiers, bundles, upsell paths)',
        "Metrics to know it's working",
      ],
    },
    key_pointers: [
      'Most candidates only think about the rider — naming the driver side shows you understand marketplace dynamics',
      "Segments riders by BEHAVIOUR and willingness to pay (WTP) before proposing tiers — not just 'basic, standard, premium'",
      'Weekly pass is a better bet than monthly for commuters — lower commitment, faster habit formation, Monday re-engagement moment',
      "Pricing psychology matters: ₹49 for 10 rides — the frame is '₹4.90 per ride, no surge ever' not '₹49/week'",
      "Activation plan needs a specific trigger moment — not just 'we'll push a notification'",
    ],
    answer: [
      {
        heading: 'THE BET: Uber Pass at ₹49/week for daily commuters',
        type: 'callout',
        content:
          '10 rides at a locked-in price (no surge), valid Monday–Sunday, trips under 15km. Weekly (not monthly) because ₹49 is an impulse buy, the weekly reset creates a Monday re-engagement moment, and lower commitment = faster trial = faster habit formation. Once the habit forms, the Uber One upsell is natural.',
      },
      {
        heading: 'Proposed pricing architecture',
        type: 'bullets',
        content: [
          'Tier 1 — Pay-Per-Ride: keep as-is. Surge stays — this is where margin lives. For occasional users and tourists.',
          'Tier 2 — Uber Pass ₹49/week (THE BET): daily commuters, 10 surge-free rides Mon–Sun, trips under 15km',
          'Tier 3 — Uber One ₹149/month: power users, 20+ rides/month — add surge protection on ALL ride types, not just standard',
          'Tier 4 — Uber Business (custom): centralized dashboard, monthly invoice, travel policy controls. Sales-led, not product-led.',
          'Tier 5 — Uber Premier Pass ₹799/month (NEW): guaranteed Premier car in 5 min, no surge ever, dedicated support',
        ],
      },
      {
        heading: "What's broken with the current model",
        type: 'bullets',
        content: [
          'Surge is a trust killer — daily commuters get burned on Monday mornings and rain days; they switch to Metro or autos',
          'Uber One is too broad — ₹149/month feels like a lot to a student, too cheap to meaningfully serve an executive',
          'No frequency reward for light users — someone who takes 8 rides/month gets zero loyalty benefit',
          "Driver income is unpredictable — incentive structure doesn't reward consistency, which feeds back into surge",
        ],
      },
      {
        heading: 'Activation plan for Uber Pass — Monday 8AM trigger',
        type: 'bullets',
        content: [
          'Target: users with 3+ rides in the last 7 days on weekdays (commuter signal)',
          'Trigger moment: Monday morning, 8:00 AM, right as the user opens the app to book their commute',
          "The nudge: 'You took 4 rides last week. Lock in 10 rides for ₹49 this week — no surge, guaranteed price.'",
          "Day 1: post-purchase screen shows 'Your Uber Pass is active. 10 rides locked in. No surge this week.' First ride end-screen shows '₹0 surge saved' — makes value tangible",
          "Day 7 (Sunday evening): 'Your pass expires tonight. You used 7/10 rides and saved ₹X in surge.' One-tap renew.",
          'Upsell: after 4 consecutive weeks on Uber Pass, trigger Uber One upsell',
        ],
      },
      {
        heading: 'The driver side (most candidates miss this)',
        type: 'bullets',
        content: [
          'Pass rides must be attractive to drivers — otherwise supply for Pass users degrades and the product breaks',
          'Solution: Pass rides get a small guaranteed income top-up for drivers (₹5–10 per ride, funded by Uber margin)',
          'Keeps driver satisfaction stable and ensures Pass rides are accepted as fast as regular rides',
          'In an interview: naming this shows you understand the two-sided marketplace — not just the rider',
        ],
      },
      {
        heading: 'Metrics',
        type: 'table',
        content: {
          headers: ['Type', 'Metric', 'Why'],
          rows: [
            ['Primary', 'Subscription attach rate — % of weekly active riders on any paid tier', 'Tells you if packaging is working'],
            ['Supporting', 'Uber Pass weekly renewal rate', 'Is the habit forming? Do they come back Monday?'],
            ['Supporting', 'Rides per user per week — Pass vs. non-Pass users', 'Does Pass actually drive more frequency?'],
            ['Counter', 'Blended take-rate per ride', 'Pass subsidises rides — margins must not collapse'],
            ['Counter', 'Driver acceptance rate on Pass rides', 'Supply-side health check'],
            ['Leading signal', 'Pass activation rate in first 48hr after Monday nudge', 'Early read on trigger moment + copy'],
            ['Activation', '% of targeted commuters who activate Pass within 7 days of nudge', 'Full funnel measure'],
          ],
        },
      },
    ],
    strong_vs_generic: [
      { strong: 'Segments riders by behaviour and WTP before proposing tiers', generic: "Jumps straight to 'freemium, basic, premium'" },
      { strong: 'Names the specific pain (surge on Monday mornings) and prices against it', generic: "Says 'add a subscription tier'" },
      { strong: 'Explains WHY weekly not monthly (psychology, not convenience)', generic: 'Picks a price with no rationale' },
      { strong: 'Addresses the driver side', generic: 'Ignores supply entirely' },
      { strong: 'Activation plan with specific trigger moment + Day 1/Day 7', generic: "Says 'we'll push a notification'" },
      { strong: 'Counter-metrics protect the business model', generic: 'Only tracks upside metrics' },
    ],
  },
  {
    id: 'q-ema-north-star',
    title: 'Define the North Star metric for an AI Employee product like Ema',
    categories: ['Analytical', 'AI'],
    domain_tags: ['AI', 'Enterprise'],
    difficulty: 'Hard',
    question_type: 'Analytical — North Star / Metrics definition',
    clarifying_questions: [
      'Are we picking a single North Star for the company, or per product line (recruiting, support, FinOps)?',
      "Who's the primary stakeholder we're optimising for — the buyer (CXO), the user (function head), or the operator (Ema admin)?",
      'Pre-PMF (find resonance) or post-PMF (drive growth) — different North Stars apply',
      'Is pricing seat-based, task-based, or platform-based? That biases what we measure',
      'Time horizon — North Star for next 12 months, or longer?',
    ],
    user_segments: [
      'CXO / buyer — cares about cost reduction, headcount efficiency, audit trail',
      "Function head (user) — wants Ema to handle their team's repetitive work reliably",
      'Ema admin / operator — configures workflows, monitors accuracy, manages escalations',
      "End user of Ema's output — e.g. a candidate who gets an Ema-drafted interview invite",
    ],
    framework: {
      name: 'North Star Selection Framework',
      steps: [
        'Reject bad North Stars first — explain why common choices fail',
        "Define what 'value delivered' actually means for this product",
        'Propose a North Star that captures volume + quality + durability',
        'Show the decomposition into product levers',
        'Define supporting metrics, counter-metrics, leading signal, activation metric',
      ],
    },
    key_pointers: [
      'DAU is anti-thesis for an AI product — Ema is supposed to reduce human time, not require it',
      "Tasks executed alone doesn't capture value — could be all wrong tasks",
      'The North Star must capture three things at once: work happened, work was correct, work stayed correct',
      'The 7-day correction window is the discipline that makes it honest — forces optimising for durable quality, not throughput',
      'Senior insight: at ShopOS, throughput metrics led to brittle output that brand teams had to fix later',
    ],
    answer: [
      {
        heading: 'Bad North Stars and why they fail',
        type: 'bullets',
        content: [
          'DAU: AI is supposed to reduce human time, not require it. Optimising DAU for AI is anti-thesis.',
          'Total agents created: pure vanity. A customer can spin up 100 agents that do nothing.',
          "Tasks executed: doesn't capture value. Could be all wrong tasks; could be tasks the user didn't need done.",
          'Time saved (alone): hard to attribute. What baseline? Wishful thinking metric.',
          "ARR: trailing indicator. Doesn't tell the product team what to build.",
        ],
      },
      {
        heading: 'THE NORTH STAR: Net Successful Autonomous Completions per customer per week',
        type: 'callout',
        content:
          'Defined as: tasks Ema completed end-to-end that were either auto-approved or required no significant correction within 7 days. Captures volume (work happened), quality (it was correct), and durability (it stayed correct). The 7-day window catches false approvals.',
      },
      {
        heading: 'Why this works',
        type: 'bullets',
        content: [
          'Captures volume: work got done at scale',
          'Captures quality: the output was correct',
          'Captures durability: it stayed correct (the 7-day window catches rubber-stamp approvals)',
          'Per-customer normalises for account size',
          'Per-week is the cadence enterprises actually measure on',
        ],
      },
      {
        heading: 'Decomposition into levers',
        type: 'bullets',
        content: [
          'Net Successful Completions = Total Tasks × Autonomous Rate × Success Rate × (1 − Correction Rate)',
          'Total Tasks: how broadly Ema is deployed → Growth lever',
          'Autonomous Rate: how much without human approval → Trust + Autonomy design lever',
          'Success Rate: did the task achieve its goal? → Model + workflow quality lever',
          'Correction Rate: did it stay correct over 7 days? → Calibration + edge-case handling lever',
        ],
      },
      {
        heading: 'Metrics',
        type: 'table',
        content: {
          headers: ['Type', 'Metric', 'Why'],
          rows: [
            ['North Star', 'Net Successful Autonomous Completions per customer per week', 'Captures volume + quality + durability'],
            ['Supporting', 'Time saved per customer (hours)', 'Proxy for human work displaced'],
            ['Supporting', 'Cost per task vs. equivalent human cost', 'Unit economics'],
            ['Supporting', 'Expansion revenue per customer', 'Are wins in one function pulling in others?'],
            ['Counter', 'Hallucination rate', 'Must not rise as volume rises'],
            ['Counter', 'Customer-reported error rate', 'Separate signal from internal evals'],
            ['Counter', 'False-autonomy rate — % of autonomous actions reversed within 7 days', 'The discipline metric'],
            ['Counter', 'Escalation rate to humans', 'Should trend down — if up, Ema is getting less capable'],
            ['Leading signal', 'First-month autonomous completions of new customers', 'Strongly predicts LTV and retention'],
            ['Activation', '% of new customers completing 50+ successful autonomous tasks in first 30 days', "The 'Ema's working' moment"],
          ],
        },
      },
      {
        heading: 'The senior insight',
        type: 'callout',
        content:
          'North Stars for AI products have to capture three things at once: work happened, work was correct, work stayed correct. Anything that captures only one is gameable. The 7-day correction window is the discipline that makes this honest — it forces the team to optimise for durable quality, not throughput. At ShopOS we learned that throughput metrics led to brittle output that brand teams had to fix later. Net Successful Completions is the metric we wished we’d had from day one.',
      },
    ],
  },
  {
    id: 'q-ema-hitl',
    title: 'Design the human-in-the-loop system for Ema: when should it act autonomously vs. ask?',
    categories: ['Product Design', 'AI'],
    domain_tags: ['AI', 'Enterprise'],
    difficulty: 'Hard',
    question_type: 'Product Design — AI systems / Trust design',
    clarifying_questions: [
      'What categories of actions are we covering — drafts (low-stakes), communications (medium), financial/hiring decisions (high)?',
      'Is this a single global setting or per-workflow / per-action configurable?',
      'Greenfield design or improving existing autonomy logic?',
      'What’s the failure mode we’re solving — too many interruptions, or too many autonomous actions backfiring?',
      'Single user or multi-user enterprise (some need approval chains)?',
    ],
    user_segments: [
      'Power delegator — wants maximum autonomy, trusts the system early, high-value user to retain',
      'Cautious operator — wants full control, will never fully trust without a long track record',
      'First-week user — high anxiety, every autonomous action feels risky',
      'Compliance-constrained user — regulated industry, some actions can NEVER be autonomous regardless of confidence',
    ],
    framework: {
      name: 'Action × Risk × Confidence × Precedent Framework',
      steps: [
        'Define action categories (what is Ema doing?)',
        'Score reversibility + stakes for each action type',
        "Factor in Ema's confidence for the specific instance",
        'Factor in precedent (has the user approved this exact pattern before?)',
        'Design the UX for autonomous actions (notify after) and approval requests (inline, not modal)',
        'Build the progressive trust model — autonomy earns over time',
      ],
    },
    key_pointers: [
      "Human-in-the-loop isn't binary — it's a trust relationship that evolves over the first 30-90 days",
      'Autonomous actions need post-action notifications + a 1-click undo — not a settings menu',
      'Approval requests must appear in the user’s existing workflow (Slack, email) — not a separate alert center',
      'The dangerous case: Ema is wrong but confident. Solve with calibration evals + post-action audit + correction loops',
      "For compliance-constrained industries: hard-coded gates that CAN'T be tuned down, regardless of confidence",
    ],
    answer: [
      {
        heading: 'The decision matrix',
        type: 'table',
        content: {
          headers: ['Action type', 'Reversibility', 'Stakes', 'Confidence', 'Default behaviour'],
          rows: [
            ['Draft email, summary, note', 'Fully reversible', 'Low', 'Any', 'Autonomous, user reviews when ready'],
            ['Schedule interview, send routine reply', 'Reversible with effort', 'Medium', 'High', 'Notify user post-action, allow undo'],
            ['Post in Slack, message a customer', 'Hard to undo', 'Medium', 'High', 'Confirm first time, then autonomous for similar'],
            ['Hire decision, refund, financial entry', 'Irreversible', 'High', 'Any', 'Always require explicit approval'],
          ],
        },
      },
      {
        heading: 'Progressive trust model',
        type: 'bullets',
        content: [
          'New user: more confirmations by default. First 50 actions are explicit approvals.',
          "As precedent builds: Ema asks 'Want me to handle these automatically next time?' after 10 approvals of the same pattern",
          "User-controlled settings: 'Auto-approve drafts under ₹500. Ask for anything above. Always ask before external communications.'",
          "Reset on regression: if Ema makes a mistake on a previously-autonomous action category, autonomy resets to 'ask' for a period",
        ],
      },
      {
        heading: 'UX design — autonomous actions',
        type: 'bullets',
        content: [
          "Notification card after the action: 'I just did X. Modify or undo within 5 minutes.'",
          'Undo button — one click, not buried in settings',
          "Weekly digest: 'Last week I handled 23 things autonomously and asked you 7 times'",
        ],
      },
      {
        heading: 'UX design — approval requests',
        type: 'bullets',
        content: [
          'Appear in the user’s existing workflow (Slack, email, Ema app) — not a separate alert center',
          "Pre-filled with Ema's recommendation. User approves, modifies, or rejects in seconds.",
          "Countdown timer for time-sensitive actions: 'Approve in 30s or I'll wait.'",
          "Bulk approval for repeated similar actions: 'Approve all 12 candidates from this batch?'",
          "Tooltip on 'why ask?' — Ema explains: low confidence, first time, high stakes",
        ],
      },
      {
        heading: 'Edge cases to address',
        type: 'bullets',
        content: [
          'User is offline / unresponsive: queue approval requests; never act unilaterally on high-stakes actions',
          "User keeps modifying Ema's recommendation: Ema proactively asks 'I notice you usually change X to Y. Want me to default to that?'",
          'Ema is wrong but confident (the dangerous case): calibration evals + post-action audit + clear correction loops',
          'Multi-user approval chains: route to the right approver based on amount, type, or org structure',
        ],
      },
      {
        heading: 'Metrics',
        type: 'table',
        content: {
          headers: ['Type', 'Metric', 'Why'],
          rows: [
            ['Primary', '% of actions completed autonomously', 'The more autonomy, the more value Ema delivers'],
            ['Supporting', 'Approval rate when Ema asks', 'High = Ema escalates the right things'],
            ['Supporting', 'Modification rate on autonomous actions', "High = Ema's defaults are miscalibrated"],
            ['Counter', '% of autonomous actions later reversed or corrected', 'The false-autonomy rate'],
            ['Counter', 'Time to approval when Ema asks', "If users can't respond fast, the loop breaks"],
            ['Leading signal', "Calibration error rate — when Ema says 'high confidence,' is she right?", 'Calibration broken = trust broken'],
            ['Activation', "% of new users who progress from 'ask always' to 'ask sometimes' within 30 days", 'Did the trust ladder work?'],
          ],
        },
      },
      {
        heading: 'The senior insight',
        type: 'callout',
        content:
          "Human-in-the-loop isn't a static design — it's a relationship that evolves. The first 30 days are calibration: Ema learning what you trust her with, you learning when she's reliable. The next 90 are about expanding autonomy where it earned trust and protecting the high-stakes edges that should never become routine. Done right, autonomy and trust grow together. Done wrong, autonomy expands and trust collapses overnight.",
      },
    ],
  },
  {
    id: 'q-amazon-reviews-abuse',
    title: 'Design a system to track and reduce review abuse on Amazon',
    categories: ['Product Design', 'Analytical'],
    domain_tags: ['Ecommerce'],
    difficulty: 'Hard',
    question_type: 'Product Design — Trust & Safety system',
    clarifying_questions: [
      'What counts as abuse? Fake, paid, incentivised, or also competitor-malicious reviews?',
      'Which market — global or India-specific?',
      'Have we seen an increase in fake review volume recently?',
      'Are we designing the detection system, the UX response, or both?',
      'Do we have existing ML signals (Verified Purchase, reviewer history) or starting from scratch?',
    ],
    user_segments: [
      'Non-buyer reviewer — has not purchased the product, may be incentivised by seller',
      'Instant reviewer — bought but posted review immediately after delivery, before using product',
      'Paid reviewer — posts volume of positive reviews across many products for compensation',
      'Malicious competitor reviewer — posts negative reviews to damage a competing seller',
    ],
    framework: {
      name: 'Trust & Safety Design Framework',
      steps: [
        'Define abuse types precisely — each type needs a different detection mechanism',
        'Map the incentive structure — why does abuse happen?',
        'Design per-segment solutions — not one-size-fits-all',
        'Propose a fakeness scoring model — not binary ban, but weighted contribution',
        'Define experiment design — how do you know the fix worked?',
        'Metrics',
      ],
    },
    key_pointers: [
      "Don't ban outright — use a fakeness score (0–1) and reduce contribution to rating rather than removing",
      'Verified Purchase signal is key — but not sufficient (bought but not used is a real segment)',
      'AI can detect patterns: reviewer velocity, text similarity, behaviour fingerprints',
      "The solution ties directly to Amazon's mission: 'world's most customer-centric company' — fake reviews are a direct threat to that",
      'Run as experiments — measure fakeness score delta and % of customers finding reviews helpful',
    ],
    answer: [
      {
        heading: 'What review abuse actually is',
        type: 'bullets',
        content: [
          'Posted by non-buyers — Amazon allows this but gives less weight than Verified Purchase',
          'Posted immediately post-delivery before using the product — most relevant for high-engagement categories (books, clothes, jewellery)',
          'Posted by users who receive compensation/reward from the seller — volume pattern + cross-product behaviour',
          'Posted as negative reviews by competitor colluders — high-frequency posting, text pattern similarities',
        ],
      },
      {
        heading: 'Why fake reviews are dangerous',
        type: 'bullets',
        content: [
          'Prevents prospective buyers from getting accurate feedback from real users',
          'Data corruption: Amazon loses value as a marketplace and discovery engine',
          "Direct threat to Amazon's vision: 'world's most customer-centric company'",
          'Revenue impact: if trust in reviews drops, conversion drops across the board',
        ],
      },
      {
        heading: 'Solution per segment',
        type: 'table',
        content: {
          headers: ['Segment', 'Detection signal', 'Response'],
          rows: [
            ['Non-buyer reviewer', 'No Verified Purchase flag + large variance between VP and non-VP ratings', 'If variance > threshold, exclude non-VP reviews or shadow-reduce their weight'],
            ['Instant post-delivery reviewer', 'Review timestamp within 24–48hr of delivery for high-engagement categories', 'Apply AI confidence check; if low confidence (no usage signal), reduce contribution to overall rating'],
            ['Paid/volume reviewer', 'High review frequency across many products + positive skew + no purchase pattern', 'Fakeness score flagging; shadow-ban from overall rating; lower placement in reviews list'],
            ['Malicious competitor reviewer', "High-frequency negative reviews on competing seller's SKUs + similar text patterns", 'Restrict to verified buyer reviews only; AI-flag patterns for human review queue'],
          ],
        },
      },
      {
        heading: 'The fakeness score model',
        type: 'bullets',
        content: [
          'Every review gets a fakeness score (0.0 to 1.0) from an AI model',
          'Score inputs: reviewer velocity, purchase verification, text similarity to other reviews from same account, time-to-review after delivery, reviewer network (do their review targets overlap with paid review networks?)',
          'Reviews above a threshold (e.g. 0.85) are shadow-banned from overall rating calculation — still visible but not counted',
          'Threshold is tunable — can be tightened or loosened by category (jewellery vs. cables need different calibration)',
        ],
      },
      {
        heading: 'Experiment design',
        type: 'bullets',
        content: [
          'Run controlled experiments by category and country',
          'Measure: avg fakeness score of all reviews pre vs. post intervention',
          "Measure: % of customers clicking 'helpful' on reviews pre vs. post",
          'Measure: % of Verified Purchase reviews vs. non-VP reviews in overall rating contribution',
          'Long-term: ARPU — may take 6–12 months to show improvement as trust rebuilds',
        ],
      },
      {
        heading: 'Metrics',
        type: 'bullets',
        content: [
          'Primary: Average fakeness score of reviews visible on platform (lower = better)',
          'Supporting: % of customers finding reviews helpful (survey + click signal)',
          'Supporting: Ratio of Verified Purchase reviews to non-VP in rating calculation',
          "Counter-metric: Don't suppress legitimate reviews — monitor false positive rate (real reviews incorrectly flagged)",
          'Long-term: Conversion rate on products with previously high fake review volume — does trust recover?',
        ],
      },
    ],
  },
  {
    id: 'q-ema-hallucination-rca',
    title: 'Hallucination complaints spiked from one client. Nothing changed in the product. RCA.',
    categories: ['Analytical', 'RCA', 'AI'],
    domain_tags: ['AI', 'Enterprise'],
    difficulty: 'Hard',
    question_type: 'RCA — AI system / External change detection',
    clarifying_questions: [
      "'Nothing changed' is what we believe — confirm: no deploys, no prompt changes, no model updates? Including silent provider-side updates?",
      'Has the volume of complaints risen, or has the hallucination rate per query risen? Different problems.',
      'Is this rise in absolute count or in proportion?',
      'Has the TYPE of hallucination changed — factual, fabricated entities, wrong tool calls, made-up policies?',
      "What's the timing — exact week/day it started? Anchor to a specific event.",
      "Is the client's usage pattern the same — same volume, same query types, same users?",
    ],
    user_segments: [
      'Client reviewer — flagging complaints, may be a new person with different calibration',
      'End users of Ema — asking new types of questions as they mature on the platform',
      'Ema admin — responsible for KB management, may have uploaded conflicting documents',
    ],
    framework: {
      name: "'What Changed in the World' Framework",
      steps: [
        "Confirm 'nothing changed' is actually true (check all layers — code, prompt, model, provider)",
        'If the product didn’t change, something else did — enumerate all external change vectors',
        'Get concrete examples (at least 20 recent complaints with full traces)',
        'Categorise by failure mode to find the modal cause',
        "Check the client's KB ingestion logs, usage logs, provider changelog",
        'Recommend: the most likely pattern + the fix + the systemic prevention',
      ],
    },
    key_pointers: [
      "The key insight: 'Nothing changed in our code' is not the same as 'nothing changed.' Data drifts. Users mature. Models update silently. The world moves.",
      '70–80% of production AI spikes have one dominant root cause — get 20 examples and categorise before hypothesising',
      'Silent model-provider updates are the most common culprit and the hardest to catch — always check provider changelog',
      "KB drift (conflicting documents) is the second most common — retrieval becomes ambiguous, model 'resolves' with confabulation",
      'Detection/labeling change is often overlooked: did the client change who reviews, or what counts as a hallucination?',
    ],
    answer: [
      {
        heading: "The 'what changed in the world' framework",
        type: 'bullets',
        content: [
          '1. DATA on the input side: client uploaded new KB docs that conflict with old ones; old docs now outdated; document format changed, parsing degrades silently',
          '2. USAGE PATTERN: new user cohort onboarded at the client, asking new question types; power users pushing edge cases as adoption matured; query complexity rose',
          '3. UPSTREAM MODEL: silent provider model update (the classic); API rate limiting causing fallback to smaller model; safety filter at provider changed behavior',
          "4. DETECTION / LABELING: client's reviewer changed (new person flagging more aggressively); definition of 'hallucination' widened; new internal audit surfacing old issues",
          "5. ENVIRONMENTAL: client launched a product, news cycle changed, queries now include current events the model wasn't trained on; seasonal workflow changes",
        ],
      },
      {
        heading: 'How I’d diagnose',
        type: 'bullets',
        content: [
          'Get 20 concrete recent hallucination examples from the client',
          'For each: pull the full trace — query, retrieved context, model output, action taken',
          'Categorise by failure mode: factual error, fabricated entity, KB conflict, missing context, model overconfidence, tool failure',
          'Look for the modal cause — often 70%+ of complaints have one root',
          'Check KB ingestion logs: what was added or modified in the last 4–6 weeks?',
          'Check provider status page / changelog for any model behavior changes',
          'Check usage logs: new users, new query types, query complexity distribution',
        ],
      },
      {
        heading: 'Likely patterns and fixes',
        type: 'bullets',
        content: [
          'PATTERN A — KB DRIFT: client added docs conflicting with existing ones. Retrieval surfaces ambiguous context, model resolves by confabulating. Fix: audit KB, deduplicate, version old vs. new, retrain retrieval.',
          "PATTERN B — SILENT MODEL UPDATE: provider changed something subtle. Hallucination rate rises because model's calibration shifted. Fix: lock model version, re-evaluate. Strategic: Ema's multi-model architecture should route away from a degraded model.",
          "PATTERN C — NEW QUERY TYPES: users matured into edge cases the system never trained on. Fix: add adversarial evals covering these, harden prompts, add explicit 'I don't know' handling.",
        ],
      },
      {
        heading: 'Counter-metrics to validate the fix',
        type: 'bullets',
        content: [
          'Hallucination rate per 1000 queries — not just absolute count',
          'Customer-reported hallucinations vs. internally-detected — the gap matters',
          "Calibration: when Ema says 'high confidence,' is it actually right?",
          'Tenant-level health score for this specific client — track separately from aggregate',
        ],
      },
      {
        heading: 'The senior insight',
        type: 'callout',
        content:
          "In production AI, 'nothing changed' is rarely true. It usually means nothing changed in our code. The data shifted, the users matured, the model drifted, the world moved. Resilient AI products are built on the assumption that the environment is unstable — so we instrument continuously, run evals in production, and treat customer complaints as the first signal of an upstream change we haven't detected yet.",
      },
    ],
  },
];
