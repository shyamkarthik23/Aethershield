# AetherShield Backend

A FastAPI backend powering **AetherShield**, a multi-tenant cloud security posture management (CSPM) dashboard. Simulates real-world cloud security monitoring across AWS, Azure, and GCP — with live threat simulation, compliance scoring, and an AI-powered remediation copilot.

## Tech Stack

- **Framework:** FastAPI
- **Database:** MySQL via SQLAlchemy ORM
- **AI:** Groq API (`openai/gpt-oss-120b`) for the natural-language copilot
- **Auth:** Custom signed-token authentication (HMAC-SHA256)

## Setup

### 1. Install dependencies
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set up MySQL
Create a database named `aethershield` (via MySQL Workbench or CLI):
```sql
CREATE DATABASE aethershield;
```

### 3. Configure environment variables
Create a `.env` file in this folder:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@127.0.0.1:3306/aethershield
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Seed the database
```bash
python seed_db.py
```
This creates all tables and populates them with two demo organizations (Acme Corp, Globex Industries), their assets, policy rules, compliance frameworks, and chaos event scenarios.

### 5. Run the server
```bash
uvicorn main:app --reload
```
Runs on `http://127.0.0.1:8000` — visit `/docs` for the interactive Swagger UI.

Start this **before** the frontend, since the login page calls it directly.

## Demo Logins

| Email               | Password    | Organization       |
|---------------------|-------------|---------------------|
| admin@acme.com      | acme123     | Acme Corp           |
| admin@globex.com    | globex123   | Globex Industries   |

New organizations can also self-register via `POST /api/auth/signup`.

## Architecture

Every table (`assets`, `policy_rules`, `chaos_events`, `feed`, etc.) is scoped by `org_id`, ensuring complete tenant isolation — Acme Corp and Globex Industries never see each other's data, even though both call the same API endpoints. The `org_id` is read exclusively from a signed auth token, never trusted from client input, preventing cross-tenant data access.

### Routers

| Router | Responsibility |
|---|---|
| `auth.py` | Login, signup, token issuing/verification |
| `assets.py` | Cloud resource inventory (AWS/Azure/GCP) |
| `chaos.py` | Live threat simulation — trigger/reset attack scenarios |
| `compliance.py` | Framework scoring (CIS, SOC2, HIPAA, GDPR) |
| `policy_rules.py` | Security policy toggles and auto-remediation flags |
| `remediation.py` | Manually fix a flagged finding |
| `copilot.py` | Groq-powered AI assistant for natural-language remediation |
| `dashboard.py` | Aggregated security score and summary stats |
| `feed.py` | Live activity/threat feed |

## Verified Behavior (tested end-to-end)

- Acme and Globex see genuinely different assets under the same `/api/assets` call
- Remediating a finding raises the security score immediately, persisted in MySQL
- Triggering a chaos event drops the score immediately; resetting restores original state
- New orgs can sign up and get fully isolated, empty starter data
- Copilot resolves exact-name remediation commands locally, and routes general questions to a live Groq LLM call with org-scoped asset context

## Known Limitations (by design, for a demo project)

- `SECRET_KEY` for token signing is hardcoded — a production system would store this in a secrets manager with rotation
- Passwords are stored in plain text rather than hashed, to keep the demo simple and dependency-free
- No live connection to real AWS/Azure/GCP accounts — asset data is realistic seed data, not pulled from actual cloud provider APIs. A production version would connect via a read-only IAM role and poll each provider's native asset inventory API (AWS Config, Azure Resource Graph, GCP Cloud Asset Inventory)

## Extending

- `rule_engine.py`'s `evaluate_assets()` isn't wired to any endpoint yet — add `GET /api/rules/evaluate` to demo it standalone
- New orgs currently start with zero assets; a `/api/onboarding/connect` endpoint could auto-seed starter data on signup for demo polish
