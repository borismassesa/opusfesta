---
name: testflight-local
description: "Runs a local TestFlight build and upload via the `asc` CLI — bypassing the EAS queue for faster iteration. Use when the user runs '/testflight-local', asks to build/push a mobile app to TestFlight locally, or wants a quick TestFlight drop after a native or JS change. Covers both iOS apps in this monorepo: OpusFesta (apps/of_mobile) and OpusPass (apps/opus_pass_mobile)."
version: 1.0.0
---

# testflight-local

Runs a local TestFlight build and upload via `scripts/testflight-local.sh`, bypassing the EAS
queue for faster iteration.

## Pick the app first

This repo ships **two** iOS apps from one script. **The script defaults to `of_mobile`**, so an
unqualified run silently builds and ships OpusFesta. Always pass `--app`, and confirm with the
user which app they mean — never infer it from the working directory alone.

| App | `--app` | Directory | Scheme | Bundle ID | ASC App ID |
|-----|---------|-----------|--------|-----------|------------|
| OpusFesta | `of_mobile` | `apps/of_mobile` | `OpusFesta` | `com.opusfesta.mobile` | `6786090250` |
| OpusPass | `opus_pass_mobile` | `apps/opus_pass_mobile` | `OpusPass` | `com.opusfesta.opuspass` | `6790724087` |

**Do not use App ID `6759113274`.** That's "Beeli", a different app under the same ASC
team/credential. The shared credential name (`"Beeli"`) refers to the *account*, not the app
being built. Everything else derives from `--app`: workspace, archive path, ExportOptions.

## Two version numbers — know which is which

| Number | Where it lives | Who sets it |
|---|---|---|
| Marketing version (`0.1.0`) | `app.json` → `expo.version` → `CFBundleShortVersionString` | The **`git-commit`** convention, bumped inline on each user-facing `feat`/`fix`. **This script never touches it.** |
| Build number (`2`) | `CFBundleVersion` in the Xcode project | **This script**, and nothing else. |

The script ships whatever version `app.json` says — it does not judge or bump it. Two consequences
it now enforces automatically, both of which used to fail silently:

- **The marketing version only reaches the binary through `expo prebuild`**, which regenerates
  `Info.plist`. So if `app.json` has been bumped since `ios/` was last generated, `--skip-prebuild`
  would upload the **old** version string. The script compares the two and bails, telling you to
  run a full build.
- **The build number is derived from App Store Connect, not from the local counter.**
  `prebuild --clean` regenerates the project and resets `CFBundleVersion` (neither app sets
  `expo.ios.buildNumber`), so the old `asc xcode version bump --type build` restarted at 1 and
  collided with a build number Apple already had. The script now asks ASC for the highest build of
  the current marketing version and sets one above it. Apple only requires uniqueness *within* a
  version, so a fresh version correctly starts at build 1.

## Prerequisites Check

### 1. Check asc is installed

```bash
if ! command -v asc &>/dev/null; then
  echo "asc CLI not found. Install with: brew install asc"
  exit 1
fi
```

### 2. Check asc auth is configured

```bash
asc auth status 2>/dev/null | grep -q '"name":"Beeli"'
```

Credentials live in the system keychain (`asc auth status` reports `storageBackend`). Both apps
sit under team `FWL2W5X58S`, so one login covers the whole monorepo. If not authenticated:

```bash
asc auth login \
  --name "Beeli" \
  --key-id 3UCMS5TJ6T \
  --issuer-id 5788ad38-186e-49cb-8813-62a8cb2f3fa3 \
  --private-key ~/.appstoreconnect/AuthKey_3UCMS5TJ6T.p8 \
  --network
```

The `.p8` private key is the real secret and is **not** in this repo — it must exist at
`~/.appstoreconnect/` on the build machine. The key ID and issuer ID above are identifiers.

### 3. Confirm the script exists

The script lives at the **repo root** `scripts/`, not under `apps/<app>/`. Run it from the repo
root or by absolute path — it resolves app paths relative to its own location.

```bash
if [[ ! -f "./scripts/testflight-local.sh" ]]; then
  echo "Script not found. Run from the repo root (opusfesta/), not apps/<app>/."
  exit 1
fi
```

## Running the Build

Ask **two** questions before starting — one AskUserQuestion call with both:

