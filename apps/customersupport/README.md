# Customer Support Dashboard

Next.js app for the support chatbot and agent UI.

## Setup and run

**Install from the repo root** so the workspace is linked correctly:

```bash
cd /Users/boris/thefesta   # monorepo root
npm install
```

Then start the app in one of these ways:

- **From repo root (recommended):**
  ```bash
  npm run dev:customersupport
  ```
- **From this folder:**
  ```bash
  cd apps/customersupport
  npm run dev
  ```
  The `dev` script uses the same Next.js as the admin app so you avoid version mismatches with a global install.

Runs at [http://localhost:3004](http://localhost:3004).

If you see “workspaces @opusfesta/customersupport in filter set, but no workspace folder present”, you ran `npm install` from inside `apps/customersupport`. Run it from the monorepo root instead.
