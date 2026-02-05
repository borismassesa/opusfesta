# The Festa

Tanzania's go-to wedding & events marketplace, empowering couples, families, and vendors with modern digital tools while honoring Swahili traditions.

## Vision

To be Tanzania's go-to wedding & events marketplace, empowering couples, families, and vendors with modern digital tools while honoring Swahili traditions.

## Mission

The Festa connects couples and families with trusted vendors, streamlines event planning, and enables secure mobile money transactions — all in Swahili and English.

## Git workflow

**Work on a branch, then merge into `main`.** Do not push directly to `main`.

1. Create a branch: `git checkout main && git pull && git checkout -b your-branch`
2. Commit and push the branch: `git push -u origin your-branch`
3. Merge into `main` via a Pull Request or after merging locally.

Before pushing, run: `npm run check:prepush`

See `.cursor/rules/git-branch-workflow.mdc` for the full workflow.

## Customer support stack

- **Backend:** `services/support` — Support/chatbot API.
- **Dashboard:** `apps/customersupport` — Support dashboard UI. See [docs/SUPPORT_SERVICES.md](docs/SUPPORT_SERVICES.md) for run instructions.
