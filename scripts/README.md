# Seed data pipeline

The app's question dataset has two parts, merged in `src/data/localRepository.ts`
(`curated` first, then normalized legacy). The app **never** calls Notion at
runtime — all seeding is build-time.

## Sources

1. **Curated (`src/data/curated.ts`)** — 8 hand-authored questions from the v2
   build spec, written directly in the `Question` shape (`src/types/question.ts`):
   typed `answer` sections (`text`/`bullets`/`table`/`callout`/`code`), a
   structured `framework`, `key_pointers`, and optional `strong_vs_generic`.

2. **Legacy Notion (`assets/seed/legacy-notion.json`)** — 37 questions originally
   extracted from the Notion "Questions" database
   (`collection://31dbb288-96c6-8035-86ef-000b7abb4686`). These use the older
   flat shape and are converted to the current `Question` schema at load by
   `src/data/normalizeLegacy.ts` (`pain_points → key_pointers`,
   `full_answer.sections → answer[bullets]`, `framework + framework_steps →
   framework{name,steps}`, etc.).

## Deduplication

The 8 curated questions each have a higher-fidelity counterpart among the 37
legacy records. `normalizeLegacy.ts` drops those via `SUPERSEDED_LEGACY_IDS`, so
the merged set is **8 curated + 29 legacy = 37** with no duplicates.

## Regenerating / extending

- Add or edit curated questions directly in `src/data/curated.ts`.
- To refresh the Notion set, re-extract into `assets/seed/legacy-notion.json` in
  the legacy flat shape; the normalizer handles the rest.

## Migrating to Firestore (later)

The merged `Question[]` can seed a Firestore `questions` collection. Implement
`src/data/firestoreRepository.ts` against the `QuestionRepository` interface and
switch the active export in `src/data/index.ts`.
