# Healthcare Appointment Intelligence System (HAI)

> An enterprise clinical operations and predictive analytics platform for hospitals and medical clinics, powered by machine learning and built with FastAPI + React.

HAI transforms raw appointment and operational data into **real-time ML predictions and actionable scheduling risk scores**, enabling healthcare staff to overbook intelligently, optimize queue routing, reallocate medical staff, and reduce patient wait times.

---

## Table of Contents

- [Core Problems Solved](#core-problems-solved)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [Machine Learning Models](#machine-learning-models)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Patients](#patients)
  - [Appointments](#appointments)
  - [Doctors](#doctors)
  - [Clinics](#clinics)
  - [Predictions](#predictions)
  - [Analytics](#analytics)
- [Role-Based Access Control](#role-based-access-control)
- [Frontend Pages](#frontend-pages)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Core Problems Solved

| Problem | Solution |
|---|---|
| **Patient No-Shows** | XGBoost classifier predicts no-show probability per appointment |
| **Excessive Queue Wait Times** | Scikit-Learn regressor predicts expected waiting time in minutes |
| **Suboptimal Clinic Utilization** | Tracks and compares capacity loading across multiple facilities |
| **Reactive Management** | Composite scheduling risk score combining all factors for early warning |

---

## Tech Stack

### Backend
| Component | Technology |
|---|---|
| Framework | FastAPI 0.110.0 (Python 3.12+) |
| ASGI Server | Uvicorn 0.27.0 |
| Database | MongoDB Atlas (cloud-hosted) |
| DB Driver | Motor 3.7.1 (async MongoDB) |
| Authentication | JWT (python-jose, HS256) + Bcrypt |
| Validation | Pydantic v2 |
| ML Models | XGBoost 3.4.1, Scikit-Learn 1.8.0, NumPy, Pandas, Joblib |
| Package Manager | Poetry |

### Frontend
| Component | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5.4.8 |
| Design System | IBM Carbon-inspired |
| Styling | Tailwind CSS 3.4.13 |
| Charts | Recharts 2.12.7 |
| Routing | React Router DOM 6.26.2 |
| HTTP Client | Axios 1.7.7 |
| Icons | Lucide React |

---

## Project Structure

```
Healthcare Appointment Intelligence System/
|
|-- api/index.py                         # Vercel serverless entry point
|-- scripts/
|   |-- import_data.py                   # Database seeding (CSV -> MongoDB)
|
|-- backend/
|   |-- app/
|   |   |-- main.py                      # FastAPI app factory
|   |   |-- core/
|   |   |   |-- config.py                # Settings & env config
|   |   |   |-- security.py              # JWT, bcrypt, RBAC
|   |   |-- db/
|   |   |   |-- mongodb.py              # Motor async connection
|   |   |-- models/                      # Pydantic domain models
|   |   |   |-- appointment.py, patient.py, doctor.py,
|   |   |   |-- clinic.py, user.py, prediction.py
|   |   |-- schemas/                     # Request/Response schemas
|   |   |   |-- auth.py, appointment.py, patient.py, prediction.py
|   |   |-- routes/                      # API route handlers
|   |   |   |-- auth.py, users.py, patients.py, appointments.py,
|   |   |   |-- doctors.py, clinics.py, predictions.py, analytics.py
|   |   |-- services/                    # Business logic layer
|   |   |   |-- ml_service.py            # Model loader (singleton)
|   |   |   |-- no_show_service.py       # No-show prediction
|   |   |   |-- waiting_time_service.py  # Wait time prediction
|   |   |   |-- scheduling_risk_service.py # Risk scoring
|   |   |   |-- prediction_service.py    # Full prediction orchestration
|   |   |   |-- appointment_service.py   # Appointment CRUD
|   |   |   |-- patient_service.py       # Patient CRUD
|   |   |   |-- doctor_service.py        # Doctor CRUD
|   |   |   |-- clinic_service.py        # Clinic CRUD
|   |   |   |-- auth_service.py          # Auth operations
|   |   |   |-- analytics_service.py     # Dashboard & chart analytics
|   |   |   |-- utilization_service.py   # Clinic utilization
|   |   |-- utils/
|   |   |   |-- responses.py             # Standardized JSON responses
|   |   |-- ml/                          # Trained model .pkl files
|
|-- frontend/
|   |-- src/
|   |   |-- pages/                       # 17 page components
|   |   |-- components/ui/               # 18 reusable UI primitives
|   |   |-- components/modals/           # CRUD modals
|   |   |-- services/                    # 9 Axios API client modules
|   |   |-- auth/                        # JWT auth context & guards
|   |   |-- hooks/                       # useApi, useDebounce
|   |   |-- router/                      # React Router config
|   |   |-- types/                       # TypeScript definitions
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20.x
- MongoDB Atlas account (or local MongoDB instance)
- Poetry

### Backend Setup

```bash
cd backend
poetry install
cp .env.example .env   # Configure your MongoDB URI, JWT secret, etc.
poetry run uvicorn app.main:app --reload --port 8000
```

### Database Seeding

```bash
cd scripts
poetry run python import_data.py
```

This seeds 5 clinics, multiple doctors/patients, appointment records, and 3 demo users.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

> The frontend calls the backend through the `VITE_API_URL` environment variable
> (see [`frontend/.env.example`](frontend/.env.example)). It defaults to the
> production backend URL, so a local frontend can talk to the deployed API
> without any extra setup. To use a locally running backend, set
> `VITE_API_URL=http://localhost:8000` in a `frontend/.env` file.

---

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URL` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DATABASE_NAME` | Database name | `HealthCare_Appointment` |
| `JWT_SECRET` | Secret key for HS256 JWT signing | `<random 64-char string>` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL in minutes | `1440` (24 hours) |
| `FRONTEND_URL` | CORS allowed origin (local) | `http://localhost:5173` |
| `VERCEL_FRONTEND_URL` | CORS allowed origin (production) | `https://healthcare-intelligence.vercel.app` |

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@clinic.com` | `Admin@12345` |
| Doctor | `doctor@clinic.com` | `Doctor@12345` |
| Staff | `staff@clinic.com` | `Staff@12345` |

---

## Machine Learning Models

### No-Show Classifier (`no_show_model.pkl`)

**Type**: XGBoost binary classifier

Predicts whether a patient will miss their appointment.

**Features**: Age, Scholarship, Hypertension, Diabetes, Alcoholism, Handicap, SMS_received, waiting_days, appointment_day_of_week, month, hour

**Output**:
- `no_show_probability` (0.0 - 1.0)
- `no_show_risk`: LOW (< 0.40) | MEDIUM (0.40 - 0.69) | HIGH (>= 0.70)

### Waiting Time Regressor (`waiting_time_model.pkl`)

**Type**: Scikit-Learn regressor

Predicts expected queue waiting time in minutes.

**Features**: queue_length, patients_ahead, consultation_duration, doctor_load, room_available

**Output**: `expected_waiting_time` (minutes)

### Composite Scheduling Risk Algorithm

Combines no-show probability, wait time, doctor workload, queue length, and room availability into a single risk score (0-14).

| Factor | Threshold | Points |
|---|---|---|
| No-show probability | >= 0.70 / 0.40-0.69 / < 0.40 | +3 / +2 / +1 |
| Expected wait time | >= 45 min / 20-44 min / < 20 min | +3 / +2 / +1 |
| Doctor workload | >= 0.80 / 0.50-0.79 / < 0.50 | +3 / +2 / +1 |
| Queue length | >= 8 / 4-7 / < 4 | +3 / +2 / +1 |
| Room unavailable | Yes | +2 |

**Final Classification**: LOW (< 6) | MEDIUM (6-9) | HIGH (>= 10)

---

## API Reference

All endpoints are prefixed with `/api`. Responses follow the format:

```json
{
  "success": true,
  "data": { ... }
}
```

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | System health status, ML model load state, DB connectivity |

---

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register a new user account |
| `POST` | `/api/auth/login` | None | Authenticate and receive JWT token |
| `GET` | `/api/auth/me` | JWT | Get current authenticated user profile |
| `POST` | `/api/auth/logout` | JWT | Invalidate client session |

**Register / Login Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin" }
  }
}
```

---

### User Management

> All endpoints require **Admin** role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users (id, name, email, role, created_at) |
| `POST` | `/api/users` | Create a new user (name, email, password, role) |
| `GET` | `/api/users/{user_id}` | Get a specific user by ID |
| `PUT` | `/api/users/{user_id}` | Update a user's name, email, and/or role |
| `DELETE` | `/api/users/{user_id}` | Delete a user (cannot delete self) |

---

### Patients

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/patients` | Any Auth | Paginated patient list with risk status. Supports `search`, `page`, `limit`, `sort` |
| `GET` | `/api/patients/{patient_id}` | Any Auth | Patient detail with appointment history, no-show rate, risk status |
| `POST` | `/api/patients` | Admin/Staff | Create a new patient (auto-generates patient_id) |
| `PUT` | `/api/patients/{patient_id}` | Admin/Staff | Update an existing patient record |
| `DELETE` | `/api/patients/{patient_id}` | Admin | Delete a patient record |

---

### Appointments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Any Auth | Paginated, filterable appointment list with prediction data |
| `GET` | `/api/appointments/{appointment_id}` | Any Auth | Full appointment detail (patient, doctor, clinic, prediction) |
| `POST` | `/api/appointments` | Admin/Staff | Create appointment; auto-runs ML prediction |
| `PUT` | `/api/appointments/{appointment_id}/status` | Any Auth | Update status (Scheduled / Completed / No-show / Cancelled) |
| `POST` | `/api/appointments/{appointment_id}/predict` | Any Auth | Re-run ML prediction for an existing appointment |

**Query Parameters for `GET /api/appointments`**:

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Search by patient name or ID |
| `clinic_id` | string | Filter by clinic |
| `doctor_id` | string | Filter by doctor |
| `risk` | string | Filter by risk level: LOW, MEDIUM, HIGH |
| `status` | string | Filter by status |
| `start_date` | string | Filter appointments after this date |
| `end_date` | string | Filter appointments before this date |
| `sort_by` | string | Sort field |
| `sort_order` | string | asc or desc |
| `page` | int | Page number (default: 1) |
| `limit` | int | Results per page (default: 20) |

---

### Doctors

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Any Auth | List doctors with workload stats. Supports `search`, `clinic_id` filter |
| `GET` | `/api/doctors/{doctor_id}` | Any Auth | Doctor detail with workload stats and trends |
| `POST` | `/api/doctors` | Admin | Create a new doctor record |

---

### Clinics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/clinics` | Any Auth | List all clinics with utilization and operational stats |
| `GET` | `/api/clinics/{clinic_id}` | Any Auth | Clinic detail: doctors, utilization, risk distribution |
| `POST` | `/api/clinics` | Admin | Create a new clinic record |

---

### Predictions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/predictions/no-show` | Any Auth | Predict no-show probability from patient profile |
| `POST` | `/api/predictions/waiting-time` | Any Auth | Predict expected waiting time from queue conditions |
| `POST` | `/api/predictions/full` | Any Auth | Combined prediction: no-show + wait time + risk score |
| `GET` | `/api/predictions` | Any Auth | List stored prediction history. Optional `appointment_id` filter |

**`POST /api/predictions/no-show` Request Body**:
```json
{
  "age": 45,
  "scholarship": 0,
  "hypertension": 1,
  "diabetes": 0,
  "alcoholism": 0,
  "handicap": 0,
  "sms_received": 1,
  "waiting_days": 15,
  "appointment_day_of_week": 2,
  "month": 8,
  "hour": 9
}
```

**`POST /api/predictions/waiting-time` Request Body**:
```json
{
  "queue_length": 5,
  "patients_ahead": 2,
  "consultation_duration": 20,
  "doctor_load": 0.65,
  "room_available": 1
}
```

**`POST /api/predictions/full` Request Body**:
```json
{
  "no_show": { /* NoShowRequest fields */ },
  "waiting_time": { /* WaitingTimeRequest fields */ },
  "appointment_id": "APP-10293"  // optional, stores result if provided
}
```

---

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Any Auth | Dashboard KPIs: totals, avg wait, utilization, risk distribution, daily trends |
| `GET` | `/api/analytics/charts` | Any Auth | All chart datasets (time series, distributions) |
| `GET` | `/api/analytics/clinic-utilization` | Admin | Clinic-level utilization statistics and doctor load ratios |
| `GET` | `/api/analytics/doctor-workload` | Admin/Doctor | Per-doctor workload statistics |
| `GET` | `/api/analytics/waiting-time` | Any Auth | Wait time distribution, clinic/doctor breakdown, daily trends |
| `GET` | `/api/analytics/scheduling-risk` | Admin/Doctor | Risk level distribution and highest-risk appointments |
| `GET` | `/api/analytics/advanced` | Admin | SMS impact, age cohort, neighbourhood demand analysis |

---

## Role-Based Access Control

| Role | Permissions |
|---|---|
| **Admin** | Full access to all endpoints, user management, analytics, clinic management |
| **Doctor** | Read appointments/patients/doctors, scheduling risk, doctor workload |
| **Staff** | Read/write patients and appointments (front-desk operations) |

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | User authentication |
| Register | `/register` | New account creation |
| Dashboard | `/` | KPI overview, charts, trends |
| Appointments | `/appointments` | Full appointment schedule with filters |
| Predictions | `/predictions` | ML prediction simulator (what-if scenarios) |
| Waiting Time | `/waiting-time` | Wait time analytics and diagnostics |
| Scheduling Risk | `/scheduling-risk` | High-risk appointment monitoring |
| Clinic Utilization | `/clinic-utilization` | Facility capacity and efficiency |
| Patients | `/patients` | Patient directory |
| Patient Detail | `/patients/:id` | Individual patient profile and history |
| Doctors | `/doctors` | Doctor directory with workload metrics |
| Doctor Detail | `/doctors/:id` | Individual doctor profile and trends |
| Clinics | `/clinics` | Clinic directory |
| Clinic Detail | `/clinics/:id` | Individual clinic profile and stats |
| Analytics | `/analytics` | Advanced demographic and operational analytics |
| Settings | `/settings` | User profile and system info |

---

## Database Schema

**Database**: `HealthCare_Appointment` (MongoDB Atlas)

### Collections

| Collection | Key Indexes | Purpose |
|---|---|---|
| `users` | Unique on `email` | System user accounts |
| `patients` | Unique on `patient_id` | Patient records |
| `doctors` | Unique on `doctor_id` | Doctor records |
| `clinics` | Unique on `clinic_id` | Clinic facility records |
| `appointments` | Unique on `appointment_id`; indexed on `clinic_id`, `doctor_id`, `patient_id`, `appointment_day` | Appointment records with clinical data |
| `predictions` | Unique on `appointment_id`; compound on `(scheduling_risk, risk_score)` | ML prediction results |

---

## Deployment

The application is split into two independent Vercel deployments:

| App | URL | Stack |
|---|---|---|
| **Frontend** | `https://healthcare-intelligence.vercel.app` | React + Vite static build from `frontend/dist/` |
| **Backend API** | `https://ai-development-coral.vercel.app` | FastAPI via `api/index.py` (Vercel Python serverless function) |

The frontend talks to the backend through `VITE_API_URL`, which is set in the Vercel
Frontend project's environment variables (defaults to `https://ai-development-coral.vercel.app`).

### Frontend project (React/Vite SPA)

Because the app uses React Router's client-side routing, Vercel must be told to
fall back to `index.html` for any path that is not a real file. Otherwise, refreshing
or directly opening a route such as `/appointments` or `/settings` returns `404: NOT_FOUND`.

This is handled by SPA fallback rules:

- `frontend/vercel.json` — used when the Vercel Frontend project has **Root Directory** set to `frontend`:
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- `vercel.json` (project root) — used when the Frontend project's **Root Directory** is the whole
  project folder. Its `routes` array declares `{ "handle": "filesystem" }` first (so real assets keep
  serving normally) and then falls back every remaining path to `/index.html`.

Required Vercel project settings for the Frontend:

- **Framework Preset**: `Other` (or the rewrite may be ignored)
- **Root Directory**: `frontend` (recommended) or the project root
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_URL=https://ai-development-coral.vercel.app`

After updating the routing config, redeploy (Vercel only reads `vercel.json` at deploy time;
existing deployments keep their old routing rules).

### Backend project (FastAPI)

- `api/index.py` is the Vercel Python serverless entry point for the ML backend.
- Requires the same environment variables listed in [Environment Variables](#environment-variables)
  (`MONGODB_URL`, `DATABASE_NAME`, `JWT_SECRET`, CORS origins, etc.).
- Deployed with `@vercel/python`; model files (`*.pkl`) and `backend/app/**` are bundled via
  the `includeFiles` config in `vercel.json`.

### Production URL

```
https://healthcare-intelligence.vercel.app
```

---

## Performance Optimizations

- **MongoDB compound indexes** on all frequently queried fields
- **Async non-blocking** database queries via Motor
- **Pre-loaded ML models** in memory at startup (no disk I/O on inference)
- **`$facet` aggregation pipelines** for multi-query single roundtrip
- **Frontend in-memory caching** via custom `useApi` hook
- **Target**: Sub-3-second page load for all sections

---

## License

This project is part of an AI Development coursework portfolio.
