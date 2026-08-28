// Interview anchor numbers — the figures you should be able to quote from
// memory in a guesstimate or strategy answer. One canonical fact per metric:
// where sources disagree we keep a range, never two copies. Values are
// ballpark (2024) and deliberately rounded — say "let me assume ~" in the room.

export type Region = 'IN' | 'US' | 'World';

export interface Fact {
  /** Stable id (topic.slug) — also what dedupes across topics. */
  id: string;
  label: string;
  value: string;
  /** One-line context, why it matters, or how to use it. */
  note?: string;
  region?: Region;
  /** Composite values (a split, a ranking) shown as inline chips instead of one string. */
  parts?: { label: string; value: string }[];
  /** Memory hook. Falls back to a keyword guess. */
  emoji?: string;
  /** A term to highlight in the label, e.g. "Prime". */
  tag?: string;
  /** Explicit quiz/flashcard question; otherwise derived from the label. */
  q?: string;
  /** Filled in at build time: the group and topic this fact lives in. */
  group?: string;
  topic?: string;
}

export interface NumberGroup {
  title: string;
  facts: Fact[];
}

export interface NumberTopic {
  key: string;
  title: string;
  emoji: string;
  blurb: string;
  groups: NumberGroup[];
}

export const REGION_LABEL: Record<Region, string> = { IN: '🇮🇳 India', US: '🇺🇸 US', World: '🌍 World' };

const f = (id: string, label: string, value: string, note?: string, region?: Region): Fact => ({ id, label, value, note, region });
/** Composite fact: `value` becomes the headline, `parts` render as chips. */
const split = (id: string, label: string, parts: [string, string][], note?: string, region?: Region, emoji?: string): Fact => ({
  id,
  label,
  value: parts.map(([k, v]) => `${k} ${v}`).join(' · '),
  parts: parts.map(([label, value]) => ({ label, value })),
  note,
  region,
  emoji,
});

