---
name: testflight-local
description: "Runs a local TestFlight build and upload for the mobile app via the `asc` CLI — bypassing the EAS queue for faster iteration. Use when the user runs '/testflight-local' or asks to build/push OpusFesta to TestFlight locally, or wants a quick TestFlight drop after a native or JS change in apps/of_mobile."
---

# testflight-local (mobile)

Scoped to `apps/of_mobile` — builds and uploads **OpusFesta**, not any other app in this
monorepo. Runs a local TestFlight build and upload using the `asc` CLI, bypassing the
EAS queue for faster iteration.

## When to Use

Use this skill when the user wants to:
- Push a build to TestFlight without waiting in the EAS queue
- Run `/testflight-local` or asks to "build for TestFlight locally"
- Do a quick TestFlight drop after a native or JS change in `apps/of_mobile`

## Prerequisites Check

Before running the build, verify the environment:

### 1. Check asc is installed

```bash
if ! command -v asc &>/dev/null; then
  echo "asc CLI not found. Install with:"
  echo "  brew install asc"
  exit 1
fi
```

If missing, tell the user to run `brew install asc` and re-invoke the skill.

### 2. Check asc auth is configured

```bash
asc auth status 2>/dev/null | grep -q '"name":"Beeli"'
```

Credentials live in the system keychain (`asc auth status` reports `storageBackend`).
The credential name is `"Beeli"` — that's the ASC account/team name (team `FWL2W5X58S`),
which also owns OpusFesta's bundle ID (`com.opusfesta.mobile`); it is not a different app.

If not authenticated, provide the exact login command:

```bash
asc auth login \
  --name "Beeli" \
  --key-id 3UCMS5TJ6T \
  --issuer-id 5788ad38-186e-49cb-8813-62a8cb2f3fa3 \
  --private-key ~/.appstoreconnect/AuthKey_3UCMS5TJ6T.p8 \
  --network
```

Tell the user to run this once, then re-invoke the skill.

### 3. Confirm script exists

The script lives at the **repo root** `scripts/` (i.e. `opusfesta/scripts/`), not under
`apps/of_mobile/`. Run all commands from the repo root, or use the absolute path.

```bash
if [[ ! -f "./scripts/testflight-local.sh" ]]; then
  echo "Script not found at ./scripts/testflight-local.sh"
  echo "Run from the repo root (opusfesta/), not apps/of_mobile/."
  exit 1
fi
```

## Running the Build

Ask the user one question before starting:

> "Have the native iOS files changed (new packages, config updates, new plugins)?"
> - **Yes** → full build (includes prebuild + pod install)
> - **No** → skip prebuild (faster, JS/asset changes only)

### Full build (native changed)

```bash
./scripts/testflight-local.sh
```

### Skip prebuild (native unchanged)

```bash
./scripts/testflight-local.sh --skip-prebuild
```

## Phase-by-Phase Explanation

Narrate each phase as it runs so the user knows what's happening:

| Phase | What it does | Typical time |
|-------|-------------|--------------|
| `eas env:pull production` | Pulls `EXPO_PUBLIC_*` production env vars into `.env.production` (removed on exit) | ~5s |
| `expo prebuild` | Regenerates native iOS project from Expo config | 1–2 min |
| `pod install` | Syncs CocoaPods dependencies | 1–3 min |
| `asc xcode version bump --type build` | Increments the `CFBundleVersion` build number in the Xcode project | ~10s |
| `asc xcode archive --overwrite` | Compiles and archives the app in Release configuration (`--overwrite` replaces a stale `/tmp/OpusFesta.xcarchive`) | 5–15 min |
| `asc xcode export … --wait` | Exports a signed IPA and uploads it straight to TestFlight via the ExportOptions (`destination: upload`), then polls until the build appears in App Store Connect | 3–10 min |

