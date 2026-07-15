---
name: release
description: "Use when the user says '/release', 'bump the version', 'cut a release', or 'what version should this be' for the mobile app. Catches up apps/of_mobile/app.json's expo.version to reflect every commit shipped since the last version bump, then commits the bump on its own."
---

# Mobile Release Version Bump

Scoped to `apps/of_mobile`. This is the catch-up tool: it looks at the whole range of
commits since the version field last changed, not just one commit. For bumping as
part of a single commit you're already making, use the `git-commit` skill's inline
version-bump step instead — this skill is for when the version has drifted behind
several unbumped commits (the common case, since bumping is easy to forget).

## Step 1 — Find the baseline

Find the last commit that actually changed the version field:

```bash
git log -S'"version"' --oneline -- apps/of_mobile/app.json
```

Take the most recent hit as the baseline commit. If there is no hit, fall back to the
commit that introduced `apps/of_mobile/app.json`:

```bash
git log --diff-filter=A --oneline -- apps/of_mobile/app.json | tail -1
```

## Step 2 — Classify every commit since the baseline

```bash
git log --oneline <baseline-commit>..HEAD -- apps/of_mobile
```

Apply the same rules as `git-commit`'s version bump step:

| Signal | Level |
|---|---|
| Breaking change, removed user-facing feature, auth model change (look for `BREAKING` in body, or judgment call from the diff) | major |
| `feat:` — new user-facing feature, screen, or additive integration | minor |
| `fix:` — user-facing bug fix | patch |
| `chore:` / `refactor:` / `docs:` / `test:` / `move:` / `polish:`-only, with no visible behavior change | ignore |

Take the **highest** level triggered by any commit in the range — do not add levels
together, and do not bump once per commit. Ignore commits outside `apps/of_mobile`.

If nothing in range is a user-facing `feat`/`fix`, report "no bump needed" and stop.

## Step 3 — State the decision before writing anything

```
Version bump decision: <major|minor|patch> — <reason>
Commits driving it: <short list>
<old-version> → <new-version>
```

This is a visible, shared version number — confirm with the user before committing if
the range is large or the call is ambiguous (e.g. many commits, first-ever bump, or
unclear whether something already shipped).

## Step 4 — Apply the bump

```bash
# From repo root
node -e "const fs=require('fs');const p='apps/of_mobile/app.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.expo.version='NEW_VERSION';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"
```

## Step 5 — Commit the bump on its own

Stage only `apps/of_mobile/app.json`. Never `git add -A`. No attribution footer
(`Co-Authored-By`, "Generated with Claude Code") — this project never adds one.

```bash
git commit -m "$(cat <<'EOF'
chore(mobile): bump version to NEW_VERSION
EOF
)"
```

## Step 6 — Suggest the follow-up

After the bump lands, offer to run `app-store-changelog` for the same commit range to
draft App Store notes, TestFlight checklist, and the admin release brief.

## Notes

- `eas.json` has `appVersionSource: "remote"` and `autoIncrement: true` for the
  **build number** — EAS manages that separately. This skill only touches the
  semver `expo.version` field, which EAS does not auto-manage.
- No git tags are used in this repo for releases; don't introduce tagging unless asked.
