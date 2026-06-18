# Drill

PM interview practice app — flashcard-style question practice with a signature
3D flip card. Built with **Expo (React Native) + TypeScript + Expo Router**.

> Scaffold stage: structure, navigation, data, and core interactions are in
> place with neutral dark styling. Final visuals will be matched to mockups.

## Run

```bash
npm install
npx expo start        # then press a / i / w, or scan the QR with Expo Go
```

Other checks:

```bash
npm run typecheck     # tsc --noEmit
npx expo export --platform android   # validate the JS bundle
```

## Architecture

- `app/` — Expo Router screens: Home (`index`), Category (`category/[name]`),
  the 5-card Question stack (`question/[id]`), and Bookmarks (`bookmarks`).
- `src/data/` — a `QuestionRepository` interface with a local JSON
  implementation (`localRepository`) for v1 and a `firestoreRepository` stub.
  Swapping backends is a one-line change in `src/data/index.ts`.
- `src/state/` — AsyncStorage-backed progress (streak, bookmarks, completed)
  and deterministic daily-question selection.
- `src/components/` — `FlipCard` (genuine 3D `rotateY`), `TimerRing`,
  `BottomSheet`, and list/card UI.
- `assets/seed/questions.json` — question dataset seeded from Notion at build
  time (see `scripts/README.md`). The app never calls Notion at runtime.

## Status / roadmap

v1 is local-only (no auth; AsyncStorage for progress) per the PRD V1 cuts. The
data layer is structured for a later move to **Firestore**, plus daily Claude
question generation.
