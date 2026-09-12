# Cloud sync for streaks

Drill works fully offline: progress lives in AsyncStorage on the device. Signing
in adds a cloud copy so the streak survives a reinstall and follows you to
another device. With no Firebase config present, the auth UI shows a short
"not set up" note and everything else behaves exactly as before.

## One-time setup (about five minutes)

1. Go to <https://console.firebase.google.com> and create a project.
2. **Build → Authentication → Get started → Email/Password → Enable.**
3. **Build → Firestore Database → Create database →** start in *production* mode.
4. **Project settings → Your apps → Web (`</>`)** and register an app.
   Copy the `firebaseConfig` values it shows.
5. Create `.env.local` in the repo root (it is gitignored) using
   `.env.example` as the template, and paste the values in.
6. Publish the security rules from `firestore.rules`:

   ```sh
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```

   These rules limit every user to their own `users/{uid}` document. Without
   them a production-mode database denies all access and sync will fail.

7. Rebuild so the values are baked into the bundle: `npm run ios:device` for
   the phone, and set the same variables in the Vercel project for web.

## How the data is shaped

One document per user at `users/{uid}`:

| field | meaning |
| --- | --- |
| `streak` | current consecutive-day count |
| `activeDates` | every day the user completed a drill |
| `completedIds` | drills finished |
| `bookmarkIds` | saved drills |
| `lastCompletedDate` | most recent active day |

`activeDates` is what makes two devices mergeable. On sign-in the app unions
the day lists and recounts the streak, so practising on a phone one day and a
laptop the next correctly reads as a two-day streak.

## Local development

The auth emulator needs no Java and is enough to exercise sign-up and sign-in:

```sh
npx firebase-tools emulators:start --only auth --project demo-drill
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1 npm run web
```

The Firestore emulator does require a Java runtime.