export const NUMBER_TOPICS: NumberTopic[] = [
  {
    key: 'india',
    title: 'India',
    emoji: '🇮🇳',
    blurb: 'Big volume, low ticket size, Android-first.',
    groups: [
      {
        title: 'People',
        facts: [
          f('in.pop', 'Population', '~1.43B', 'Largest in the world since 2023.', 'IN'),
          f('in.households', 'Households', '~300M', 'Rule of thumb: ~4.5 people per household.', 'IN'),
          f('in.hh-size', 'Household size', '~4.5', 'vs ~2.5 in the US.', 'IN'),
          split('in.urban', 'Urban vs rural', [['Urban', '35%'], ['Rural', '65%']], 'Urban ≈ 500M. Internet users skew urban.', 'IN', '🏙️'),
          f('in.working-age', 'Working-age (15–64)', '~950M', 'Demographic dividend — median age ~28.', 'IN'),
          f('in.labour', 'Labour force', '~500–600M', 'Smaller than working-age: low female participation.', 'IN'),
        ],
      },
      {
        title: 'Digital',
        facts: [
          f('in.internet', 'Internet users', '~850–950M', '~60–70% penetration.', 'IN'),
          f('in.smartphones', 'Smartphone users', '~650–750M', '~45–55% penetration — still a runway.', 'IN'),
          split('in.android', 'Android vs iOS', [['Android', '90–95%'], ['iOS', '5–10%']], 'Android-first; premium ≠ iOS here.', 'IN', '🤖'),
          { ...split('in.upi-monthly', 'UPI transactions', [['Per day', '~400M'], ['Per month', '~10–12B'], ['Per year', '120B+']], undefined, 'IN', '📲'), tag: 'UPI' },
          f('in.upi-value', 'UPI value / month', '~$200B', 'Average ticket ₹700–900 — huge volume, small tickets.', 'IN'),
          f('in.upi-users', 'UPI users', '~400M+', undefined, 'IN'),
        ],
      },
      {
        title: 'Commerce & mobility',
        facts: [
          f('in.ecom', 'E-commerce GMV', '~$70–90B', 'Under 10% of retail — long growth runway.', 'IN'),
          f('in.food-users', 'Food delivery users (Swiggy + Zomato)', '~80–100M', 'Transacting annually.', 'IN'),
          f('in.food-aov', 'Food delivery AOV', '₹300–600', 'Take rate ~18–25%.', 'IN'),
          f('in.vehicles', 'Registered vehicles', '~350M+', '2-wheelers ~70–75%; cars only ~40–50M.', 'IN'),
          f('in.razorpay', 'Razorpay annualised volume', '$100B+', 'Millions of merchants.', 'IN'),
          f('in.flipkart-amazon', 'Flipkart + Amazon share of e-com', '~60%+', 'Quick commerce (Blinkit, Zepto, Instamart) is the fast-growing slice.', 'IN'),
          f('in.quick-commerce', 'Quick commerce GMV', '~$6–8B', 'Growing ~70–100% YoY; 10-minute delivery in top metros.', 'IN'),
          f('in.cities', 'Cities with 1M+ people', '~50', 'Tier 1 ≈ 8 metros; "Tier 2/3" is where growth is.', 'IN'),
          f('in.jio', 'Jio subscribers', '~470M', 'Largest telco; ~$2/month ARPU keeps data cheap.', 'IN'),
          f('in.whatsapp', 'WhatsApp users', '~500M+', 'The default rail for commerce, support and referrals.', 'IN'),
          f('in.credit-cards', 'Credit cards in circulation', '~100M', 'vs 950M+ debit cards — credit penetration is low.', 'IN'),
        ],
      },
    ],
  },
  {
    key: 'us',
    title: 'US',
    emoji: '🇺🇸',
    blurb: 'iOS-heavy, card-heavy, car-heavy.',
    groups: [
      {
        title: 'People',
        facts: [
          f('us.pop', 'Population', '~335M', 'Round to 330M in the room.', 'US'),
          f('us.households', 'Households', '~130M', 'Average size 2.5.', 'US'),
          split('us.urban', 'Urban vs rural', [['Urban', '80%'], ['Rural', '20%']], undefined, 'US', '🏙️'),
          split('us.working-age', 'Working-age (18–64)', [['Working-age', '~200M'], ['Labour force', '~165M']], undefined, 'US', '💼'),
          split('us.age-split', 'Age split', [['Under 18', '22%'], ['18–64', '60%'], ['65+', '18%']], undefined, 'US', '👶'),
          split('us.income', 'Household income', [['<$50K', '40%'], ['$50–100K', '30%'], ['$100–200K', '20%'], ['>$200K', '10%']], undefined, 'US', '💵'),
          split('us.geo', 'Biggest states', [['California', '12%'], ['Texas', '9%'], ['Florida', '7%'], ['New York', '6%']], 'Top 50 metros ≈ 60% of population.', 'US', '🗺️'),
        ],
      },
      {
        title: 'Digital',
        facts: [
          f('us.internet', 'Internet users', '~310M', '~92% penetration.', 'US'),
          f('us.smartphones', 'Smartphone owners', '~290M', '~85% penetration.', 'US'),
          split('us.ios', 'iOS vs Android', [['iOS', '55–60%'], ['Android', '40–45%']], 'Opposite of the rest of the world.', 'US', '🍎'),
          f('us.digital-payers', 'Digital payment users', '~200M', undefined, 'US'),
        ],
      },
      {
        title: 'Money',
        facts: [
          split('us.tx-split', 'How people pay', [['Card', '65%'], ['Cash', '20%'], ['Wallet', '10%'], ['Other', '5%']], undefined, 'US', '💳'),
          f('us.cards', 'Credit cards in circulation', '~1.1B', '~175M cardholders, 3–4 cards each.', 'US'),
          f('us.card-fee', 'Card transaction fee', '2–3%', 'Average card ticket ~$80–120.', 'US'),
          f('us.card-penetration', 'Adults with a credit card', '~80%', undefined, 'US'),
          f('us.ecom', 'E-commerce sales', '~$1.1T', '~15–20% of retail. Mobile ≈ 40% of it.', 'US'),
          f('us.retail', 'Total retail sales', '~$7T', 'E-commerce is the ~15–20% slice of this.', 'US'),
          f('us.card-debt', 'Credit card debt', '~$1.1T', 'Average household balance ~$6–7K.', 'US'),
          f('us.walmart', 'Walmart weekly shoppers', '~240M', 'Global; ~90% of Americans live within 10 miles of a store.', 'US'),
          f('us.costco', 'Costco members', '~130M', 'Renewal rate ~90% — the subscription benchmark.', 'US'),
        ],
      },
    ],
  },
  {
    key: 'world',
    title: 'World',
    emoji: '🌍',
    blurb: 'The denominators for any global sizing.',
    groups: [
      {
        title: 'Macro',
        facts: [
          f('w.pop', 'Population', '~8B', undefined, 'World'),
          f('w.gdp', 'Global GDP', '~$105T', undefined, 'World'),
          f('w.internet', 'Internet users', '~5.3B', undefined, 'World'),
          f('w.smartphones', 'Active smartphones', '~6.8B', 'Users ~5–6B (multi-device).', 'World'),
          split('w.android', 'Android vs iOS', [['Android', '70%'], ['iOS', '28%']], 'Flip it for the US.', 'World', '🤖'),
        ],
      },
      {
        title: 'Markets',
        facts: [
          f('w.ecom', 'Global e-commerce', '~$6T', '~20% of total retail.', 'World'),
          f('w.food', 'Food delivery market', '~$150–200B', 'Urban active user: 2–8 orders / month.', 'World'),
          f('w.payments', 'Digital payments volume', '$8T+ / yr', 'Cash still dominates many emerging markets.', 'World'),
          f('w.saas', 'Global SaaS market', '~$250–300B', 'Growing ~15–20% a year.', 'World'),
          f('w.ads', 'Digital ad spend', '~$700B', 'Google + Meta ≈ half of it.', 'World'),
          f('w.cloud', 'Cloud infrastructure spend', '~$300B / yr', 'AWS ~31% · Azure ~25% · GCP ~11%.', 'World'),
        ],
      },
    ],
  },
  {
    key: 'mobile',
    title: 'Mobile',
    emoji: '📱',
    blurb: 'App-economy baselines.',
    groups: [
      {
        title: 'App behaviour',
        facts: [
          f('m.installed', 'Apps on a phone', '40–50', undefined),
          f('m.daily', 'Apps used daily', '8–10', undefined),
          f('m.abandoned', 'Downloaded then never used', '~25%', undefined),
          f('m.screen-time', 'Daily social media time', '2–2.5 h', 'Across 6–7 platforms used regularly.'),
          f('m.app-store', 'App store consumer spend', '~$150B / yr', 'iOS ≈ 65% of spend despite ~28% device share.', 'World'),
          f('m.downloads', 'App downloads / yr', '~250B', 'Games are ~40% of downloads.', 'World'),
          f('m.d1-retention', 'D1 / D7 / D30 app retention', '25% / 12% / 5%', 'Typical consumer app — beat this and you are good.'),
          f('m.screen', 'Daily phone screen time', '~4–5 h', 'Checked ~100+ times a day.'),
        ],
      },
    ],
  },
  {
    key: 'search-ai',
    title: 'Search & AI',
    emoji: '🔎',
    blurb: 'Google is the baseline; AI is early innings.',
    groups: [
      {
        title: 'Google',
        facts: [
          f('s.daily', 'Google searches / day', '~8.5–9B', '~3–4T per year. ~15% never seen before.', 'World'),
          f('s.per-person', 'Searches per person / day', '~3–4', undefined),
          split('s.share', 'Google search share', [['Global', '~90%'], ['US', '~88%']], undefined, undefined, '🔍'),
        ],
      },
      {
        title: 'ChatGPT & OpenAI',
        facts: [
          f('s.chatgpt-wau', 'ChatGPT weekly actives', '~200M+', 'Late 2024. Daily ~100M+.', 'World'),
          f('s.chatgpt-100m', 'Time to 100M users', '2 months', 'Fastest consumer product ever.'),
          f('s.openai-daily', 'OpenAI prompts / day', '~1B+', 'Order-of-magnitude estimate.'),
          f('s.ai-vs-search', 'Will AI replace search?', 'Coexist', 'Safe answer: informational queries shift first; early innings.'),
          f('s.youtube-search', 'YouTube as a search engine', '#2 globally', 'Billions of searches / day inside YouTube.', 'World'),
          f('s.gemini-copilot', 'AI assistants (Gemini, Copilot, Claude)', '~100M+ each', 'Order of magnitude; ChatGPT still ~2–3× the next.', 'World'),
          f('s.ai-spend', 'Enterprise gen-AI spend', '~$40B+ (2024)', 'Doubling roughly every year.', 'World'),
        ],
      },
    ],
  },
  {
    key: 'food',
    title: 'Food delivery',
    emoji: '🍔',
    blurb: 'Frequency × AOV × take rate.',
    groups: [
      {
        title: 'US market',
        facts: [
          f('fd.us-size', 'Market size', '~$90B', undefined, 'US'),
          f('fd.us-users', 'Food delivery users', '~110M', 'DoorDash active ~30–40M.', 'US'),
          f('fd.us-freq', 'Orders per user / month', '3–4', undefined, 'US'),
          f('fd.us-aov', 'Average order value', '$25–40', undefined, 'US'),
          split('fd.us-share', 'Market share', [['DoorDash', '65%'], ['Uber Eats', '25%'], ['Grubhub', '8%']], undefined, 'US', '🛵'),
          f('fd.commission', 'Restaurant commission', '15–30%', 'Delivery fee $3–8.', 'US'),
        ],
      },
      {
        title: 'Patterns',
        facts: [
          f('fd.peak', 'Peak hours', '6–8 PM', 'Weekends +30% vs weekdays.'),
          f('fd.mobile', 'Mobile share of orders', '~85%', undefined),
          split('fd.india-sizing', 'India sizing shortcut', [['Urban internet users', '250M'], ['× penetration', '30%'], ['× orders / month', '4'], ['≈ orders / month', '300M']], undefined, 'IN', '🧮'),
        ],
      },
    ],
  },
  {
    key: 'rides',
    title: 'Ride-sharing',
    emoji: '🚕',
    blurb: 'Uber as the reference marketplace.',
    groups: [
      {
        title: 'Uber (global)',
        facts: [
          f('r.mau', 'Monthly active users', '~150M', undefined, 'World'),
          f('r.trips', 'Trips / day', '~25–30M', undefined, 'World'),
          f('r.drivers', 'Drivers', '~5–6M', '10,000+ cities.', 'World'),
          split('r.trip', 'Average trip', [['Distance', '6–7 mi'], ['Cost', '$15–20']], undefined, undefined, '🛣️'),
        ],
      },
      {
        title: 'US',
        facts: [
          split('r.us-share', 'Uber vs Lyft', [['Uber', '70%'], ['Lyft', '30%']], undefined, 'US', '🚕'),
          f('r.us-users', 'Ride-share users', '~80M', 'Daily rides ~5M.', 'US'),
          f('r.take-rate', 'Uber take rate', '~25–30%', 'Of gross bookings; drivers keep ~70%.', 'World'),
          f('r.ola', 'Ola + Uber India rides', '~5M+ / day', 'Autos and bikes are the volume, not cars.', 'IN'),
        ],
      },
    ],
  },
  {
    key: 'payments',
    title: 'Payments',
    emoji: '💳',
    blurb: 'Rails, volumes, and who owns the customer.',
    groups: [
      {
        title: 'Processors & wallets',
        facts: [
          f('p.stripe', 'Stripe annual volume', '~$1T', undefined, 'World'),
          f('p.paypal', 'PayPal active accounts', '~430M', undefined, 'World'),
          f('p.venmo', 'Venmo users', '~90M', undefined, 'US'),
          f('p.zelle', 'Zelle transactions / yr', '~2.9B', undefined, 'US'),
          f('p.apple-pay', 'Apple Pay users', '~600M+', '~90% of US iPhones have it set up.', 'World'),
          f('p.visa', 'Visa transactions / yr', '~250B', 'Visa + Mastercard ≈ 80% of card volume.', 'World'),
          f('p.bnpl', 'BNPL share of e-com checkout', '~5–6%', 'Klarna, Affirm, Afterpay.', 'US'),
        ],
      },
    ],
  },
  {
    key: 'ecom',
    title: 'E-commerce',
    emoji: '🛒',
    blurb: 'Funnel benchmarks and Amazon scale.',
    groups: [
      {
        title: 'Amazon',
        facts: [
          { ...split('e.prime-us', 'Prime members', [['US', '~170M'], ['Global', '~230M'], ['US households', '~50%']], undefined, 'US', '📦'), tag: 'Prime' },
          f('e.packages', 'Packages / day', '~1.6M', undefined, 'US'),
          f('e.gmv', 'Amazon GMV', '~$600B / yr', undefined, 'World'),
        ],
      },
      {
        title: 'Funnel benchmarks',
        facts: [
          f('e.cvr', 'Conversion rate', '2–3%', 'Typical e-commerce site.'),
          f('e.cart', 'Cart abandonment', '~70%', undefined),
          f('e.mobile', 'Mobile commerce share', '~40%', undefined, 'US'),
          f('e.return-rate', 'E-commerce return rate', '~20–30%', 'vs ~8–10% in physical retail; apparel is the worst.'),
          f('e.aov', 'Typical e-commerce AOV', '~$80–120', undefined, 'US'),
          f('e.shopify', 'Shopify GMV', '~$300B / yr', 'Millions of merchants; ~10% of US e-com.', 'World'),
        ],
      },
    ],
  },
  {
    key: 'social',
    title: 'Social',
    emoji: '💬',
    blurb: 'Monthly active users.',
    groups: [
      {
        title: 'Global MAU',
        facts: [
          f('so.fb', 'Facebook', '~3B', undefined, 'World'),
          f('so.yt', 'YouTube', '~2.5B', undefined, 'World'),
          f('so.ig', 'Instagram', '~2B', undefined, 'World'),
          f('so.tt', 'TikTok', '~1.7B', undefined, 'World'),
          f('so.li', 'LinkedIn', '~1B', undefined, 'World'),
          f('so.x', 'X / Twitter', '~550M', 'Daily ~250M.', 'World'),
          f('so.whatsapp', 'WhatsApp', '~2.8B', 'Largest messaging app; India its biggest market.', 'World'),
          f('so.reddit', 'Reddit (daily)', '~90M DAU', 'Growing on search traffic.', 'World'),
          f('so.snap', 'Snapchat', '~850M', 'Daily ~430M; skews under 25.', 'World'),
        ],
      },
      {
        title: 'US MAU',
        facts: [
          f('so.us-li', 'LinkedIn', '~200M', undefined, 'US'),
          f('so.us-fb', 'Facebook', '~190M', undefined, 'US'),
          f('so.us-ig', 'Instagram', '~160M', undefined, 'US'),
          f('so.us-tt', 'TikTok', '~150M', undefined, 'US'),
          f('so.us-sc', 'Snapchat', '~100M', undefined, 'US'),
          f('so.us-x', 'X / Twitter', '~95M', undefined, 'US'),
          f('so.us-pin', 'Pinterest', '~90M', undefined, 'US'),
        ],
      },
    ],
  },
  {
    key: 'streaming',
    title: 'Streaming',
    emoji: '🎬',
    blurb: 'Video, music, podcasts.',
    groups: [
      {
        title: 'Video (US)',
        facts: [
          f('st.netflix', 'Netflix subscribers', '~75M', undefined, 'US'),
          f('st.disney', 'Disney+ subscribers', '~50M', undefined, 'US'),
          split('st.subs-per-hh', 'Streaming per household', [['Subscriptions', '3–4'], ['Each / month', '$10–15']], undefined, 'US', '📺'),
          f('st.hours', 'Hours watched / day', '3–4', undefined, 'US'),
        ],
      },
      {
        title: 'Audio (US)',
        facts: [
          f('st.spotify', 'Spotify users', '~100M', undefined, 'US'),
          f('st.apple-music', 'Apple Music users', '~40M', undefined, 'US'),
          f('st.podcasts', 'Podcast listeners', '~180M', undefined, 'US'),
          f('st.netflix-global', 'Netflix subscribers (global)', '~280M', 'ARPU ~$12 / month.', 'World'),
          f('st.youtube-hours', 'YouTube watch time', '~1B+ hours / day', 'Half of it on mobile.', 'World'),
          f('st.spotify-global', 'Spotify MAU (global)', '~650M', '~250M paid.', 'World'),
        ],
      },
    ],
  },
  {
    key: 'transport',
    title: 'Transport',
    emoji: '🚗',
    blurb: 'Vehicles and trips.',
    groups: [
      {
        title: 'US vehicles',
        facts: [
          f('t.vehicles', 'Registered vehicles', '~290M', '~85% of households own a car.', 'US'),
          f('t.daily-cars', 'Cars on the road daily', '~200M', undefined, 'US'),
          f('t.miles', 'Miles driven / year', '13,500', 'Average commute ~15 mi.', 'US'),
          f('t.gas', 'Gas stations', '~150,000', undefined, 'US'),
        ],
      },
      {
        title: 'Trips',
        facts: [
          f('t.trips', 'Vehicle trips / day', '~1.1B', '~9 per household; ~25% for work.', 'US'),
          f('t.per-person', 'Trips per person / day', '2–3', undefined, 'US'),
          split('t.rush', 'Rush hours', [['Morning', '7–9 AM'], ['Evening', '4–7 PM']], undefined, undefined, '🚦'),
          f('t.ev', 'EV share of new car sales', '~8–10%', 'vs ~20%+ globally; China ~40%.', 'US'),
          f('t.tesla', 'Tesla deliveries / yr', '~1.8M', 'BYD sells more EVs by volume.', 'World'),
        ],
      },
    ],
  },
  {
    key: 'health',
    title: 'Health',
    emoji: '🏃',
    blurb: 'Fitness and care (US).',
    groups: [
      {
        title: 'US',
        facts: [
          f('h.gym', 'Gym memberships', '~70M', undefined, 'US'),
          f('h.fitness-apps', 'Fitness app users', '~100M', undefined, 'US'),
          f('h.telemed', 'Telemedicine users', '~80M', undefined, 'US'),
          f('h.insured', 'Health insurance coverage', '~90%', undefined, 'US'),
          f('h.spend', 'Healthcare spend', '~$4.5T / yr', '~17–18% of GDP — highest in the world.', 'US'),
          f('h.wearables', 'Smartwatch / wearable owners', '~35%', 'Of US adults; Apple Watch ≈ half.', 'US'),
        ],
      },
    ],
  },
  {
    key: 'work',
    title: 'Work & SaaS',
    emoji: '💼',
    blurb: 'B2B scale and benchmarks.',
    groups: [
      {
        title: 'Platforms',
        facts: [
          f('wk.m365', 'Microsoft 365 users', '~400M paid seats', 'Teams ~320M MAU.', 'World'),
          f('wk.gworkspace', 'Google Workspace', '~3B users · ~10M paying orgs', 'Consumer Gmail inflates the top line.', 'World'),
          f('wk.slack', 'Slack DAU', '~40M+', 'Salesforce paid $27.7B in 2021.', 'World'),
          f('wk.zoom', 'Zoom meeting minutes', '~3T+ / yr', undefined, 'World'),
          f('wk.salesforce', 'Salesforce revenue', '~$35B / yr', 'Largest pure SaaS company.', 'World'),
          f('wk.linkedin-jobs', 'LinkedIn hires', '~6–8 / minute', 'Job posts ~20M open at any time.', 'World'),
        ],
      },
      {
        title: 'SaaS benchmarks',
        facts: [
          f('wk.nrr', 'Good net revenue retention', '110–120%', '>130% is best-in-class enterprise.'),
          f('wk.churn-b2b', 'B2B logo churn', '5–7% / yr (enterprise) · 3–5% / mo (SMB)', undefined),
          f('wk.rule-40', 'Rule of 40', 'Growth % + margin % ≥ 40', 'The quick health check for a SaaS business.'),
          f('wk.ltv-cac', 'LTV : CAC target', '≥ 3 : 1', 'Payback < 12–18 months.'),
          f('wk.freemium', 'Freemium → paid conversion', '2–5%', 'Product-led; higher with a sales assist.'),
        ],
      },
    ],
  },
  {
    key: 'travel',
    title: 'Travel',
    emoji: '✈️',
    blurb: 'Flights, stays and OTAs.',
    groups: [
      {
        title: 'Scale',
        facts: [
          f('tr.passengers', 'Airline passengers / yr', '~4.5–5B', 'Flights ~100k / day.', 'World'),
          f('tr.airbnb', 'Airbnb nights booked / yr', '~450M', '~8M active listings; take rate ~14%.', 'World'),
          f('tr.booking', 'Booking.com room nights / yr', '~1B', 'Largest OTA by volume.', 'World'),
          f('tr.hotels', 'Hotel rooms', '~17M', 'Marriott + Hilton ≈ 3M.', 'World'),
          f('tr.us-trips', 'Domestic leisure trips / yr', '~2B', undefined, 'US'),
          f('tr.in-air', 'Domestic air passengers / yr', '~150M', 'IndiGo ~60% share.', 'IN'),
        ],
      },
    ],
  },
  {
    key: 'gaming',
    title: 'Gaming',
    emoji: '🎮',
    blurb: 'Bigger than film and music combined.',
    groups: [
      {
        title: 'Scale',
        facts: [
          f('g.market', 'Games market', '~$185B / yr', 'Mobile ≈ half of it.', 'World'),
          f('g.players', 'Gamers', '~3.3B', 'Roughly 40% of the world.', 'World'),
          f('g.roblox', 'Roblox DAU', '~80M', 'Majority under 16.', 'World'),
          f('g.steam', 'Steam concurrent peak', '~35M+', undefined, 'World'),
          f('g.in-gamers', 'Gamers', '~500M+', 'Mostly mobile; real-money gaming is a big, regulated slice.', 'IN'),
          f('g.monetisation', 'Free-to-play payers', '~2–5%', 'Whales (top 1%) drive most revenue.'),
        ],
      },
    ],
  },
  {
    key: 'quick-commerce',
    title: 'Quick commerce',
    emoji: '⚡',
    blurb: '10-minute delivery: dark stores, dense cities, thin margins.',
    groups: [
      {
        title: 'India',
        facts: [
          f('qc.in-gmv', 'Quick commerce GMV', '~$6–8B', '~70–100% YoY growth; already ~a third of e-grocery.', 'IN'),
          split('qc.in-share', 'Market share', [['Blinkit', '~40–45%'], ['Instamart', '~25–30%'], ['Zepto', '~25–30%']], 'Order of magnitude — shifts quarter to quarter.', 'IN', '🏪'),
          f('qc.in-aov', 'Average order value', '₹550–650', 'Blinkit ~₹650; Zepto a bit lower.', 'IN'),
          f('qc.in-orders', 'Orders per day (all players)', '~4–5M', 'Concentrated in the top 10 cities.', 'IN'),
          f('qc.in-dark-stores', 'Dark stores', '~2,000+', 'Each serves a ~2 km radius; ~1,000–1,500 SKUs.', 'IN'),
          f('qc.in-take-rate', 'Take rate / contribution', '~15–20% · ~3–5% margin', 'Ad revenue is the profit lever.', 'IN'),
          f('qc.in-frequency', 'Orders per user / month', '~4–6', 'Habitual users hit 10+.', 'IN'),
        ],
      },
      {
        title: 'US & Europe',
        facts: [
          f('qc.us-dashmart', 'DoorDash grocery / convenience', '~25% of orders', 'DashMart dark stores in ~50 metros; Instacart ~$30B GMV.', 'US'),
          f('qc.us-instacart', 'Instacart GMV', '~$33B', '~$110 AOV; ~14M monthly active orderers.', 'US'),
          f('qc.eu', 'Europe quick-commerce', 'Getir / Gorillas mostly gone', '2021 peak ~$10B raised; consolidated into Getir, then Getir exited. Density + AOV did not work.', 'World'),
          f('qc.delivery-cost', 'Cost per delivery', '~$3–5 (US) · ₹40–60 (India)', 'Rider cost is the floor; batching is the game.'),
        ],
      },
    ],
  },
  {
    key: 'social-usage',
    title: 'Social usage',
    emoji: '⏱️',
    blurb: 'Who uses what, and for how long.',
    groups: [
      {
        title: 'Time per day (global avg)',
        facts: [
          split('su.time', 'Minutes per day by app', [['TikTok', '~95'], ['YouTube', '~75'], ['Instagram', '~60'], ['Facebook', '~50'], ['X', '~30']], 'Android users, monthly average.', 'World', '⏱️'),
          f('su.total', 'Total social time / day', '~2.4 h', 'Peaks ~3.5 h in the Philippines / Brazil; ~2 h US.', 'World'),
          f('su.platforms', 'Platforms used per person', '~6–7 / month', undefined, 'World'),
          f('su.checks', 'Phone checks per day', '~100–150', 'Notifications drive ~half of sessions.'),
        ],
      },
      {
        title: 'Age breakdown',
        facts: [
          split('su.tiktok-age', 'TikTok users by age', [['18–24', '~35%'], ['25–34', '~30%'], ['35+', '~35%']], 'Skews youngest of the big apps.', 'World', '🎵'),
          split('su.fb-age', 'Facebook users by age', [['18–34', '~40%'], ['35–54', '~35%'], ['55+', '~25%']], 'Oldest skew; teens mostly absent.', 'World', '👥'),
          split('su.ig-age', 'Instagram users by age', [['18–34', '~60%'], ['35–54', '~30%'], ['55+', '~10%']], undefined, 'World', '📸'),
          split('su.li-age', 'LinkedIn users by age', [['25–34', '~50%'], ['18–24', '~20%'], ['35+', '~30%']], undefined, 'World', '💼'),
          f('su.teens', 'US teens who use YouTube / TikTok / Instagram', '~90% · ~60% · ~60%', 'Snapchat ~55%; Facebook ~30%.', 'US'),
        ],
      },
      {
        title: 'India',
        facts: [
          f('su.in-time', 'Social time / day', '~2.5–3 h', 'Reels + Shorts dominate after the TikTok ban (2020).', 'IN'),
          f('su.in-ig', 'Instagram users', '~360M+', 'India is Instagram’s largest market.', 'IN'),
          f('su.in-yt', 'YouTube users', '~460M+', 'Largest YouTube market; ~60% of watch time on mobile data.', 'IN'),
          f('su.in-sharechat', 'ShareChat + Moj users', '~300M+', 'Vernacular short video.', 'IN'),
        ],
      },
    ],
  },
  {
    key: 'creator',
    title: 'Creator economy',
    emoji: '🎥',
    blurb: 'Who gets paid, and how much.',
    groups: [
      {
        title: 'Scale',
        facts: [
          f('cr.market', 'Creator economy size', '~$250B', 'Projected ~$500B by 2027.', 'World'),
          f('cr.creators', 'People who call themselves creators', '~200M+', 'Only ~4% earn >$100k / yr.', 'World'),
          f('cr.yt-payout', 'YouTube paid to creators (3 yrs)', '~$70B', 'Ad revenue share 55% to creators.', 'World'),
          f('cr.yt-share', 'YouTube ad revenue split', '55% creator / 45% YouTube', 'Shorts: 45% to creators, pooled.', 'World'),
          f('cr.patreon', 'Patreon creators earning', '~250k', '~8M paying patrons.', 'World'),
          f('cr.substack', 'Substack paid subscriptions', '~3–4M', 'Take rate 10%.', 'World'),
          f('cr.in-influencer', 'India influencer marketing', '~₹3,000 Cr (~$350M)', 'Growing ~25% / yr; ~1M+ monetising creators.', 'IN'),
        ],
      },
    ],
  },
  {
    key: 'fintech-in',
    title: 'Fintech India',
    emoji: '🏦',
    blurb: 'The rails behind UPI.',
    groups: [
      {
        title: 'Apps & rails',
        facts: [
          split('fi.upi-share', 'UPI app share', [['PhonePe', '~48%'], ['Google Pay', '~37%'], ['Paytm', '~7%']], 'By transaction volume.', 'IN', '📲'),
          f('fi.upi-merchants', 'UPI-accepting merchants', '~300M+ QR codes', 'Kirana stores are the long tail.', 'IN'),
          f('fi.upi-ticket', 'UPI average ticket', '₹1,400 (P2P) · ₹600 (P2M)', 'Merchant payments are now >60% of volume.', 'IN'),
          f('fi.bank-accounts', 'Bank accounts (Jan Dhan)', '~530M', 'Financial inclusion base for everything else.', 'IN'),
          f('fi.cards', 'Debit vs credit cards', '~950M vs ~100M', 'Credit penetration ~5–6% of adults.', 'IN'),
          f('fi.mf', 'Mutual fund SIP accounts', '~90M', 'Monthly SIP inflow ~₹20,000 Cr.', 'IN'),
          f('fi.demat', 'Demat accounts', '~170M+', 'Was ~40M in 2020 — Zerodha / Groww effect.', 'IN'),
          f('fi.digital-lending', 'Digital lending disbursals', '~$50B+ / yr', 'BNPL / small-ticket dominates by count.', 'IN'),
        ],
      },
    ],
  },
  {
    key: 'anchors',
    title: 'Anchors',
    emoji: '🧮',
    blurb: 'Multipliers and benchmarks to reason with.',
    groups: [
      {
        title: 'Multipliers',
        facts: [
          f('a.women', 'Share who are women', '~50%', undefined),
          f('a.kids', 'Share under 18', '~20–22%', undefined, 'US'),
          split('a.penetration', 'Penetration to know', [['Smartphone', '85%'], ['Internet', '90%'], ['Prime (households)', '50%'], ['Credit card (adults)', '80%']], undefined, 'US', '📶'),
          split('a.frequency', 'Frequency baselines', [['Searches / day', '3–4'], ['Social / day', '2–2.5 h'], ['Food orders / month', '3–4'], ['Shopping trips / week', '1–2']], undefined, undefined, '📅'),
        ],
      },
      {
        title: 'Marketplace defaults',
        facts: [
          f('a.take-rate', 'Marketplace take rate', '10–30%', undefined),
          f('a.churn', 'Consumer subscription churn', '3–10% / month', undefined),
          f('a.d30', 'D30 retention (solid)', '30–40%', undefined),
          f('a.cac', 'CAC payback target', '< 12 months', undefined),
          f('a.gm', 'Healthy digital gross margin', '60–80%', undefined),
        ],
      },
      {
        title: 'Back-of-envelope',
        facts: [
          f('a.arr', '1M users × $10/mo', '$120M ARR', undefined),
          f('a.conv', '10M users × 1%', '100k customers', undefined),
          f('a.arpu', '100k × $1,000 ARPU', '$100M revenue', undefined),
          split('a.how', 'In the room', [['1', 'Say "let me assume…"'], ['2', 'Use ranges, not fake precision'], ['3', 'Sanity-check at the end'], ['4', 'Tie it to the decision']], undefined, undefined, '🎯'),
        ],
      },
    ],
  },
];

