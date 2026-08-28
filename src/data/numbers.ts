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

/** Flat list; ids are unique by construction — assert it in dev. */
export const ALL_FACTS: Fact[] = NUMBER_TOPICS.flatMap((t) => t.groups.flatMap((g) => g.facts));
if (__DEV__) {
  const seen = new Set<string>();
  for (const x of ALL_FACTS) {
    if (seen.has(x.id)) console.warn(`Duplicate number id: ${x.id}`);
    seen.add(x.id);
  }
}
