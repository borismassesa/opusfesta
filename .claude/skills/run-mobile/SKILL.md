---
name: run-mobile
description: "Launches and drives the OpusFesta or OpusPass Expo app for local development — starting Metro, building/installing a dev client, and picking the right device. Use when the user asks to run, start, launch, or preview the mobile app, or wants to see a change working on-device. Covers both iOS apps in this monorepo: OpusFesta (apps/of_mobile) and OpusPass (apps/opus_pass_mobile)."
version: 1.0.0
---

# run-mobile

Starts local dev for one of the two Expo apps in this monorepo. This skill is shared across
the team — don't hardcode any individual developer's device name into it; let the tooling
prompt for a device instead.

## Pick the app first

This repo ships **two** apps that look identical at a glance (same scripts, same `eas.json`
shape). Never guess from the working directory alone — confirm which one the user means if
it isn't obvious from context.

| App | Directory | Scheme | Bundle ID |
|-----|-----------|--------|-----------|
| OpusFesta | `apps/of_mobile` | `opusfesta` | `com.opusfesta.mobile` |
| OpusPass | `apps/opus_pass_mobile` | `opuspass` | `com.opusfesta.opuspass` |

Run all commands from the app's own directory (`cd apps/<app>` first) — each app has its own
`package.json`, `node_modules`, and native `ios/`/`android/` project.

## Decide: first run/native rebuild, or JS-only reload?

- **First run on this machine, or a native change** (new native module, config plugin,
  `app.json`/`Info.plist`/entitlements edit, new native dependency) → build and install a dev
  client:
  ```bash
  npx expo run:ios --device
  ```
  Passing `--device` with no value opens an interactive picker listing connected devices and
  simulators — let the developer running the command choose their own target instead of
  assuming one. This runs prebuild + pod install + a full Xcode build, then installs and
  launches on-device.

- **JS/asset/style-only change** (components, hooks, most app code, images) — no native rebuild
  needed, just start Metro and let the already-installed dev client connect:
  ```bash
  npx expo start --dev-client
  ```
  Use `-c` to clear the Metro cache if you see stale-bundle symptoms:
  ```bash
  npx expo start --dev-client -c
  ```

If unsure which category a change falls into, ask rather than assuming — an unnecessary full
rebuild costs several minutes; a skipped one leaves you debugging against stale native code.

## Other targets (only if explicitly requested)

- **Android**: `npx expo run:android`.
- **Web**: `npx expo start --web` (or `npm run web`).

## Verifying it worked

Don't just report the command as run — confirm the app actually launched and the change is
visible: check Metro's terminal output for a successful bundle/connect, and if driving a UI
change, ask the user to confirm what they see on-device (no simulator screenshot tooling is set
up for this repo's iOS builds).