const EMOJI_RULES: [RegExp, string][] = [
  [/population|people/i, '👥'], [/household/i, '🏠'], [/internet/i, '🌐'], [/smartphone|phone|app/i, '📱'],
  [/working|labour/i, '💼'], [/upi|payment|transaction|card|stripe|paypal|venmo|zelle|razorpay/i, '💳'],
  [/e-commerce|gmv|amazon|package|prime|cart|conversion/i, '🛒'], [/food|order|aov|commission|delivery/i, '🍔'],
  [/vehicle|car|miles|gas|trip|commute/i, '🚗'], [/uber|lyft|ride|driver/i, '🚕'], [/search|google/i, '🔍'],
  [/chatgpt|openai|ai\b/i, '🤖'], [/facebook|instagram|tiktok|linkedin|snapchat|pinterest|twitter|youtube|social/i, '💬'],
  [/netflix|disney|hours watched|streaming/i, '🎬'], [/spotify|apple music|podcast/i, '🎧'], [/gym|fitness|telemed|health/i, '🏃'],
  [/gdp|market|volume|arr|revenue|customers/i, '💰'], [/take rate|churn|retention|cac|margin/i, '📈'], [/women/i, '👩'], [/kids|under 18/i, '👶'],
];
export function emojiFor(fact: Fact, fallback: string): string {
  if (fact.emoji) return fact.emoji;
  const hit = EMOJI_RULES.find(([re]) => re.test(fact.label));
  return hit ? hit[1] : fallback;
}

