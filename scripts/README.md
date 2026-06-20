# Seed data pipeline

The app's question dataset has two parts, merged in `src/data/localRepository.ts`
(`curated` first, then enriched Notion). The app **never** calls Notion at
runtime — all seeding is build-time.

## Sources

1. **Curated (`src/data/curated.ts`)** — 8 hand-authored questions written
   directly in the `Question` shape (`src/types/question.ts`): typed `answer`
   sections (`text`/`bullets`/`table`/`callout`/`code`), a structured
   `framework`, `key_pointers`, and optional `strong_vs_generic`.

2. **Enriched Notion (`assets/seed/enriched-notion.json`)** — 29 questions
   sourced from the Notion "Questions" database
   (`collection://31dbb288-96c6-8035-86ef-000b7abb4686`) and rewritten into the
   full `Question` schema (tables/callouts/metrics, `framework`, `key_pointers`,
   `strong_vs_generic`). Loaded by `src/data/notionQuestions.ts`. The raw
   pre-enrichment export is kept at `assets/seed/legacy-notion.json` for
   provenance (not bundled).

## Deduplication

The 8 curated questions each had a higher-fidelity counterpart among the Notion
records; those 8 are excluded from `enriched-notion.json`, so the merged set is
**8 curated + 29 enriched = 37** with no duplicates.

## How it renders

The 6-step drill (`app/question/[id].tsx`) maps fields to the Stitch design:
framework → clarifying → user segments → key pointers → the structured
breakdown (non-callout `answer` sections, typed) → final recommendation
(callout sections + `strong_vs_generic`).

## Migrating to Firestore (later)

The merged `Question[]` can seed a Firestore `questions` collection. Implement
`src/data/firestoreRepository.ts` against the `QuestionRepository` interface and
switch the active export in `src/data/index.ts`.