1. **Which app?** OpusFesta (`of_mobile`) or OpusPass (`opus_pass_mobile`).
2. **Have the native iOS files changed** (new packages, `app.json`/plugin/config updates)?
   - **Yes** → full build (prebuild + pod install)
   - **No** → `--skip-prebuild` (faster; JS/asset changes only)

```bash
./scripts/testflight-local.sh --app <app> [--skip-prebuild]
```

**Run it in the background** (`run_in_background: true`) and tee the output to a log — archive
plus upload takes 10–20 minutes, which exceeds the foreground Bash timeout. Read the log once
early to catch fast failures (EAS auth, a rejected build number) before committing to the long
archive.

## Phase-by-Phase Explanation

Narrate each phase as it runs so the user knows what's happening:

| Phase | What it does | Typical time |
|-------|-------------|--------------|
| `eas env:pull production` | Pulls `EXPO_PUBLIC_*` production env vars into `apps/<app>/.env.production` (removed on exit, so live values don't linger on disk) | ~5s |
| `expo prebuild --clean` | Regenerates the native iOS project from Expo config | 1–2 min |
| `pod install` | Syncs CocoaPods dependencies | 1–3 min |
| Write `ExportOptions.plist` | Regenerated on **every** run — it's gitignored and wiped by `prebuild --clean` | instant |
| Version guard | On `--skip-prebuild`, bails if `app.json`'s version has moved past the generated `Info.plist` (see below) | instant |
| Resolve build number | Queries App Store Connect for the highest build of this marketing version and sets one above it | ~3s |
| `asc xcode archive --overwrite` | Compiles and archives in Release (`--overwrite` replaces a stale `/tmp/<Scheme>.xcarchive`) | 5–15 min |
| `asc xcode export … --wait` | Exports a signed IPA and uploads it straight to TestFlight (`destination: upload`), then polls until the build appears in App Store Connect | 3–10 min |
| Tag the release (git) | Annotated, app-prefixed tag on the shipped commit — always, never skipped | ~5s |

Signing is **automatic** (`signingStyle: automatic`, team `FWL2W5X58S` in
`apps/<app>/ios/ExportOptions.plist`). Both the archive and export steps forward the App Store
Connect **API key** to `xcodebuild` (`-allowProvisioningUpdates` +
`-authenticationKeyPath/-authenticationKeyID/-authenticationKeyIssuerID`, set in the script from
`ASC_KEY_PATH`/`ASC_KEY_ID`/`ASC_ISSUER_ID`). That authenticates the upload **and** lets
xcodebuild mint a distribution cert + App Store profile on the fly and re-sign at export — so
**no Apple Distribution cert or Apple ID needs to be present in Xcode**. This matters here
specifically because neither app's `app.json` sets `ios.appleTeamId`, so `expo prebuild`
regenerates the Xcode project with no `DEVELOPMENT_TEAM`/provisioning style — the archive step
needs the same auth-key flags as export for that reason.

Benign `Upload Symbols Failed` warnings for `hermes.framework`, `React.framework`, and
`ReactNativeDependencies.framework` are expected — those prebuilt frameworks ship no dSYMs and
the upload still succeeds.

## Verify Before Claiming Success

The script can exit 0 on the strength of the upload alone. Confirm both:

```bash
grep -E "EXPORT SUCCEEDED|Upload succeeded" <log>
asc builds list --app <APP_ID> --limit 3 --output table
```

App Store Connect takes a few minutes to ingest an upload, so the build may not appear in the
list immediately. That lag is **not** a failure — say so plainly rather than reporting a problem.
Re-check until `Processing` reads `VALID`.

## Tag the Release (always)

**Every successful TestFlight upload gets a tag.** This is the release record for this repo —
tagging happens here, at the upload — not at the `expo.version` bump, which rides along inside
ordinary feature commits and ships nothing on its own.
Do not skip it, and do not ask whether to tag; only ask before *pushing* it.

Tag only after `** EXPORT SUCCEEDED **` / `Upload succeeded` — never on a failed or
still-running build.

1. **Get the version and build number.** The archive step prints a JSON line right after
   `** ARCHIVE SUCCEEDED **`:

   ```
   {"archive_path":"/tmp/OpusPass.xcarchive","bundle_id":"...","version":"0.1.0","build_number":"2",...}
   ```

   If that line isn't in the captured output, fall back to
   `asc xcode version view --project-dir apps/<app>/ios`.

2. **Check the working tree first.** A tag claims this commit contains the shipped code. If the
   build included uncommitted or untracked files, tagging HEAD points the tag at a tree that never
   shipped. Surface that and offer to commit first — do not tag blindly.

3. **Create an annotated, app-prefixed tag:**

   ```bash
   git tag -a "<app>-v<version>-build<build>" -m "<App> TestFlight build <build> (<version>)"
   ```

   Examples: `opuspass-v0.1.0-build2`, `of_mobile-v1.9.0-build3`.

   The **app prefix is required** — both apps share one tag namespace and version independently,
   so a bare `v<version>` wouldn't say which app it belongs to. Version **and** build number are
   both required, since one marketing version ships as several TestFlight builds. Run `git tag -l`
   first to avoid collisions. (Historical note: `v1.8.0-build2` predates the second app and is
   of_mobile; it's the only unprefixed tag.)

4. **Create the tag locally, then ask before pushing.** Pushing is shared and visible, and a
   pushed tag on a broken build is awkward to retract. Report the tag you created and wait.

   ```bash
   git push origin "<app>-v<version>-build<build>"
   ```

## Troubleshooting

**`--skip-prebuild` fails on a fresh clone**
- `apps/<app>/ios/` is gitignored (it's Expo prebuild output), so a fresh clone has no native
  project at all. The first build after cloning must be a **full** build, without `--skip-prebuild`.

**`ExportOptions.plist` not found (on `--skip-prebuild`)**
- The script writes this file on every run, outside the prebuild branch. If you hit this, you're
  on an older copy that only wrote it after a prebuild — move the `cat > "$EXPORT_OPTIONS"`
  heredoc out of the `if [[ "$SKIP_PREBUILD" == false ]]` block.

**Build number rejected by App Store Connect (already used)**
- `asc xcode version bump` only increments the local Xcode value. If ASC already has that build
  number, run `asc xcode version view --project-dir apps/<app>/ios`, then
  `asc xcode version edit --build-number N` to set a higher one, and re-run with `--skip-prebuild`.

**Stale archive: `--archive-path already exists`**
- The script passes `--overwrite` so the archive step replaces `/tmp/<Scheme>.xcarchive`. If you
  see this error, you're on an older copy of the script — add `--overwrite` to the
  `asc xcode archive` call.

**Export fails: `exportArchive Failed to Use Accounts` / "App Store Connect access for FWL2W5X58S is required"**
- The export step needs ASC auth via the forwarded API key. Confirm
  `~/.appstoreconnect/AuthKey_3UCMS5TJ6T.p8` exists (or set `ASC_KEY_PATH`), then re-run. The
  archive itself is reusable — re-running with `--skip-prebuild` goes straight back to export
  against the existing `/tmp/<Scheme>.xcarchive`. No Apple ID needs to be signed into Xcode.

**Export succeeds but command exits 1: `xcode export: context deadline exceeded`**
- Only the `--wait` poll for build discovery timed out; the upload already succeeded (look for
  `** EXPORT SUCCEEDED **` / `Upload succeeded`). The script sets `ASC_TIMEOUT=90s`; bump it, or
  confirm the build landed with `asc builds list --app <APP_ID> --limit 5 --output table`.

**Provisioning profile errors**
- Run `eas credentials --platform ios` (from `apps/<app>`) to check certificate/profile validity,
  then re-run the full build (with prebuild).

**`asc` auth errors in CI**
- Use `--bypass-keychain` in the login command and set `ASC_API_KEY`, `ASC_KEY_ID`, and
  `ASC_ISSUER_ID` as environment variables instead.

**Archive takes too long**
- Derived data is cached at `~/Library/Developer/Xcode/DerivedData`. A clean build clears this;
  subsequent runs are faster.

## Adding a Third App

Add a case to the `case "$APP" in` block in `scripts/testflight-local.sh`:

```bash
new_app) SCHEME="NewApp"; APP_ID="<asc-app-id>" ;;
```

The scheme name must match `expo.name` in that app's `app.json`, since `expo prebuild` generates
the Xcode workspace from it. Re-authenticate `asc` only if the app belongs to a different Apple
account. Then add a row to the app table above.
