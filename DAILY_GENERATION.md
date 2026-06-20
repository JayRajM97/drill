# Daily question generation (Firestore + Cloud Functions)

A scheduled Cloud Function generates **6 fresh questions a day (one per category)** at
**08:00 IST**, using Claude with the `jay-pm-interview` rules, and writes them to
Firestore. The app reads questions from Firestore.

- Generation runs **server-side only** — the Anthropic key never ships in the app.
- Model: `claude-sonnet-4-6` (change `MODEL` in `functions/src/generate.ts` to
  `claude-opus-4-8` for higher quality).
- New questions **auto-publish** (`is_published: true`).

## Layout

```
functions/                 # Cloud Functions (TypeScript)
  src/index.ts             # scheduled `generateDailyQuestions` + manual `generateDailyNow`
  src/generate.ts          # Claude call (structured output via Zod)
  src/prompt.ts            # jay-pm-interview system prompt + per-category frameworks
  src/schema.ts            # generation schema + mapping to the app's Question shape
  src/seed.ts              # one-time: push the bundled 37 questions into Firestore
  integration/firestoreRepository.ts   # app read-side (drop into src/data/, see below)
firebase.json, firestore.rules, firestore.indexes.json
assets/seed/curated.json   # 8 curated questions (for seeding)
assets/seed/enriched-notion.json  # 29 enriched questions (for seeding)
```

## One-time setup

1. **Create a Firebase project** (Blaze/pay-as-you-go plan — Cloud Functions require it). Enable **Firestore** and **Cloud Functions**.
2. `npm install -g firebase-tools` and `firebase login`; then `firebase use --add <project>`.
3. Store the Anthropic key as a secret:
   ```sh
   firebase functions:secrets:set ANTHROPIC_API_KEY
   ```
4. Install + build the functions:
   ```sh
   cd functions && npm install && npm run build
   ```
5. Deploy rules, indexes, and functions:
   ```sh
   firebase deploy --only firestore:rules,firestore:indexes,functions
   ```

## Seed the existing 37 questions (so the app isn't empty before the first run)

```sh
cd functions
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed
```

(Download a service-account key from Firebase console → Project settings → Service accounts.)

## Test the generator immediately

The `generateDailyNow` HTTPS function triggers a run on demand:

```sh
curl "$(firebase functions:list | grep generateDailyNow)"   # or copy the URL from the deploy output
```

Confirm 6 new docs appear in `questions/` and a `daily/<today>` doc was written.
Then **remove or lock down `generateDailyNow`** before going to production.

## Wire the app to read from Firestore

1. `npx expo install firebase`
2. Add `src/data/firebase.ts`:
   ```ts
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   const app = initializeApp({
     apiKey: '...', projectId: '...', appId: '...', /* from Firebase console */
   });
   export const db = getFirestore(app);
   ```
3. Copy `functions/integration/firestoreRepository.ts` → `src/data/firestoreRepository.ts`.
4. In `src/data/index.ts`, switch the active export:
   ```ts
   export { firestoreRepository as questions } from './firestoreRepository';
   ```
   Keep the bundled JSON as an offline fallback if you want resilience with no network.

## Cost (rough)

6 questions/day on Sonnet 4.6 ≈ a few cents/day. Opus 4.8 is ~5× the input price —
still well under ~$1/day at this volume.
