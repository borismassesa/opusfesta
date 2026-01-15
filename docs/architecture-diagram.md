# Architecture Diagram (Mermaid)

Paste this into any Mermaid renderer:

```mermaid
flowchart LR
  %% Clients
  subgraph Clients
    Web[Website (apps/website)]
    Admin[Admin Portal (apps/admin)]
    Vendor[Vendor Portal (apps/vendor-portal)]
  end

  %% Backend Services
  subgraph Services
    API[GraphQL API (services/api)]
    Auth[Auth Service (services/auth)]
    Payments[Payments Service (services/payments)]
    Webhooks[Webhooks Service (services/webhooks)]
  end

  %% Data Layer
  subgraph Data
    DB[(Postgres / Prisma schema\npackages/db)]
    Supabase[Supabase (auth + data)]
  end

  %% External Integrations
  subgraph External
    Cognito[AWS Cognito]
    SMS[SMS Provider]
    MobileMoney[Mobile Money / Payment Provider]
    WebhookSources[3rd-party Webhook Sources]
  end

  %% Client -> Services
  Web --> API
  Admin --> API
  Vendor --> API

  %% Auth flows
  Web --> Auth
  Admin --> Auth
  Vendor --> Auth
  Auth --> Cognito
  Auth --> SMS

  %% Payments
  Web --> Payments
  Vendor --> Payments
  Payments --> MobileMoney
  Payments --> API

  %% Webhooks
  WebhookSources --> Webhooks
  Webhooks --> API
  Webhooks --> Payments

  %% Data access
  API --> DB
  API --> Supabase
  Admin --> Supabase
  Vendor --> Supabase
  Web --> Supabase
```
