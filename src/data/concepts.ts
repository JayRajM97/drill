// Learn: AI concepts for PMs. Each concept is plain-English first, then how it
// actually works (one card per step), real products using it, a mini-glossary,
// and the PM angle — what to say about it in a room or an interview.

export interface ConceptTerm {
  term: string;
  def: string;
}

export interface ConceptUseCase {
  product: string;
  use: string;
}

export interface ConceptStep {
  label: string;
  detail: string;
}

export interface Concept {
  key: string;
  name: string;
  emoji: string;
  /** One-liner shown on the card. */
  tagline: string;
  /** Plain-English "what it is". */
  what: string;
  /** How it works, one card per step. */
  how: ConceptStep[];
  /** Real products that use it. */
  useCases: ConceptUseCase[];
  /** Mini-glossary of terms that travel with this concept. */
  terms: ConceptTerm[];
  /** What a PM should know / ask / say. */
  pmAngle: string[];
  /** The honest trade-off in one line. */
  tradeoff?: string;
}

export const CONCEPTS: Concept[] = [
  {
    key: 'rag',
    name: 'RAG',
    emoji: '📚',
    tagline: 'Retrieval-Augmented Generation — let the model look things up instead of making them up.',
    what:
      'An LLM only knows what it was trained on — nothing about your docs, your customers, or anything after its training cutoff. RAG fixes this: at question time, the system retrieves the most relevant chunks of your data and pastes them into the prompt, so the model answers from evidence in front of it rather than from memory. It is the default architecture for "chat with your data" products.',
    how: [
      {
        label: 'Ingest & chunk',
        detail: 'Split your documents into chunks — paragraphs, sections, tickets. Chunk size and boundaries matter enormously: too big and retrieval gets vague, too small and answers lose context.',
      },
      {
        label: 'Embed',
        detail: 'Turn every chunk into an embedding — a vector of numbers that captures meaning, not keywords. "Refund my order" and "I want my money back" land close together.',
      },
      {
        label: 'Store',
        detail: 'Put the vectors in a vector database (pgvector, Pinecone, Weaviate…) that can find "nearest neighbours" across millions of chunks in milliseconds.',
      },
      {
        label: 'Retrieve',
        detail: 'When a user asks something, embed the question and fetch the top-k closest chunks. Good systems mix vector search with keyword search (hybrid) and rerank the results.',
      },
      {
        label: 'Augment',
        detail: 'Paste the winning chunks into the prompt with instructions like "answer only from the context below; say \'I don\'t know\' otherwise".',
      },
      {
        label: 'Generate & cite',
        detail: 'The model answers grounded in the chunks. Ship citations back to the source — it builds trust and lets users verify.',
      },
    ],
    useCases: [
      { product: 'Notion AI Q&A', use: 'Answers questions from your own workspace pages, not the open internet.' },
      { product: 'Intercom Fin', use: 'Support copilot that retrieves from the help centre and resolves ~half of tickets when the KB is good.' },
      { product: 'Perplexity', use: 'Web-scale RAG — retrieve live pages, answer with citations.' },
    ],
    terms: [
      { term: 'Chunking', def: 'How documents get split before embedding. Bad chunking is the #1 cause of bad RAG.' },
      { term: 'Embedding', def: 'A vector representing the meaning of text; similar meanings sit close together.' },
      { term: 'Vector DB', def: 'A database that finds the nearest embeddings to a query, fast.' },
      { term: 'Top-k', def: 'How many chunks you retrieve per question. More = better recall, more noise, more tokens.' },
      { term: 'Reranker', def: 'A second, smarter model that reorders retrieved chunks by true relevance.' },
      { term: 'Grounding', def: 'Whether the answer is actually supported by the retrieved text.' },
      { term: 'Hybrid search', def: 'Vector + keyword search combined; keywords still win for names, SKUs and codes.' },
    ],
    pmAngle: [
      'RAG quality is a retrieval problem before it is a model problem — most failures are "the right chunk was never fetched", not "the model reasoned badly". Debug retrieval first.',
      'Metrics that matter: retrieval hit rate, groundedness of answers, citation click-through, deflection rate, and "I don\'t know" rate (too low means hallucination, too high means bad retrieval).',
      'Freshness is a product promise: how quickly does a new document become answerable? Minutes vs nightly sync is a real differentiator.',
      'Know when NOT to use it: knowledge that is small and stable fits straight in the prompt; tone and format problems want fine-tuning, not retrieval.',
    ],
    tradeoff:
      'RAG adds a retrieval hop (latency + infra) but is cheaper, fresher and more auditable than fine-tuning for factual knowledge.',
  },
  {
    key: 'embeddings',
    name: 'Embeddings & vector search',
    emoji: '🧭',
    tagline: 'Turn meaning into coordinates so "similar" becomes a distance you can compute.',
    what:
      'An embedding model maps text (or images, audio) to a list of numbers so that similar meanings end up near each other. Once everything is a point in space, "find related things" becomes "find nearest neighbours" — the engine behind semantic search, recommendations, dedupe and RAG retrieval.',
    how: [
      { label: 'Encode', detail: 'Run content through an embedding model → a vector (say 1,536 numbers). Same model for queries and content, always.' },
      { label: 'Index', detail: 'Store vectors in an index built for nearest-neighbour search (HNSW is the common one).' },
      { label: 'Query', detail: 'Embed the user\'s query, fetch the closest vectors by cosine similarity.' },
      { label: 'Blend', detail: 'In practice, blend with keyword scores, recency and popularity — pure similarity feels eerie but dumb.' },
    ],
    useCases: [
      { product: 'Spotify', use: 'Track and taste embeddings power radio and Discover Weekly-style similarity.' },
      { product: 'Airbnb search', use: 'Semantic matching between free-text queries and listing descriptions.' },
      { product: 'Support dedupe', use: 'Cluster tickets by embedding to find the top recurring issues automatically.' },
    ],
    terms: [
      { term: 'Cosine similarity', def: 'The standard "how close are two vectors" score.' },
      { term: 'Dimensions', def: 'Length of the vector. More ≠ better; it is a cost/quality dial.' },
      { term: 'ANN / HNSW', def: 'Approximate nearest-neighbour indexes — trade a little accuracy for huge speed.' },
      { term: 'Semantic search', def: 'Search by meaning instead of exact words.' },
    ],
    pmAngle: [
      'Embeddings are cheap and fast compared to LLM calls — many "AI features" (related items, smart search, dedupe) need only embeddings, no generation.',
      'The quality ceiling is the embedding model and your content hygiene, not the vector DB brand.',
      'Ask "what does similar mean for our users?" — clicks, purchases, or topic? That choice is the product decision.',
    ],
  },
  {
    key: 'fine-tuning',
    name: 'Fine-tuning vs prompting',
    emoji: '🎛️',
    tagline: 'Teach the model new behaviour vs just asking better.',
    what:
      'Prompting steers a general model with instructions and examples at request time. Fine-tuning goes further: you continue training the model on hundreds-to-thousands of your own examples so the behaviour becomes built-in. The ladder is: prompt → prompt with examples (few-shot) → RAG for knowledge → fine-tune for behaviour, tone and format.',
    how: [
      { label: 'Exhaust prompting first', detail: 'A good system prompt plus 3–5 examples solves most format and tone problems for free.' },
      { label: 'Collect pairs', detail: 'Fine-tuning needs input → ideal-output pairs. Quality beats quantity; 500 great pairs beat 50,000 scraped ones.' },
      { label: 'Train & version', detail: 'Train on the pairs, version the model like code, keep the base model as a fallback.' },
      { label: 'Evaluate side by side', detail: 'Run the same eval set on base vs fine-tuned. Ship only if it wins where it matters without regressing elsewhere.' },
    ],
    useCases: [
      { product: 'GitHub Copilot', use: 'Tuned on code so completions match how developers actually write.' },
      { product: 'Brand-voice writers', use: 'Marketing tools fine-tuned to a company\'s tone so every draft sounds on-brand.' },
      { product: 'Classifier at scale', use: 'A small fine-tuned model replaces an expensive frontier model for one narrow, high-volume task.' },
    ],
    terms: [
      { term: 'Few-shot', def: 'Showing examples in the prompt instead of training on them.' },
      { term: 'LoRA', def: 'A cheap fine-tuning method that trains a small add-on instead of the whole model.' },
      { term: 'Distillation', def: 'Using a big model\'s outputs to train a smaller, cheaper one.' },
      { term: 'Catastrophic forgetting', def: 'Fine-tuning too hard on one thing makes the model worse at everything else.' },
    ],
    pmAngle: [
      'The interview-ready rule: RAG for knowledge, fine-tuning for behaviour, prompting for everything until proven otherwise.',
      'Fine-tuning creates an asset and a liability: better unit economics, but now you own model ops, retraining and regressions.',
      'Your labelled data is the moat — the workflow that produces clean input/output pairs is worth more than the model.',
    ],
    tradeoff: 'Fine-tuning buys consistency and cheaper inference at the cost of flexibility and an ops burden.',
  },
  {
    key: 'hallucination',
    name: 'Hallucination',
    emoji: '🎭',
    tagline: 'The model states false things with total confidence — by design, not by bug.',
    what:
      'LLMs generate the most plausible next words, not verified facts. When the training data or context does not contain the answer, the model interpolates — producing fluent, confident, wrong output. You cannot patch it away; you design the product so that hallucinations are rare, detectable and cheap to recover from.',
    how: [
      { label: 'Ground it', detail: 'Give the model the facts (RAG, tools, structured data) so it does not have to remember.' },
      { label: 'Let it abstain', detail: 'Explicitly allow and reward "I don\'t know". Punishing abstention creates confident nonsense.' },
      { label: 'Show receipts', detail: 'Citations and previews let users verify in one glance.' },
      { label: 'Gate by stakes', detail: 'Low-stakes → generate freely. High-stakes (medical, legal, money) → require grounding, review, or refuse.' },
      { label: 'Measure it', detail: 'Sample outputs, label groundedness, track a hallucination rate per release like a crash rate.' },
    ],
    useCases: [
      { product: 'Search AI overviews', use: 'Answers constrained to retrieved pages with links — and still the highest-profile hallucination lessons in the industry.' },
      { product: 'Legal / medical drafting', use: 'Products that force citation-per-claim and human sign-off before anything leaves the building.' },
      { product: 'Drill\'s own RCA questions', use: '"Hallucination complaints spiked from one client" — a real PM case in this app.' },
    ],
    terms: [
      { term: 'Groundedness', def: 'Is every claim supported by provided context?' },
      { term: 'Confabulation', def: 'The research term — plausible invention, not lying.' },
      { term: 'Abstention', def: 'The model declining to answer. A feature, not a failure.' },
      { term: 'Temperature', def: 'Randomness dial; lower = more predictable, not necessarily more truthful.' },
    ],
    pmAngle: [
      'Never promise "no hallucinations". Promise detectability and recovery: citations, confidence bands, easy correction.',
      'The right metric pair: hallucination rate AND abstention rate. Optimising one alone breaks the product.',
      'Design the blast radius: what happens when it is wrong? That answer decides where AI is allowed in your flow.',
    ],
  },
  {
    key: 'evals',
    name: 'Evals',
    emoji: '🧪',
    tagline: 'Unit tests for model behaviour — the difference between shipping and guessing.',
    what:
      'An eval is a fixed set of inputs with a way to score the outputs — exact checks where possible, model-graded rubrics where not. Because model outputs are probabilistic and prompts interact in weird ways, evals are the only way to know a change made things better and not just different.',
    how: [
      { label: 'Collect real cases', detail: 'Pull 50–200 real inputs from production, including the ugly ones. Synthetic-only eval sets lie to you.' },
      { label: 'Define scoring', detail: 'Exact match where you can (classification, extraction), rubric + LLM-judge where you cannot (tone, quality), human spot-checks on top.' },
      { label: 'Gate releases', detail: 'Every prompt, model or retrieval change runs the evals in CI. Regressions block the ship.' },
      { label: 'Feed the loop', detail: 'Every production failure becomes a new eval case. The set grows into your quality moat.' },
    ],
    useCases: [
      { product: 'Every serious AI team', use: 'Prompt changes gated by eval runs, exactly like tests gate code.' },
      { product: 'Ema (in this app)', use: 'The eval-gated feedback pipeline drill — user corrections only ship after passing the eval set.' },
      { product: 'Model selection', use: 'Choosing GPT-x vs Claude vs a small model by running YOUR evals, not public benchmarks.' },
    ],
    terms: [
      { term: 'LLM-as-judge', def: 'Using a strong model to grade outputs against a rubric. Cheap, scalable, needs calibration.' },
      { term: 'Golden set', def: 'The curated eval cases with known-good answers.' },
      { term: 'Regression', def: 'A change that improves one case and silently breaks others — the reason evals exist.' },
      { term: 'Benchmark', def: 'Public eval (MMLU etc.). Good for marketing, weak for your product decisions.' },
    ],
    pmAngle: [
      'The PM owns the eval set: it encodes what "good" means for the product. Engineers automate it; you define it.',
      '"How do you know the AI is good?" is now a core PM interview question — the answer is always an eval story, not a demo story.',
      'Budget eval time into every AI feature; teams that skip it ship vibes and roll back in public.',
    ],
  },
  {
    key: 'agents',
    name: 'AI agents',
    emoji: '🤖',
    tagline: 'Models that take actions in a loop — plan, act, observe, repeat.',
    what:
      'A chatbot answers; an agent does. Give a model tools (search, database, email, code execution), let it decide which to call, feed the results back, and loop until the task is done. That loop — plan → act → observe → adjust — is what turns a model into a worker, and it is where both the value and the risk concentrate.',
    how: [
      { label: 'Define tools', detail: 'Each tool is a typed function the model may call: search_orders(query), send_email(to, body). Small, sharp tools beat god-tools.' },
      { label: 'Loop', detail: 'Model proposes a tool call → system executes it → result goes back into context → model decides the next step.' },
      { label: 'Bound it', detail: 'Budgets on steps, time and spend; approval gates on irreversible actions (see the trust ladder framework in this app).' },
      { label: 'Trace everything', detail: 'Log every step so failures are debuggable and users can audit what the agent did.' },
    ],
    useCases: [
      { product: 'Claude Code / Cursor', use: 'Coding agents that edit files, run tests, and iterate until green.' },
      { product: 'Ema-style AI employees', use: 'Ticket triage, research, ops workflows — the subject of three drills in this app.' },
      { product: 'Booking / ops agents', use: 'Multi-step tasks across tools: find, compare, fill forms, confirm with a human.' },
    ],
    terms: [
      { term: 'Tool / function calling', def: 'The model outputs a structured call; your code executes it.' },
      { term: 'Orchestration', def: 'The scaffolding that runs the loop, retries, and routes between models.' },
      { term: 'Human-in-the-loop', def: 'Approval checkpoints for risky actions.' },
      { term: 'MCP', def: 'Model Context Protocol — a standard for plugging tools and data into models.' },
    ],
    pmAngle: [
      'Price the autonomy, not the intelligence: what may it do alone, what needs approval, what is forbidden? That policy IS the product.',
      'Reliability compounds badly: 95% per step ≈ 60% over ten steps. Shorter loops and checkpoints beat smarter models.',
      'Measure outcomes (tasks completed end-to-end, human minutes saved), never activity (messages, steps).',
    ],
    tradeoff: 'Agents multiply value per request and multiply blast radius the same way — autonomy design is the job.',
  },
  {
    key: 'context-window',
    name: 'Context window',
    emoji: '🪟',
    tagline: 'The model\'s working memory — everything it can "see" right now.',
    what:
      'The context window is how much text (in tokens) a model can consider at once: the system prompt, the conversation, retrieved documents, tool results — everything. When it fills up, something must be dropped or summarised. Long windows (200k+ tokens) changed product design, but attention still degrades over long contexts and every token costs money and latency.',
    how: [
      { label: 'Budget it', detail: 'Treat the window like a fixed budget: instructions + history + retrieved context + room for the answer.' },
      { label: 'Prioritise', detail: 'Recent turns and retrieved chunks in full; older history summarised; boilerplate trimmed.' },
      { label: 'Cache', detail: 'Prompt caching makes repeated prefixes (long system prompts, docs) dramatically cheaper and faster.' },
      { label: 'Degrade gracefully', detail: 'Decide what the product does when context overflows — silent truncation is how bugs feel like betrayal.' },
    ],
    useCases: [
      { product: 'Claude with 200k–1M contexts', use: 'Whole codebases or contract stacks in one conversation.' },
      { product: 'Meeting assistants', use: 'Rolling summarisation so hour-long calls fit and stay coherent.' },
      { product: 'This session', use: 'The app you are holding was built in one long-context conversation.' },
    ],
    terms: [
      { term: 'Token', def: 'The unit of text models read (~4 characters of English).' },
      { term: 'Prompt caching', def: 'Reusing a processed prefix across requests for cheaper, faster calls.' },
      { term: 'Lost in the middle', def: 'Retrieval quality dips for facts buried mid-context.' },
      { term: 'Truncation', def: 'Silently dropping content when the window is full.' },
    ],
    pmAngle: [
      '"Just use a bigger window" is a cost decision: tokens × price × latency at your volume. Do that maths in the meeting.',
      'Long context and RAG are complements, not rivals — retrieval picks what deserves the window.',
      'Ask engineering: what exactly gets dropped when we overflow, and would a user notice?',
    ],
  },
  {
    key: 'tokens-economics',
    name: 'Tokens & unit economics',
    emoji: '🧮',
    tagline: 'AI features have a marginal cost per use — your margin is a prompt-design decision.',
    what:
      'Every model call is billed per token, in and out. Unlike normal software where marginal cost rounds to zero, an AI feature\'s COGS scales with usage, prompt size and model choice. PMs who cannot estimate cost-per-action end up with features that lose money precisely when they succeed.',
    how: [
      { label: 'Model the action', detail: 'Cost per action = (input tokens + output tokens) × price, × calls per action. Write it down per feature.' },
      { label: 'Route by difficulty', detail: 'Cheap model for easy cases, frontier model for hard ones. Routing is often a 5–10× saving.' },
      { label: 'Cache & trim', detail: 'Prompt caching, shorter system prompts, capped outputs — boring work, huge margins.' },
      { label: 'Price accordingly', detail: 'Seats with fair-use caps, credits, or usage-based tiers — match the pricing model to the cost curve.' },
    ],
    useCases: [
      { product: 'Copilot-style pricing', use: 'Flat seat price with the vendor eating variable cost — works only with aggressive routing/caching.' },
      { product: 'Credit systems', use: 'Image/video tools sell credits because cost per generation is visible and high.' },
      { product: 'Support automation', use: 'Priced per resolution — cost per action vs value per action, side by side.' },
    ],
    terms: [
      { term: 'Input vs output tokens', def: 'Output usually costs several times more than input.' },
      { term: 'Routing', def: 'Sending each request to the cheapest model that can handle it.' },
      { term: 'COGS', def: 'For AI features: inference spend. It moves with usage, not headcount.' },
      { term: 'Batch / async', def: 'Non-urgent work at a steep discount.' },
    ],
    pmAngle: [
      'Know your number: "this feature costs ~₹X per active user per month at current usage" — very few PMs can say it; the ones who can, run the roadmap conversation.',
      'Margin improves with prompt engineering — a rare case where product craft directly moves gross margin.',
      'Watch the trend: model prices fall ~10× every 1–2 years. A feature that is uneconomic today may be a no-brainer next year — sequence accordingly.',
    ],
  },
  {
    key: 'guardrails',
    name: 'Guardrails & safety',
    emoji: '🛡️',
    tagline: 'The layers around the model that keep outputs on-policy.',
    what:
      'Guardrails are the checks before and after the model: input filters (prompt-injection, abuse, PII), output filters (toxicity, policy, format validation), and behavioural constraints (what the product will simply not do). The model is probabilistic; guardrails are deterministic — that combination is what you can actually promise a customer.',
    how: [
      { label: 'Filter inputs', detail: 'Detect prompt injection, strip or mask PII, block abusive use before the model sees it.' },
      { label: 'Constrain outputs', detail: 'Validate structure (schemas), scan for policy violations, block or regenerate on failure.' },
      { label: 'Constrain behaviour', detail: 'Hard product rules: no medical dosing, no legal advice, no payments above ₹X without approval.' },
      { label: 'Red-team & monitor', detail: 'Attack your own system before users do; log near-misses and patch the gaps.' },
    ],
    useCases: [
      { product: 'Banking assistants', use: 'Can explain charges, structurally cannot move money without step-up auth.' },
      { product: 'Kids products', use: 'Age-appropriate output filters — the Netflix-for-Kids drill in this app is a guardrail design question.' },
      { product: 'Enterprise copilots', use: 'Permission-aware retrieval: the model literally cannot see documents the user cannot.' },
    ],
    terms: [
      { term: 'Prompt injection', def: 'Malicious content in the input that tries to hijack the model\'s instructions.' },
      { term: 'PII redaction', def: 'Masking personal data before it reaches the model or logs.' },
      { term: 'Jailbreak', def: 'Coaxing a model past its safety training.' },
      { term: 'Red-teaming', def: 'Deliberate adversarial testing of your own system.' },
    ],
    pmAngle: [
      'Guardrails are product requirements, not an infra afterthought — write them into the PRD like edge cases.',
      'The permission model is the hardest part of enterprise AI: retrieval must respect ACLs perfectly, once wrong is fatal.',
      'Every guardrail has a false-positive cost. Track "safe but blocked" like you track "unsafe but shipped".',
    ],
  },
  {
    key: 'latency-quality',
    name: 'Latency vs quality',
    emoji: '⚡',
    tagline: 'The core AI product trade-off: smarter is slower and pricier — pick per moment, not per product.',
    what:
      'Bigger models and more reasoning produce better answers and take longer. Users tolerate different waits in different moments: autocomplete must feel instant, a contract review may take a minute if progress is visible. Great AI products route each moment to the right point on the curve instead of picking one model for everything.',
    how: [
      { label: 'Map the moments', detail: 'List every AI touchpoint with its patience budget: <300ms feels instant, <2s feels fine, >10s needs progress and a reason.' },
      { label: 'Stream', detail: 'Show tokens as they generate — perceived latency drops massively even when total time is unchanged.' },
      { label: 'Route & precompute', detail: 'Small model for the instant path, big model for the deep path; precompute what you can predict.' },
      { label: 'Sell the wait', detail: 'When it must be slow, show the work ("read 14 documents…") — visible effort converts waiting into trust.' },
    ],
    useCases: [
      { product: 'Copilot autocomplete', use: 'A small fast model inline; the big model only for chat.' },
      { product: 'Perplexity / deep research', use: 'Streams sources and progress so a 30-second answer feels earned.' },
      { product: 'Voice assistants', use: 'Sub-second budgets force aggressive routing and caching.' },
    ],
    terms: [
      { term: 'TTFT', def: 'Time to first token — the latency users actually feel.' },
      { term: 'Streaming', def: 'Rendering output as it generates.' },
      { term: 'Reasoning budget', def: 'Letting a model "think longer" for quality — a per-request dial on newer models.' },
      { term: 'P95', def: 'Tail latency; the slow requests that define how the product feels.' },
    ],
    pmAngle: [
      'Spec the patience budget per feature the way you spec accuracy — "as fast as possible" is not a requirement.',
      'Perceived latency is a design surface: streaming, skeletons and progress often beat a model upgrade.',
      'In interviews, naming this trade-off unprompted ("I\'d route: fast model inline, deep model on demand") reads instantly senior.',
    ],
  },
];

export const CONCEPT_BY_KEY: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.key, c]));