Signing is **automatic** (`signingStyle: automatic`, team `FWL2W5X58S` in
`apps/of_mobile/ios/ExportOptions.plist`). Both the archive and export steps forward the
App Store Connect **API key** to `xcodebuild` (`-allowProvisioningUpdates` +
`-authenticationKeyPath/-authenticationKeyID/-authenticationKeyIssuerID`, set in the
script from `ASC_KEY_PATH`/`ASC_KEY_ID`/`ASC_ISSUER_ID`). That authenticates the upload
**and** lets xcodebuild mint a distribution cert + App Store profile on the fly and
re-sign at export — so **no Apple Distribution cert or Apple ID needs to be present in
Xcode** (the archive may be signed with just an Apple Development cert). This matters
here specifically because `app.json` has no `ios.appleTeamId`, so `expo prebuild`
regenerates the Xcode project with no `DEVELOPMENT_TEAM`/provisioning style set —
the archive step needs the same auth-key flags as export for that reason.

Benign `Upload Symbols Failed` warnings for `hermes.framework`,
`React.framework`, and `ReactNativeDependencies.framework` are expected — those
prebuilt frameworks ship no dSYMs and the upload still succeeds.

## App Details

- **App name:** OpusFesta
- **App ID (App Store Connect):** `6786090250` — **not** `6759113274`. That other ID
  belongs to a different app ("Beeli") under the same ASC team/credential; the shared
  credential name (`"Beeli"`) refers to the *account*, not the app being built. Always
  use `6786090250` when querying builds for this repo.
- **Bundle ID:** `com.opusfesta.mobile`
- **Workspace:** `apps/of_mobile/ios/OpusFesta.xcworkspace`
- **Scheme:** `OpusFesta`
- **Archive path:** `/tmp/OpusFesta.xcarchive`
- **IPA path:** `/tmp/OpusFesta.ipa`
- **ExportOptions:** `apps/of_mobile/ios/ExportOptions.plist` (regenerated by the script
  after `expo prebuild --clean`)
- **Team ID:** `FWL2W5X58S`

## Troubleshooting

**Build number rejected by App Store Connect (already used)**
- The script bumps via `asc xcode version bump --type build`, which only increments the local Xcode value. If App Store Connect already has that build number, run `asc xcode version view --project-dir apps/of_mobile/ios` to inspect it, then `asc xcode version edit --build-number N` to set a higher one and re-run with `--skip-prebuild`.

**Stale archive: `--archive-path already exists`**
- The script passes `--overwrite` so the archive step replaces `/tmp/OpusFesta.xcarchive`. If you see this error, you're on an older copy of the script — add `--overwrite` to the `asc xcode archive` call.

**Export fails: `exportArchive Failed to Use Accounts` / "App Store Connect access for FWL2W5X58S is required"**
- The export step needs App Store Connect auth. The script supplies it by forwarding the API key to xcodebuild via `--xcodebuild-flag` (`-allowProvisioningUpdates` + `-authenticationKeyPath`/`-authenticationKeyID`/`-authenticationKeyIssuerID`). If you hit this, the key is missing or you're on an older script: confirm `~/.appstoreconnect/AuthKey_3UCMS5TJ6T.p8` exists (or set `ASC_KEY_PATH`), then re-run. The archive itself is reusable — re-running with `--skip-prebuild` skips straight back to export against `/tmp/OpusFesta.xcarchive`. No Apple ID needs to be signed into Xcode → Settings → Accounts.

**Export succeeds but command exits 1: `xcode export: context deadline exceeded`**
- This is only the `--wait` poll for build discovery timing out — the upload already succeeded (look for `** EXPORT SUCCEEDED **` / `Upload succeeded`, plus the benign per-framework `Upload Symbols Failed` warnings). The script sets `ASC_TIMEOUT=90s`; bump it higher if needed, or confirm the build landed with:
  ```bash
  asc builds list --app 6786090250 --limit 5 --output table
  ```
  Use App ID `6786090250` here — not any other app ID you might have cached from a different project or an older/generic copy of this skill.

**Provisioning profile errors**
- Run `eas credentials --platform ios` (from `apps/of_mobile`) to check certificate/profile validity, then re-run the full build (with prebuild).

**`asc` auth errors in CI**
- Use `--bypass-keychain` in the login command and set `ASC_API_KEY`, `ASC_KEY_ID`, and `ASC_ISSUER_ID` as environment variables instead.

**Archive takes too long**
- Derived data is cached at `~/Library/Developer/Xcode/DerivedData`. A clean build clears this; subsequent runs are faster.
