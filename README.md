# Drill

**Practice PM interviews one card at a time.**

Drill is a flashcard-style practice app for product management interviews. Every
case study is broken into a swipeable deck — think-first prompts, the framework,
clarifying questions, who you are (and are not) solving for, key pointers, then
the full answer with the bet, options, metrics and strong-vs-generic — so you
rehearse the structure, not just read it.

Built with **Expo (React Native) + TypeScript + Expo Router**. Live at
[drill-inky.vercel.app](https://drill-inky.vercel.app).

## What's inside

| Section | What it does |
| --- | --- |
| **Case studies** | 38 PM questions across Product Design, Strategy, Analytical, Guesstimate, AI and RCA, each as a card deck with pinned Today picks, a jump-to index, four-direction swipe, bookmarks and streaks. |
| **Library** | Browse and filter every question by category, domain and difficulty in a masonry grid. |
| **Numbers** | 220+ interview anchor figures (India, US, World, mobile, payments, food and quick commerce, social, SaaS, travel, gaming…) as stat cards, with a 4-option quiz and an endless flashcard shuffle. |
| **You** | Streak, completed drills and saved questions. |

| **Frameworks** | The toolbox behind the answers — 18 frameworks (positioning stack, goal → behaviour → metric tree, RADAR, STAMP, value–price fit, top-down sizing, "what changed?" RCA, trust ladder, …) each with steps, when to use it, the trap, and the drills that apply it. Surfaced on Home, in the Library, and above each category's questions. |

> Design: "Quiet Cards" — soft grey canvas, white floating cards, one
> electric-blue accent. A question's answer is split by `src/drill/deck.ts`
> into a swipeable deck of single-idea cards so nothing on a phone is text-heavy.

## Run

```bash
npm install
npx expo start        # then press a / i / w, or scan the QR with Expo Go
npx expo start --web  # or open directly in a browser
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
