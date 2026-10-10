# SmartStreet

AI-powered streetlight monitoring and predictive maintenance. Scores every streetlight's chance of failing in the next 30 days, rates it Healthy / Watch / High risk, and builds a prioritised maintenance queue, shown on a dashboard and map.

> **All data is synthetic.** Streetlights are generated around Indore for demonstration, with approximate coordinates. The model learns patterns built into the generator, so its accuracy says nothing about real-world performance.

```
Streetlight data -> feature processing -> Random Forest -> risk rating -> maintenance priority -> dashboard + map
```

## Run locally

Requires Python 3.10+ and Node 18+.

**1. Backend**
```bash
cd smartstreet
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
python ml/generate_data.py      # optional: regenerates the synthetic data (a copy is included)
python ml/train_model.py        # trains and saves the model (also happens automatically on first request)
cd backend && uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

**2. Frontend**
```bash
cd frontend
cp .env.example .env            # optional: add VITE_GOOGLE_MAPS_API_KEY
npm install
npm run dev
```
Open http://localhost:5173

## Map
With `VITE_GOOGLE_MAPS_API_KEY` set, the app uses Google Maps. With no key, or if Google rejects it, it falls back automatically to a Leaflet map on Carto/OpenStreetMap tiles, so the map always works.

## What each part does
| Page | Purpose |
|---|---|
| Dashboard | Live counts, map, and the "Fix first" list |
| Streetlights | Searchable, sortable table with a detail panel |
| Map | Filter by rating, click a pole for details |
| Predictions | Highest-risk working lights, plus a scenario tool |
| Maintenance | Prioritised queue. "Mark serviced" updates the data and re-scores the pole |
| Analytics | Condition by area, risk by age, model feature importance |

Dashboard numbers come from `GET /api/stats` and are never hardcoded.

## Rating rules
Failure probability: below 25% Healthy, 25-50% Watch, 50% and above High risk. A light reported failed is an Outage and ranks above everything else in the queue.

## Photo check (optional CV module)
`POST /api/vision/analyze` runs an OpenCV brightness check on an uploaded photo and says whether a lamp looks lit. It is a heuristic, not a trained detector. If OpenCV is missing, only this feature is disabled. `backend/app/services/vision.py` is the place to swap in YOLO later.

## Deploy
- **Backend (Render):** `render.yaml` is included. Set `CORS_ORIGINS` to your Vercel URL.
- **Frontend (Vercel):** root directory `frontend`, set `VITE_API_URL` to your Render URL. `vercel.json` handles page routing.
- Render's free tier resets files on restart, so "Mark serviced" changes will reset. Use a database for persistence.

## Using real data
Replace `backend/data/streetlights.json` with real records (same fields) and retrain `ml/train_model.py` on real failure logs. MongoDB is not wired in: `backend/app/database/repository.py` is the only file to replace.

## Layout
```
backend/app   FastAPI app (routes, services, database, models)
backend/data  streetlights.json (synthetic)
ml/           data generator, training, prediction, shared features
frontend/src  React app (pages, components, services, hooks, utils)
```

## Simulated IoT Sensor Monitor

SmartStreet includes a simulation-only IoT telemetry page at `/iot`. It generates synthetic current, voltage, lamp-output lux, and temperature readings for each streetlight. The simulator is for demos and does not connect to physical hardware or change the underlying streetlight records.

### IoT API endpoints

- `GET /api/iot/readings` — latest simulated sensor snapshot.
- `GET /api/iot/summary` — counts of simulated devices and detected faults.
- `POST /api/iot/simulate/tick` — generate the next simulated snapshot.

The demo flags a sensor fault when current is below `0.05 A` or lamp output is below `10 lux` while the lamp is commanded on. These are illustrative thresholds only; calibrate them against actual hardware before field use.

### Run locally

Terminal 1 (backend, from the repository root):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python ml/train_model.py
cd backend
uvicorn app.main:app --reload --port 8000
```

Terminal 2 (frontend, from the repository root):

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173/iot`. All readings are labelled as simulated. Existing dashboard, map, predictions, analytics, and maintenance features are retained.
