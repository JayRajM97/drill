# Getting Drill onto phones

The app is already React Native (Expo). The web site is just one target; iOS
and Android come from the same codebase. Verified natively on the iOS 26
simulator (Expo Go, SDK 56) with no code changes.

One-time setup: `npm i -g eas-cli && eas login` (free Expo account), then
`eas init` once to attach the project.

## Today, free: Expo Go + EAS Update
1. `eas update --branch preview --message "first share"`
2. Everyone (iOS + Android) installs **Expo Go** from their store and opens the
   update link / QR that the command prints.

No builds, no accounts for friends, works on both platforms. Trade-off: it runs
inside Expo Go, not as its own home-screen app, and home-screen widgets do not
work in Expo Go.

## Android friends: a real APK (free)
```bash
npm run build:android     # eas build -p android --profile preview
```
EAS builds in the cloud and prints a link; friends open it on the phone,
download the APK and install (allow "install unknown apps" once). No Play Store
account needed. `android.package` = `in.aitainment.drill`.

## Your iPhone
- **Free**: plug in the phone, `npx expo run:ios --device` (personal team
  signing, re-install every 7 days), or just use Expo Go.
- **Proper**: Apple Developer Program ($99/yr) → `npm run build:ios` →
  distribute via **TestFlight** (`eas submit -p ios`). This is also what the
  home-screen widget needs (widgets don't run in Expo Go).

## Home-screen widget
The iOS widget ("Today's drill") is a native extension in `targets/widget/`.
It only exists in real builds — **not** in Expo Go. To see it: build the app
(`npx expo run:ios` or an EAS build), install, then long-press the home
screen → Edit → Add Widget → Drill. Android widget is planned
(docs/BACKLOG.md).

## Play Store / App Store later
`eas build --profile production` + `eas submit` for both stores.
`ios.bundleIdentifier` / `android.package` are set to `in.aitainment.drill`
(reverse-DNS of aitainment.in) — change them in app.json before the first
store upload if you want a different identity; they are permanent once
published.
