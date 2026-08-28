# Drill — backlog

## Next up: Frameworks section (planned 2026-08-30)

**Why.** Every drill already names a framework ("Positioning stack", "Goal → Behaviour →
Metric tree", "Product Design Framework") but the frameworks only exist inside answers.
A learner should be able to browse the *toolbox* first, then see which questions each
tool solves.

### Scope
1. **Data** — `src/data/frameworks.ts`: a typed list of frameworks, each tagged with the
   question categories it applies to and the question ids that use it.
2. **Frameworks tab / section** — browse cards grouped by category
   (Product Design · Strategy · Analytical · Guesstimate · RCA · AI).
3. **Category page** — a horizontal row of framework cards *above* the question grid
   ("Frameworks for Product Design" → Product Design questions).
4. **Drill link-up** — the Framework card in a drill links to the framework page;
   the framework page lists the drills that use it.

### Research to do first (standard PM-interview frameworks by category)
| Category | Candidates to research and pick 2–3 from |
| --- | --- |
| Product Design | CIRCLES (Lewis Lin) · Design-thinking 5-step · User → Pain → Solution → Prioritise → Metrics → Trade-offs (ours) · JTBD · Kano |
| Product Strategy | Positioning stack (category → target → alternatives → proof → metrics) · Porter's Five Forces · SWOT · 3C/4P · Blue Ocean · Wardley (light) · Bets & moats |
| Analytical / Metrics | Goal → Behaviour → Metric tree (ours) · AARRR / pirate metrics · HEART · North Star + input metrics · OKR tree · Counter-metric / guardrail pattern |
| Guesstimate | Top-down (population → funnel) vs bottom-up (unit × frequency) · Segment-and-multiply · Sanity-check triangulation · Fermi decomposition |
| RCA / "What changed" | What changed? (internal / external / measurement) · 5 Whys · Segment-and-isolate (geo / platform / cohort / time) · Ishikawa · Correlation vs causation check |
| AI product | Human-in-the-loop trust ladder · Evaluation triangle (accuracy / latency / cost) · Confidence-gated actions · Data flywheel |
| Execution / prioritisation | RICE · ICE · Impact vs effort · MoSCoW · Weighted scoring |

For each: **when to use**, **the steps**, **the trap** (how people misuse it), **one worked
example** (ideally one of our own questions).

### Card structure (proposal — same card language as drills)
```
[eyebrow]  STRATEGY · 5 STEPS
[title]    Positioning stack
[one-liner] Category → target → alternative → proof → metric.
[pills]    Category · Target · Alternative · Proof · Metric   (tap = step detail above)
[footer]   Best for: "How would you position X vs Y" · Used in 3 drills →
```
Tapping opens a mini-deck: one card per step (what to say, what to avoid), then a
"where it's used" card listing drills. Reuse `PillsCard` / `Layer` from the drill screen.

### Open questions
- Are our three custom frameworks (positioning stack, metric tree, pain-point
  prioritisation) standard enough to teach as-is, or should each map to a named
  public framework plus "our twist"?
- One framework per question, or allow 2 (e.g. CIRCLES + Kano)?

---

## Smaller items
- Numbers: figures are from memory (2024 ballpark) — do a source pass and add a
  `source` / `asOf` field per fact.
- Non-curated (Notion-seeded) questions have no `not_for`; author them.
- Clarifying-question W/H grouping is keyword-based; add an explicit `wh:` tag per
  question when authoring.
- Vercel: connect the GitHub repo for auto-deploys (currently `vercel --prod` by hand).
