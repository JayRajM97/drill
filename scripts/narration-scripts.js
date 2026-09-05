// Spoken narration scripts for the highlighted drills — written to be READ
// ALOUD by one warm coaching voice, not to mirror the cards word for word.
// Each chapter becomes one TTS request; offsets are measured after synthesis
// so the player can show which part of the answer is being discussed.

module.exports = {
  'position-notion-vs-confluence-google-docs': {
    title: 'How would you position Notion vs. Confluence and Google Docs?',
    chapters: [
      {
        label: 'The question',
        text: `Alright — here's the question. How would you position Notion against its alternatives — Confluence, and Google Docs? Take a breath. This is a positioning question, which means the interviewer doesn't want a feature comparison. They want to see if you can find the one sentence that makes a customer switch.`,
      },
      {
        label: 'The framework',
        text: `The tool for this is the positioning stack. Seven moves: define the category you're playing in. Pick the target customer — and just as importantly, who it's not for. Name the real alternatives people actually use today. Find the structural gap those alternatives can't fill. Then compress all of that into one quotable statement, back it with proof, and define the metrics that tell you the positioning is landing. Category, target, alternatives, gap, statement, proof, metrics. That's the spine of everything that follows.`,
      },
      {
        label: 'Clarify first',
        text: `Before answering, buy yourself thirty seconds with two or three sharp questions. Are we positioning for a specific buyer, like a startup ops lead, or the whole market? Which alternatives count — just Confluence and Docs, or Evernote and Jira too? And what company size are we targeting — because a fifty-person startup and a ten-thousand-person enterprise buy in completely different ways.`,
      },
      {
        label: 'Who it is for — and not',
        text: `Now, the customer. The primary buyer is an ops lead, an engineering manager, or a founder at a twenty to five-hundred person startup — someone drowning in Google Docs, who tried Confluence and found it heavy. And here's the senior move: say out loud who it's NOT for. Not for ten-thousand-person enterprises — procurement loves Confluence. Not for solo note-takers — that's Apple Notes. Positioning is exclusion. "Notion is for everyone" is not positioning; it's the absence of it.`,
      },
      {
        label: 'The category decision',
        text: `Step one of the answer is the category, and it's where most candidates go wrong. If you call Notion a notes app, you've made it compete with Evernote — small market, small price. Call it a wiki, and it's a worse Confluence. The right move is to name a new category: the connected workspace. Notes, wiki, and project manager collapsed into one. The category you choose decides what you're compared against — choose the one you can win.`,
      },
      {
        label: 'The structural gap',
        text: `Why can't the alternatives just catch up? Because their weaknesses are structural, not cosmetic. Confluence has structure but no flexibility — a rigid hierarchy people write into and never read from. Google Docs has flexibility but no structure — brilliant for one document, hopeless at two hundred, when nobody can find anything. Each one would have to become a different product to fix its flaw. That's the gap Notion lives in.`,
      },
      {
        label: 'The statement',
        text: `So here's the positioning statement — and notice how quotable it is. "Notion is the connected workspace for teams who've outgrown Google Docs, but aren't ready to get trapped in Confluence." One sentence. It names the exact transition moment in a company's life, it names the enemy without being hostile, and a founder could repeat it to another founder over coffee. That's the test of positioning — does it travel without you in the room?`,
      },
      {
        label: 'Proof and metrics',
        text: `Back it with proof: connected means backlinks and database relations — a brain, not a filing cabinet. Flexible means one block-based editor that can be a note today and a CRM tomorrow. And measure whether the positioning lands: trial-to-paid conversion from the audiences the message attracts, and the aha moment — the percentage of new teams who link a database to a doc in their first session. If they do that, they've felt the category. Say all this in the interview, and you haven't listed features — you've told a story about a switching moment. That's what positioning is.`,
      },
    ],
  },

  'q-zomato-buy-again-metrics': {
    title: "How would you measure the success of a 'Buy again' shortcut on Zomato's home screen?",
    chapters: [
      {
        label: 'The question',
        text: `Here's the question. Zomato ships a "Buy again" shortcut on the home screen — one tap to reorder what you had last time. How do you measure whether it worked? This is a metrics question, and the trap is baked right in: it's very easy to declare victory with numbers that would have happened anyway.`,
      },
      {
        label: 'The framework',
        text: `Use a goal, behaviour, metric tree. First state the goal in the business's words — this shortcut exists to make repeat ordering faster and more frequent. Then map the behaviour: a user sees the shortcut, taps it, confirms, the order lands, and hopefully they come back next week. Your metrics live on that path. One North Star, a few supporting metrics that explain it, counter-metrics for what could quietly break, and a measurement design you commit to before you see any data.`,
      },
      {
        label: 'Clarify first',
        text: `Sharpen the scope first. What exactly is the shortcut — a single tap that reorders the last order, or a carousel of past orders? Who sees it — everyone, or only people with order history? And what's the primary business goal: order frequency, speed to order, or reducing drop-off? Each answer shifts what you measure.`,
      },
      {
        label: 'The North Star',
        text: `Here's the bet: the North Star is orders per active user per week — measured as a lift against a holdout. Keep ten percent of eligible users who never see the shortcut, and compare. Why so strict? Because habitual users reorder anyway. If you just count orders that flowed through the shortcut, you're counting demand that already existed and calling it impact. The holdout is what makes the number honest — it separates incremental orders from relabelled ones.`,
      },
      {
        label: 'Supporting metrics',
        text: `Around the North Star, three supporting metrics. Shortcut adoption — of the users who can see it, how many tap it within a week? That's discoverability. Time from app open to order placed — the shortcut's whole promise is speed, so aim for a thirty to forty percent cut. And shortcut orders as a share of total orders — how much demand now flows through this path. Useful, but remember: share of orders is not proof of new orders.`,
      },
      {
        label: 'Counter-metrics',
        text: `Now the part that separates senior answers: what could this quietly break? Average order value — quick reorders may skip the add-ons and drinks that pad the basket. New-restaurant discovery — a repeat-order shortcut can slowly starve exploration, and Zomato's long-term health needs users trying new places. And order ratings — are people reordering things they didn't actually want? Watch cancellations on shortcut orders versus normal ones.`,
      },
      {
        label: 'The decision rule',
        text: `Finally, commit to the decision before the data arrives. Four weeks of A/B test — enough to cover weekly ordering cycles. Eligible users only: at least one order in the last sixty days. And a pre-registered rule: ship if orders per user rise at least three percent, with order value and discovery flat. Also check whether the lift fades from week one to week four — a fading lift is curiosity, not a habit. Say it in that order — goal, behaviour, honest North Star, counters, decision rule — and you've shown you measure like an owner, not a cheerleader.`,
      },
    ],
  },

  'design-netflix-for-kids': {
    title: 'Design Netflix for Kids',
    chapters: [
      {
        label: 'The question',
        text: `Design Netflix for Kids. It sounds cute — it's actually one of the sharpest two-sided design questions there is. Because the person watching, and the person paying, are different people with different fears. Get that in your first minute and the interviewer sits up.`,
      },
      {
        label: 'The framework',
        text: `The shape here is the classic design loop: clarify, users, pain points, prioritise, solutions, metrics, and trade-offs — with a twist at the end, because kids products carry safety trade-offs that normal products don't. Don't rush the user step. On this question, that's where the whole answer is won.`,
      },
      {
        label: 'Clarify first',
        text: `Clarify four things. Is this a vertical inside Netflix, or a standalone app like YouTube Kids? Pure entertainment, or education too? Who makes the content — Netflix studios and licensed partners, or user-generated? And the big one: which age band? A four-year-old who can't read and an eleven-year-old need entirely different products. A sensible scope: a Kids vertical inside the existing subscription, curated content only, ages four to nine.`,
      },
      {
        label: 'Two users, one product',
        text: `Now the users. The kid is the consumer — they want fun they can find on their own. But the adult interface is text-heavy; a pre-reader can't navigate titles safely. The parent is the gatekeeper — they set it up, they pay, and what they want isn't content at all: it's trust. Visibility into what's being watched, and controls that actually work. There are also siblings sharing a device across ages, and teachers recommending content. But the tension that matters is kid-fun versus parent-trust.`,
      },
      {
        label: 'Prioritise',
        text: `So who do you build for? Primary user: the kid, four to nine — their engagement is what makes the family keep the subscription. But the parent is the enabling user. No parent trust, no device handed over, no usage at all. So safety controls aren't a feature on the roadmap — they're the prerequisite for having users. The top pain to solve: kids can't self-navigate safely, and parents can't see or control what's happening.`,
      },
      {
        label: 'The bet',
        text: `Here's the bet: win on trust, not catalog. Two things shipped together. For the kid — an icon-and-character-first interface with voice search, so a child who can't read can still find the dinosaur show by themselves. For the parent — a control centre: an age filter, screen-time limits, and a transparent watch history. Engagement follows trust, because for a kids product, parent trust is the real acquisition and retention lever. YouTube Kids has more content; the winnable ground is being the one parents don't worry about.`,
      },
      {
        label: 'Metrics and the trade-off',
        text: `Measure both sides. For the kid: weekly active kid profiles and watch time. For the parent: control adoption — what share of families set an age filter or a time limit — because that setup act predicts retention. And the guardrail: parental complaints per thousand sessions; high engagement with low safety is a failure. Then name the trade-off out loud: autoplay and infinite recommendations would juice watch time and erode the exact trust that keeps families subscribed. So this product deliberately caps autoplay and honours screen-time limits — even at a short-term engagement cost. Choosing trust over a vanity metric, and saying so — that's the senior finish.`,
      },
    ],
  },
};
