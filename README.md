# AetherShield Frontend

React + Vite frontend, now connected to the FastAPI backend with
org-scoped login (multi-tenant).

## Setup

1. Start the backend first (see its own README) — it must be running
   on http://127.0.0.1:8000 for login to work.
2. Then:

```bash
npm install
npm run dev
```

Open http://localhost:5173 — you'll land on the login page.

## Demo logins

| Email               | Password    | Organization       |
|---------------------|-------------|---------------------|
| admin@acme.com      | acme123     | Acme Corp           |
| admin@globex.com    | globex123   | Globex Industries   |

Click either demo account button on the login page to auto-fill the
credentials. Log in as one org, note the numbers, log out, log in as
the other — the dashboard, inventory, compliance, and copilot will all
show genuinely different data, since it's now pulled live from the
backend rather than a shared mock file.

## What changed from the mock-data version

- `src/data/mockData.js` is no longer used or imported anywhere —
  all data now comes from `src/api/client.js`, which calls the FastAPI
  backend and converts its snake_case JSON to the camelCase shape the
  components already expected, so page code barely changed.
- `src/context/AuthContext.jsx` — new. Handles login/logout, persists
  the session (token + org info) in `localStorage` so refreshing the
  page doesn't log you out.
- `src/context/AppStateContext.jsx` — rewritten. Instead of holding
  static state, it fetches everything fresh from the backend on login
  and after every mutating action (remediate, chaos trigger, policy
  toggle, copilot reply), so all pages stay in sync with the server.
- `src/pages/LoginPage.jsx` — new.
- Compliance Audits page now fetches real frameworks + failed controls
  per organization instead of a hardcoded table.
- AI Copilot's quick actions are now built from the logged-in org's
  actual current findings, so they never reference a resource that
  doesn't exist for that org.

## Project structure

```
src/
  api/client.js              <- all backend calls live here
  context/
    AuthContext.jsx          <- login/logout/session
    AppStateContext.jsx      <- org-scoped data, remediation, chaos actions
  components/
    Sidebar.jsx / TopBar.jsx / ChaosSimulator.jsx
  pages/
    LoginPage.jsx
    Dashboard.jsx / AssetInventory.jsx / ComplianceAudits.jsx
    PolicyRules.jsx / AICopilot.jsx
  styles/
    layout.css / pages.css
  index.css                  <- design tokens
```

## Notes

- Uses `HashRouter` so it works as a static build without server routing.
- If you deploy the backend somewhere other than localhost:8000, update
  `VITE_API_BASE_URL` in `.env`.