const Q_OVERRIDES: Record<string, string> = {
  'e.aov': "What's a typical e-commerce order value?",
  'tr.hotels': 'How many hotel rooms are there worldwide?',
  'wk.linkedin-jobs': 'How many people get hired through LinkedIn every minute?',
  'a.how': 'What are the four moves for using numbers in the room?',
  's.ai-vs-search': 'Will AI replace search?',
  'a.arr': '1M users paying $10 a month — what is the ARR?',
  'a.conv': '10M users at 1% conversion — how many customers?',
  'a.arpu': '100k customers at $1,000 ARPU — what revenue?',
  'wk.rule-40': 'What is the Rule of 40?',
  'wk.ltv-cac': 'What LTV : CAC ratio should a SaaS business target?',
  'us.geo': 'Which US states hold the most people, and what share?',
  'fd.india-sizing': 'How would you size India food-delivery orders per month?',
  'a.penetration': 'What are the US penetration rates to know (phone, internet, Prime, cards)?',
  'a.frequency': 'What are the frequency baselines (search, social, food, shopping)?',
  't.rush': 'When are the rush hours?',
  'fd.peak': 'When is food-delivery demand highest?',
  's.chatgpt-100m': 'How long did ChatGPT take to reach 100M users?',
  'm.d1-retention': 'What are typical D1 / D7 / D30 retention rates for a consumer app?',
  'm.abandoned': 'What share of downloaded apps are never used?',
  'cr.in-influencer': "How big is India's influencer-marketing market?",
  'qc.eu': 'What happened to quick commerce in Europe?',
  'qc.in-take-rate': 'What is the quick-commerce take rate and margin in India?',
  'us.walmart': 'How many people shop at Walmart every week?',
  'in.hh-size': 'What is the average household size in India?',
  'us.card-debt': 'How much credit card debt do Americans carry?',
  'su.teens': 'What share of US teens use YouTube, TikTok and Instagram?',
  'fi.cards': 'How many debit vs credit cards are there in India?',
  'fi.upi-ticket': 'What is the average UPI ticket size?',
  'qc.delivery-cost': 'What does one quick-commerce delivery cost?',
  'in.food-aov': 'What is the average food-delivery order value in India?',
  'fd.us-aov': 'What is the average food-delivery order value in the US?',
  'qc.in-aov': 'What is the average quick-commerce order value in India?',
};

