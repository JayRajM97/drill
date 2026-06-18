# Seed data pipeline

`assets/seed/questions.json` is the bundled question dataset the app reads at
runtime via `src/data/localRepository.ts`. The app **never** calls Notion at
runtime — seeding is a build-time step.

## How it was generated

1. Source: the Notion "Questions" database
   (`collection://31dbb288-96c6-8035-86ef-000b7abb4686`).
2. Each question page was fetched and its prose body extracted into the
   structured `Question` shape defined in `src/types/question.ts`
   (`clarifying_qs`, `user_segments`, `pain_points`, `framework`,
   `framework_steps`, `full_answer.sections`, …).
3. Pages containing multiple questions were split into separate records.
   Non-question reference/master pages were skipped.
4. `source_url` on every record links back to the originating Notion page, so
   any extracted content can be verified against the source.

## Regenerating

Re-run the extraction against Notion and overwrite `assets/seed/questions.json`
with a JSON array of `Question` records. Keep `is_published: true` for records
that should appear in the app.

## Migrating to Firestore (later)

The same JSON can seed a Firestore `questions` collection. Implement
`src/data/firestoreRepository.ts` against the `QuestionRepository` interface and
switch the active export in `src/data/index.ts`.
