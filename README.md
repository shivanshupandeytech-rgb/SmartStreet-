<div align="center">
  <h1>🌟 SmartStreet 🌟</h1>
  <p><strong>AI-Powered Streetlight Monitoring and Predictive Maintenance</strong></p>

  [![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br/>

> **⚠️ Note:** All data is **synthetic**. Streetlights are generated around the city for demonstration purposes with approximate coordinates. The AI model learns patterns built into the generator, so its accuracy says nothing about real-world performance.

SmartStreet scores every streetlight's chance of failing in the next 30 days, rates it as `Healthy`, `Watch`, or `High Risk`, and dynamically builds a prioritized maintenance queue shown on a beautiful real-time dashboard and interactive map.

---

## ✨ Key Features

| Page | Purpose |
|---|---|
| 📊 **Dashboard** | Live counts, real-time map, and the "Fix First" priority queue. |
| 💡 **Streetlights** | Searchable, sortable datatable with an expandable detail panel. |
| 🗺️ **Interactive Map** | Filter by rating, click a pole for detailed analytics. (Supports Google Maps & Leaflet). |
| 🔮 **Predictions** | View highest-risk working lights and test assumptions with a What-If scenario tool. |
| 🛠️ **Maintenance** | Prioritized queue. "Mark serviced" automatically updates the data and re-scores the pole. |
| 📈 **Analytics** | Deep-dive condition by area, risk by age, and Random Forest feature importance. |
| 📡 **IoT Monitor** | Live simulated telemetry for voltage, current, temperature, and lamp lux with an interactive Control Panel. |

---

## 🚀 Getting Started

Requires **Python 3.10+** and **Node 18+**.

### 1. Backend Setup
```bash
# Clone and enter the directory
cd smartstreet

# Setup virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# (Optional) Regenerate synthetic data
python ml/generate_data.py      

# Train and save the Random Forest model
python ml/train_model.py        

# Start FastAPI server
cd backend && uvicorn app.main:app --reload --port 8000
```
> **API Docs:** http://localhost:8000/docs

### 2. Frontend Setup
```bash
cd frontend

# Set up environment variables
cp .env.example .env            # Add VITE_GOOGLE_MAPS_API_KEY if available

# Install packages and start Vite dev server
npm install
npm run dev
```
> **Open the App:** http://localhost:5173

---

## 🗺️ Mapping System
With `VITE_GOOGLE_MAPS_API_KEY` set, the app uses Google Maps. If omitted or rejected, it gracefully falls back to a **Leaflet** map on Carto/OpenStreetMap tiles—ensuring the map always works out-of-the-box.

---

## 🧠 AI Rating & IoT Simulation

### Machine Learning Rules
- **Healthy:** Failure probability < 25%
- **Watch:** Failure probability 25% - 50%
- **High Risk:** Failure probability > 50%
- *Any light actively reported as failed is instantly escalated to an **Outage** and prioritized.*

### Simulated IoT Sensor Monitor
The app includes a dedicated simulation page at `/iot` generating synthetic readings (current, voltage, lux, temperature). 

- **Control Panel:** Trigger specific fault scenarios (e.g., Abnormal Voltage, Overheating, Lamp Failure).
- **Fault Detection:** Automatically flags issues based on configurable thresholds.
- **Deduplicated Alerts:** Real-time logging of critical events with severity ratings.

---

## 📁 Repository Layout
```text
📦 smartstreet
 ┣ 📂 backend/app   # FastAPI app (routes, services, DB, models)
 ┣ 📂 backend/data  # streetlights.json (synthetic records)
 ┣ 📂 ml/           # Data generator, training, prediction, RF features
 ┗ 📂 frontend/src  # React app (glassmorphism UI, components, hooks, api)
```

---

<div align="center">
  <i>Built with ❤️ for a Smarter Future.</i>
</div>