const BRANDS = new Set(['Google', 'Venmo', 'Flipkart', 'YouTube', 'Netflix', 'Uber', 'Stripe', 'PayPal', 'Zelle', 'Apple', 'Visa', 'Shopify', 'Amazon', 'DoorDash', 'Instacart', 'Blinkit', 'Spotify', 'Disney+', 'Roblox', 'Steam', 'Tesla', 'Microsoft', 'Slack', 'Zoom', 'Salesforce', 'LinkedIn', 'Airbnb', 'Booking.com', 'IndiGo', 'Jio', 'WhatsApp', 'Razorpay', 'Patreon', 'Substack', 'ChatGPT', 'OpenAI', 'Reddit', 'Snapchat', 'Facebook', 'Instagram', 'TikTok', 'X', 'Twitter', 'Costco', 'Walmart', 'Getir', 'Europe', 'India', 'Android', 'iOS', 'ShareChat', 'Gemini', 'Claude', 'DashMart', 'Swiggy', 'Zomato', 'Ola', 'Prime', 'Lyft', 'Grubhub', 'Klarna', 'Pinterest']);

const REGION_PREFIX: Record<Region, string> = { IN: 'In India,', US: 'In the US,', World: 'Worldwide,' };

/** Frame a fact as a question: "In the US, how many households are there?" */
export function questionFor(fact: Fact): string {
  if (fact.q) return fact.q;
  if (Q_OVERRIDES[fact.id]) return Q_OVERRIDES[fact.id];
  const label = fact.label.replace(/\s*\([^)]*\)\s*$/, '').trim();
  // Keep brand names and acronyms capitalised; only a generic first word drops its capital.
  const first = label.split(' ')[0];
  const keepCase = /^[A-Z][A-Z0-9]/.test(first) || BRANDS.has(first.replace(/[^A-Za-z0-9.+]/g, ''));
  const lower = keepCase ? label : label.charAt(0).toLowerCase() + label.slice(1);
  let core: string;
  const per = /\s*\/\s*(day|week|month|year|yr|minute)\b/i.exec(label);
  const COUNT = /\b(users?|people|members?|subscribers?|owners?|listeners?|accounts?|cards?|vehicles?|stations?|drivers?|trips?|orders?|searches|hires?|rooms?|cities|stores?|merchants?|creators?|players?|gamers?|passengers?|nights?|packages?|seats?|downloads?|apps?|households?|shoppers?|prompts?|transactions?|codes?|profiles?|listings?|flights?|minutes|smartphones?|patrons?|subscriptions?|dark stores|deliveries|checks|platforms)\b/i;
  const RATE = /\b(share|rate|fee|penetration|coverage|margin|churn|retention|split|ratio|payback|conversion|nrr|take rate)\b|%/i;
  const SIZE = /\b(size|gdp|market|gmv|revenue|spend|volume|value|debt|sales|arr|budget|economy|payout|disbursals|inflow)\b/i;
  const bare = lower.replace(/ride-share|ride share/i, '');
  const isBrandOnly = !/\s/.test(label) || (label.split(' ').every((w) => BRANDS.has(w) || /^[A-Z]/.test(w)) && label.split(' ').length <= 3 && !COUNT.test(label) && !RATE.test(label) && !SIZE.test(label));
  if (/\bvs\b|\bby age\b/i.test(label)) core = `what is the ${lower} split?`;
  else if (/\b(size|debt)$/i.test(label)) core = `what is the ${lower}?`;
  else if (per) {
    const raw = label.slice(0, per.index).trim();
    const base = keepCase ? raw : raw.charAt(0).toLowerCase() + raw.slice(1);
    const period = per[1].toLowerCase() === 'yr' ? 'year' : per[1].toLowerCase();
    core = /^(average|avg|median|time|hours|minutes)/i.test(base) || (!COUNT.test(base) && SIZE.test(base))
      ? `what is the ${base} per ${period}?`
      : `how many ${base} per ${period}?`;
  } else if (isBrandOnly && fact.group && /mau|users/i.test(fact.group)) core = `how many monthly active users does ${label} have?`;
  else if (/^(will|when|which|how|what)\b/i.test(lower)) core = lower.endsWith('?') ? lower : `${lower}?`;
  else if (/^(population|labour force|working-age)/i.test(lower)) core = `what is the ${lower}?`;
  else if (/^(average|avg|median|typical|time to|time from|hours|daily|total|peak)\b/i.test(lower) || /\b(aov|arpu|ticket)\b/i.test(lower)) core = `what is the ${lower}?`;
  else if (RATE.test(bare)) core = `what is the ${lower}?`;
  else if (COUNT.test(lower)) core = `how many ${lower} are there?`;
  else if (SIZE.test(lower)) core = `how big is ${/^(the|global|total)\b/i.test(lower) ? '' : 'the '}${lower}?`;
  else core = `what is the number for ${lower}?`;
  const prefix = fact.region ? REGION_PREFIX[fact.region] + ' ' : '';
  const out = prefix + core;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** Flat list; ids are unique by construction — assert it in dev. */
