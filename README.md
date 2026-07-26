# Baadh Mitra — Flood Relay Coordinator

A portfolio project built for the **Google Software Application Development
Apprenticeship (March 2027 start, India)**. Not affiliated with or endorsed by
Google.

## The problem, in one paragraph

Google's Flood Hub forecasts river levels up to seven days ahead across India,
but Google's own account of the system says that in areas without direct
smartphone reach, the actual warning still depends on a village leader or
volunteer going door to door with no dedicated tooling. The forecasting
problem is solved; the "last hundred metres" — deciding *which* households to
reach first — is not. Baadh Mitra is a small coordinator tool for that last
hundred metres: it turns a flood alert into an ordered, explainable checklist
that puts the most vulnerable households (elderly-only, no resident
smartphone, low-lying, limited mobility) at the top.

## Architecture

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────────┐
│   Frontend (Vercel)  │ ───────────────────────▶ │   Backend (Render)       │
│   React + Vite +      │ ◀─────────────────────── │   FastAPI + SQLAlchemy   │
│   Tailwind            │                          │   + Postgres             │
└─────────────────────┘                          └──────────────────────────┘
     coordinator dashboard                          districts / households /
     (household roster, alert                        alerts / prioritization /
     banner, ranked checklist)                       checklist state
```

- **Backend**: `backend/` — FastAPI app, SQLAlchemy models, a small
  prioritization engine (`app/prioritization.py`), and a simulated flood-gauge
  feed (`app/flood_feed.py`) standing in for a real Flood Hub integration (see
  *Honest limitations* below).
- **Frontend**: `frontend/` — a single-page React dashboard: pick a district,
  see the active alert (with a river-gauge severity indicator), manage the
  household roster, and work through the ranked checklist in real time.

## Running it locally

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env                                 # defaults are fine locally
python -m app.seed                                    # creates SQLite db + demo data
uvicorn app.main:app --reload --port 8000
```
Visit `http://localhost:8000/docs` for the interactive API docs.

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000
npm run dev
```
Visit `http://localhost:5173`.

## Deploying: Render (backend) + Vercel (frontend)

Push this project to a GitHub repo first (Render and Vercel both deploy from
a git repo, not a local folder):
```bash
cd baadh-mitra
git init
git add .
git commit -m "Baadh Mitra: flood-relay coordinator MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/baadh-mitra.git
git push -u origin main
```

### 1. Backend → Render

1. Go to the Render dashboard → **New +** → **Blueprint**.
2. Connect your GitHub account and select the `baadh-mitra` repo. Render will
   read `backend/render.yaml` automatically and propose:
   - a free Postgres database (`baadh-mitra-db`)
   - a free web service (`baadh-mitra-api`) with `DATABASE_URL` wired to that
     database automatically
3. Click **Apply**. First deploy takes a few minutes (installs deps, runs the
   seed script via `preDeployCommand`, starts uvicorn).
4. Once live, copy the service URL Render gives you, e.g.
   `https://baadh-mitra-api.onrender.com`. Confirm it works:
   `curl https://baadh-mitra-api.onrender.com/health` → `{"status":"healthy"}`.

   > Render's free tier spins the service down after inactivity, so the first
   > request after a quiet period can take 30-60s to wake up — worth
   > mentioning if you demo this live, not a bug.

   > **Python version:** `render.yaml` explicitly pins `PYTHON_VERSION=3.12.3`.
   > Render changed the default for newly-created services to 3.14.3 in
   > February 2026, but this project's pinned dependencies (`pydantic==2.9.2`,
   > `psycopg2-binary==2.9.9`) were tested against 3.12.3 and aren't guaranteed
   > to have prebuilt wheels for 3.14 yet. If you upgrade the dependencies
   > later, upgrade `PYTHON_VERSION` deliberately alongside them rather than
   > leaving it to Render's default.

### 2. Frontend → Vercel

1. Go to the Vercel dashboard → **Add New** → **Project** → import the same
   GitHub repo.
2. When asked for the **Root Directory**, set it to `frontend`. Vercel will
   auto-detect Vite (confirmed by `frontend/vercel.json`).
3. Add an environment variable: `VITE_API_URL` = your Render URL from step 1
   (e.g. `https://baadh-mitra-api.onrender.com`), no trailing slash.
4. Deploy. Vercel gives you a URL like `https://baadh-mitra.vercel.app`.

### 3. Connect them (CORS)

The backend only accepts requests from origins listed in its `ALLOWED_ORIGINS`
env var, which currently only allows `localhost`. Go back to the Render
service → **Environment** → edit `ALLOWED_ORIGINS` to:
```
https://baadh-mitra.vercel.app,http://localhost:5173
```
(use your actual Vercel URL) and save — Render will redeploy automatically.
Reload the Vercel site; it should now load districts and let you simulate
alerts end to end.

## How this maps to the role's stated requirements

| Listing phrase | Where it shows up here |
|---|---|
| "Programming experience in at least one coding language" | Python (FastAPI, SQLAlchemy) + JavaScript/React, end to end |
| "Ability to learn programming language based on project requirements" | Two different stacks, one project, deliberately |
| "Navigate multiple ambiguous tasks and competing priorities" | The prioritization model *is* the ambiguity: no single "correct" scoring formula exists, so `app/prioritization.py` documents the reasoning behind each weight |
| "Testing & integration" | Every backend endpoint was tested end-to-end (see build log below) before the frontend was wired up |
| "Real-world application of learning" | Grounded in Google's own public description of Flood Hub's last-mile gap, not a generic CRUD demo |

## Honest limitations — what I'd do next

Being upfront about scope is itself part of what this listing screens for, so:

- **The flood feed is simulated**, not a live Flood Hub integration — there's
  no public, self-serve Flood Hub API for arbitrary rivers. `app/flood_feed.py`
  is written so a real feed could be dropped in behind the same function
  signature without touching the rest of the app.
- **No offline/peer-to-peer relay yet.** The original idea includes
  Bluetooth/Wi-Fi Direct propagation between volunteer phones for when
  connectivity fails during the flood itself — the exact moment it's needed
  most. That's a native-Android feature (Android's Nearby Connections API) and
  is out of scope for this web MVP; it's the natural "phase 2."
- **No authentication.** Anyone with the URL can edit any district's roster.
  Fine for a portfolio demo, not fine for real deployment — next step would be
  simple coordinator accounts per district.
- **Render's free Postgres and free web service both have real limits**
  (the database expires after a period of inactivity/free-tier lifetime, and
  the web service sleeps when idle) — worth knowing before treating this as
  anything beyond a demo.

## Project structure

```
baadh-mitra/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app + CORS
│   │   ├── models.py          SQLAlchemy models
│   │   ├── schemas.py         Pydantic request/response schemas
│   │   ├── database.py        engine/session (SQLite locally, Postgres in prod)
│   │   ├── prioritization.py  the checklist-ranking logic
│   │   ├── flood_feed.py      simulated Flood Hub-style alert generator
│   │   ├── seed.py            demo data
│   │   └── routers/           districts / households / alerts / checklist
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   └── components/         RiverGauge, AlertBanner, HouseholdPanel, ChecklistPanel, DistrictSwitcher
    ├── package.json
    ├── vercel.json
    └── .env.example
```
