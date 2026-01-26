# Customer support services

The customer support chatbot and dashboard system lives in:

- **Backend:** `services/support` — Support/chatbot API (conversations, future agents and workers).
- **Dashboard:** `apps/customersupport` — Next.js app for the support dashboard (agents, conversations, etc.).

Run the support service:

```bash
cd services/support && npm install && npm run dev
```

Run the customer support dashboard **from the repo root** (so the app uses the workspace’s Next.js, not a global install):

```bash
npm run dev:customersupport
# or
npm run dev --workspace=@opusfesta/customersupport
```

Avoid running `npm run dev` from inside `apps/customersupport` unless you’ve confirmed `next` comes from the workspace (otherwise you can get 500s from module resolution mismatch).

The support API listens on port 3003 by default; the dashboard runs on port 3004.