export const ALL_FACTS: Fact[] = NUMBER_TOPICS.flatMap((t) =>
  t.groups.flatMap((g) =>
    g.facts.map((f) => {
      f.group = g.title;
      f.topic = t.title;
      return f;
    }),
  ),
);

/** Group titles that are just a region/bucket — not worth showing as context. */
const GENERIC_GROUP = /^(people|digital|money|macro|markets|scale|patterns|platforms|multipliers|trips|us|india|world|global|us & europe|us market|commerce & mobility|app behaviour|funnel benchmarks|global mau|us mau|processors & wallets|marketplace defaults|back-of-envelope|saas benchmarks|us vehicles|time per day.*|age breakdown|apps & rails|video \(us\)|audio \(us\)|general e-commerce|search & web)$/i;

/** Context chip for a flashcard: "🇺🇸 US · Uber (global)". */
export function contextFor(fact: Fact): string {
  const bits: string[] = [];
  if (fact.region) bits.push(REGION_LABEL[fact.region]);
  if (fact.group && !GENERIC_GROUP.test(fact.group)) bits.push(fact.group);
  else if (fact.topic && !fact.region) bits.push(fact.topic);
  return bits.join(' · ');
}
if (__DEV__) {
  const seen = new Set<string>();
  for (const x of ALL_FACTS) {
    if (seen.has(x.id)) console.warn(`Duplicate number id: ${x.id}`);
    seen.add(x.id);
  }
}
