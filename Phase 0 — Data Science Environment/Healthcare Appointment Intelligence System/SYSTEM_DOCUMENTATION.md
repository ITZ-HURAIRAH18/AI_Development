# Healthcare Appointment Intelligence System (HAI)
## Master System Architecture, Machine Learning Models & Operational Manual

> **Precision Healthcare Intelligence, Delivered with Enterprise Scale.**  
> An all-in-one architecture reference detailing system purpose, machine learning models, database pipelines, API workflows, and end-to-end section operational flows from frontend to backend.

---

## 1. System Purpose & Core Value Proposition

The **Healthcare Appointment Intelligence System (HAI)** is an enterprise clinical operations and predictive analytics platform engineered for hospitals, medical clinics, administrators, and healthcare operations teams.

### Core Problems Solved
1. **Patient No-Shows**: Unattended appointments cause lost clinical capacity, idle medical staff, and delayed care for other patients.
2. **Excessive Queue Waiting Times**: Unpredictable patient arrivals and prolonged consultations cause bottlenecking in waiting rooms.
3. **Suboptimal Clinic Utilization**: Overcrowding in certain clinics while other facilities remain underutilized.
4. **Reactive Operational Management**: Absence of early-warning diagnostic indicators prior to daily clinical shifts.

### Value Delivered
HAI transforms raw appointment and operational data into **real-time machine learning predictions and actionable scheduling risk scores**, enabling staff to overbook intelligently, optimize queue routing, reallocate medical staff, and reduce patient wait times below targets.

---

## 2. System Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      FRONTEND USER INTERFACE (Vite + React)                │
 │         IBM Carbon Enterprise Design System · Recharts · TypeScript        │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ REST APIs / JSON (Axios + JWT)
 ┌──────────────────────────────────────▼──────────────────────────────────────┐
 │                      FASTAPI BACKEND APPLICATION ENGINE                    │
 │    Route Handlers · Pydantic Schemas · JWT Auth · Async Engine (Uvicorn)   │
 └───────────────────┬─────────────────────────────────────┬───────────────────┘
                     │ ML Inference Calls                  │ Async Motor BSON Queries
 ┌───────────────────▼───────────────────┐   ┌─────────────▼───────────────────┐
 │     MACHINE LEARNING PREDICTORS       │   │        MONGODB DATABASE         │
 │  - No-Show Classifier (pkl)           │   │  Collections:                   │
 │  - Queue Waiting Regressor (pkl)      │   │  - appointments   - predictions │
 │  - Scheduling Risk Algorithm          │   │  - patients       - doctors     │
 └───────────────────────────────────────┘   │  - clinics        - users       │
                                             └─────────────────────────────────┘
```

---

## 3. Machine Learning Architecture & Prediction Pipelines

The system combines two machine learning models with a multi-factor risk scoring engine to generate predictions.

### Model 1: Patient No-Show Classifier (`no_show_model.pkl`)
- **Objective**: Binary classification predicting whether a scheduled patient will miss their appointment.
- **Model Type**: Scikit-Learn Ensemble Classifier (Gradient Boosting / Random Forest / Logistic Regression pipeline).
- **Feature Matrix**:
  - `Age` (Integer): Patient age in years.
  - `Gender` (Categorical/Encoded): Male / Female.
  - `Scholarship` (Binary): Welfare / assistance program enrollment status.
  - `Hypertension`, `Diabetes`, `Alcoholism`, `Handicap` (Binary/Discrete): Medical comorbidities.
  - `SMS_Received` (Binary): Whether SMS reminder notification was dispatched.
  - `Lead_Time_Days` (Integer): Days elapsed between `ScheduledDay` (booking date) and `AppointmentDay`.
- **Outputs**:
  - `no_show_probability` (Float $0.0 - 1.0$): Calibrated probability score.
  - `no_show_risk` (String Enum): 
    - `LOW` if $P < 0.40$
    - `MEDIUM` if $0.40 \le P < 0.70$
    - `HIGH` if $P \ge 0.70$

### Model 2: Queue Waiting Time Regressor (`waiting_time_model.pkl`)
- **Objective**: Continuous regression predicting expected waiting time in minutes before a patient is seen.
- **Feature Matrix**:
  - `queue_length` (Integer): Total patients currently waiting in the clinic queue.
  - `patients_ahead` (Integer): Number of patients scheduled prior to the target patient.
  - `consultation_duration` (Integer): Estimated duration of consultation in minutes (default 20 min).
  - `doctor_load` (Float $0.0 - 1.0$): Ratio of active appointments assigned to the practitioner vs capacity.
  - `room_available` (Binary 0 or 1): Availability of an examination room.
- **Output**:
  - `expected_waiting_time` (Float): Predicted queue waiting duration in minutes.

---

### Composite Algorithm: Multi-Factor Scheduling Risk Scoring

The system computes a composite **Scheduling Risk Score** (0 to 14) and assigns a categorical risk level (`LOW`, `MEDIUM`, `HIGH`) along with specific contributing risk factor flags.

$$\text{Risk Score} = S_{\text{no\_show}} + S_{\text{wait}} + S_{\text{load}} + S_{\text{queue}} + S_{\text{room}}$$

#### Diagnostic Weighting Matrix:

| Metric | Condition / Threshold | Points Added | Risk Factor Flag Generated |
|---|---|---|---|
| **No-Show Probability** | $\ge 0.70$<br>$0.40 - 0.69$<br}$< 0.40$ | $+3$<br>$+2$<br>$+1$ | `"High no-show probability"`<br>`"Elevated no-show probability"`<br>— |
| **Expected Waiting Time** | $\ge 45\text{ min}$<br>$20 - 44\text{ min}$<br}$< 20\text{ min}$ | $+3$<br>$+2$<br>$+1$ | `"Long expected waiting time"`<br>`"Elevated expected waiting time"`<br>— |
| **Doctor Workload** | $\ge 0.80$<br>$0.50 - 0.79$<br}$< 0.50$ | $+3$<br>$+2$<br>$+1$ | `"High doctor workload"`<br>`"Elevated doctor workload"`<br>— |
| **Queue Length** | $\ge 8\text{ patients}$<br>$4 - 7\text{ patients}$<br}$< 4\text{ patients}$ | $+3$<br>$+2$<br>$+1$ | `"Long queue"`<br>`"Moderate queue"`<br>— |
| **Room Availability** | Unavailable ($0$) | $+2$ | `"Room unavailable"` |

#### Final Risk Classification:
- **`HIGH` Risk**: Total Score $\ge 10$
- **`MEDIUM` Risk**: Total Score $6 - 9$
- **`LOW` Risk**: Total Score $< 6$

---

## 4. Section-by-Section End-to-End Operational Workflows

Below is the step-by-step description of how every module operates from **Frontend UI user action** through **Backend API routes & MongoDB Aggregations** to **ML inference and UI rendering**.

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │ 1. USER INTERACTION (React IBM Carbon UI)                              │
   │    User selects filters, triggers pagination, searches, or inputs data │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ HTTP GET/POST with JWT
   ┌───────────────────────────────────▼────────────────────────────────────┐
   │ 2. FASTAPI ROUTE HANDLER                                              │
   │    Validates request payload with Pydantic v2 schemas                  │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           │                                                       │
   ┌───────▼───────────────────────────┐   ┌───────────────────────▼────────┐
   │ 3A. MONGO AGGREGATION PIPELINE    │   │ 3B. ML INFERENCE ENGINE        │
   │ Executes $match, $group, $lookup, │   │ Loads pickled models & runs    │
   │ $project, $facet queries          │   │ numpy/scikit-learn inference   │
   └───────────────────┬───────────────┘   └───────────────────┬────────────┘
                       │                                       │
                       └───────────────────┬───────────────────┘
                                           │
   ┌───────────────────────────────────────▼────────────────────────────────┐
   │ 4. UNIFIED JSON RESPONSE                                               │
   │ Returns standardized JSON payload { success: true, data: {...} }       │
   └───────────────────────────────────────┬────────────────────────────────┘
                                           │
   ┌───────────────────────────────────────▼────────────────────────────────┐
   │ 5. FRONTEND RENDERING                                                  │
   │ Caches response via `useApi`, updates Recharts & Data Tables in < 3s   │
   └────────────────────────────────────────────────────────────────────────┘
```

---

### Section 1: Dashboard Overview (`/`)
- **Purpose**: High-level command center displaying operational KPIs and clinic throughput trends.
- **Frontend Component**: [`DashboardPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/DashboardPage.tsx)
- **Backend API**: `GET /api/analytics/dashboard?clinic_id={id}`
- **Backend Processing**: Executes parallel MongoDB queries:
  1. Counts total appointments, total patients, total doctors, and total clinics.
  2. Aggregates average waiting time and overall capacity utilization.
  3. Groups daily appointment volume and no-show rate for time-series charts.
  4. Summarizes risk level distribution (`HIGH`, `MEDIUM`, `LOW`).
- **Rendered Output**: 6 Stat Cards with top color accents (`border-t-4`), Appointment Volume Area Chart, No-show Rate Line Chart, Waiting Time Trend Chart, Risk Donut Chart, and Doctor Workload Distribution Bar Chart.

---

### Section 2: Appointments Schedule (`/appointments`)
- **Purpose**: Complete tabular directory of all scheduled appointments with real-time risk indicators and filtering.
- **Frontend Component**: [`AppointmentsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/AppointmentsPage.tsx)
- **Backend API**: `GET /api/appointments?search={q}&clinic_id={id}&doctor_id={id}&risk={level}&status={status}&page={p}&limit={l}`
- **Backend Processing**: 
  - Construct dynamic MongoDB `$match` query on `clinic_id`, `doctor_id`, `scheduling_risk`, and regex search on patient name/ID.
  - Returns paginated documents joining patient and doctor specifications.
- **Interactive Feature**: Clicking any row opens a **Carbon Slide-Over Specification Drawer** showing complete clinical features, no-show probability meters, and risk factor diagnostics.

---

### Section 3: Model Predictions Simulator (`/predictions`)
- **Purpose**: Interactive machine learning sandbox allowing staff to test "what-if" scenarios for any appointment configuration.
- **Frontend Component**: [`PredictionsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/PredictionsPage.tsx)
- **Backend API**: `POST /api/predictions/full`
- **Backend Processing**:
  - Receives `NoShowRequest` (demographics, comorbidities, SMS status, dates) and `WaitingTimeRequest` (queue length, patients ahead, doctor load, room availability).
  - Executes `predict_no_show()`, `predict_waiting_time()`, and `calculate_scheduling_risk()`.
  - Optionally stores prediction in MongoDB if an `appointment_id` is supplied.
- **Rendered Output**: Probability progress bar, expected queue wait time tile, risk classification badge, and detailed risk factor list.

---

### Section 4: Waiting Time Analytics (`/waiting-time`)
- **Purpose**: Statistical diagnostics on patient queue waiting times across clinics and providers.
- **Frontend Component**: [`WaitingTimePage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/WaitingTimePage.tsx)
- **Backend API**: `GET /api/analytics/waiting-time`
- **Backend Processing**:
  - MongoDB `$bucket` pipeline grouping wait times into intervals ($0-15\text{ min}$, $15-30\text{ min}$, $30-45\text{ min}$, $45+\text{ min}$).
  - Groups average waiting times by clinic ID and by doctor ID.
- **Rendered Output**: KPI tiles (Average, Median, Maximum, Total Analyzed), Waiting Time Bucket Histogram, Daily Trend Line Chart, Clinic Benchmark Bar Chart, Top Doctors Wait Bar Chart.

---

### Section 5: Scheduling Risk Intelligence (`/scheduling-risk`)
- **Purpose**: Specialized workspace for monitoring and managing appointments flagged with elevated operational risk.
- **Frontend Component**: [`SchedulingRiskPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/SchedulingRiskPage.tsx)
- **Backend API**: `GET /api/analytics/scheduling-risk`
- **Backend Processing**:
  - Queries `predictions` collection for risk classification counts.
  - Retrieves all appointments flagged as `HIGH` scheduling risk with joined patient and doctor details.
- **Rendered Output**: KPI summary cards, Donut Risk Breakdown Overlay with centered stats, live Search input, Risk Factor Filter Dropdown, and High-Risk Appointment Data Table.

---

### Section 6: Clinic Utilization & Capacity (`/clinic-utilization`)
- **Purpose**: Evaluates facility operational efficiency and practitioner capacity loading.
- **Frontend Component**: [`ClinicUtilizationPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/ClinicUtilizationPage.tsx)
- **Backend API**: `GET /api/clinics/utilization`
- **Backend Processing**:
  - Computes $\text{Doctor Load} = \frac{\text{Appointments Assigned}}{\text{Standard Daily Capacity}}$.
  - Calculates $\text{Utilization \%} = \text{Average Doctor Load} \times 100$.
- **Rendered Output**: Capacity utilization bar chart per clinic, average system wait times, and detailed facility comparison table with status tags.

---

### Section 7: Patient Intelligence Directory (`/patients` & `/patients/:id`)
- **Purpose**: Patient directory and individual historical track record.
- **Frontend Component**: [`PatientsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/PatientsPage.tsx) & [`PatientDetailPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/PatientDetailPage.tsx)
- **Backend API**: `GET /api/patients` & `GET /api/patients/{id}`
- **Backend Processing**: Aggregates patient appointment history, no-show record, medical conditions, and historical attendance rate.
- **Rendered Output**: Searchable patient table, individual medical history profile, and historical timeline of past visits.

---

### Section 8: Doctor Workload & Performance (`/doctors` & `/doctors/:id`)
- **Purpose**: Provider workload ratios, average waiting times per physician, and individual productivity trends.
- **Frontend Component**: [`DoctorsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/DoctorsPage.tsx) & [`DoctorDetailPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/DoctorDetailPage.tsx)
- **Backend API**: `GET /api/doctors` & `GET /api/doctors/{id}`
- **Backend Processing**: Calculates doctor-level metrics (total appointments, avg wait, doctor load ratio, no-show rate, capacity utilization).
- **Rendered Output**: Specialization tags, workload indicators, appointment volume area charts, and wait time diagnostic trend charts.

---

### Section 9: Clinics Directory (`/clinics` & `/clinics/:id`)
- **Purpose**: Overview of all healthcare facilities, assigned doctors, and risk distribution per location.
- **Frontend Component**: [`ClinicsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/ClinicsPage.tsx) & [`ClinicDetailPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/ClinicDetailPage.tsx)
- **Backend API**: `GET /api/clinics` & `GET /api/clinics/{id}`
- **Backend Processing**: Returns clinic profile, active practitioner array, total patient volume, and location details.
- **Rendered Output**: Clinic specification cards, assigned provider directory tables, and risk level breakdown bars.

---

### Section 10: Advanced Operations Analytics (`/analytics`)
- **Purpose**: Deep demographic, geographic, and intervention impact analytics.
- **Frontend Component**: [`AnalyticsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/AnalyticsPage.tsx)
- **Backend API**: `GET /api/analytics/charts` & `GET /api/analytics/advanced`
- **Backend Processing**:
  - Aggregates SMS impact (no-show rate for patients receiving SMS vs no SMS).
  - Groups age cohorts ($0-18$, $19-35$, $36-55$, $56+$).
  - Ranks top patient neighbourhoods by volume.
- **Rendered Output**: SMS intervention bar chart, age cohort bar chart, horizontal neighbourhood demand density chart, and overall risk classification profile.

---

### Section 11: System & User Configuration (`/settings`)
- **Purpose**: User profile credentials, privilege role specification, and platform architecture overview.
- **Frontend Component**: [`SettingsPage.tsx`](file:///e:/Courses/AI_Development/Phase%200%20%E2%80%94%20Data%20Science%20Environment/Healthcare%20Appointment%20Intelligence%20System/frontend/src/pages/SettingsPage.tsx)
- **Backend API**: Uses `AuthContext` user session decoded from JWT token.
- **Rendered Output**: Authenticated user card, role badge (`admin`, `doctor`, `staff`), user ID, and infrastructure specifications.

---

## 5. Technology Stack Specifications

### Frontend Application Layer
- **Framework**: React 18 + TypeScript + Vite
- **Design System**: IBM Carbon Enterprise standard (`#161616` Charcoal dark header, `#F4F4F4` Carbon Gray 10 base, `#FFFFFF` Layer 01 surface, `#0F62FE` Carbon Blue interactive accent, `#198038` Green, `#DA1E28` Red).
- **Typography**: IBM Plex Sans Google Font family.
- **Chart Library**: Recharts (AreaChart, BarChart, LineChart, PieChart with zero-radius custom tooltips).
- **Icons**: Lucide React icons.
- **Custom Brand Identity**: `HAILogo.tsx` SVG Brand Component.

### Backend Application Layer
- **Framework**: FastAPI (Python 3.11+) running on Uvicorn ASGI server.
- **Database Engine**: MongoDB with Motor async driver.
- **Security & Authentication**: OAuth2 Password Flow + PyJWT (HS256 signature verification) + Passlib BCrypt password hashing.
- **Machine Learning Tooling**: Scikit-Learn, NumPy, Joblib model loaders.
- **Validation**: Pydantic v2 data validation models.

---

## 6. Database Collections & Data Schemas

### Collection 1: `appointments`
```json
{
  "_id": "ObjectId",
  "appointment_id": "APP-10293",
  "patient_id": "PAT-40291",
  "patient_name": "Jane Doe",
  "doctor_id": "DOC-102",
  "doctor_name": "Dr. Sarah Jenkins",
  "clinic_id": "CLN-01",
  "clinic_name": "Central Cardiology Clinic",
  "appointment_date": "2026-08-25T09:30:00Z",
  "scheduled_day": "2026-08-10T14:00:00Z",
  "age": 45,
  "gender": "F",
  "scholarship": 0,
  "hypertension": 1,
  "diabetes": 0,
  "alcoholism": 0,
  "handicap": 0,
  "sms_received": 1,
  "status": "Scheduled",
  "queue_length": 5,
  "patients_ahead": 2,
  "consultation_duration": 20,
  "doctor_load": 0.65,
  "room_available": 1,
  "created_at": "2026-08-10T14:00:00Z"
}
```

### Collection 2: `predictions`
```json
{
  "_id": "ObjectId",
  "appointment_id": "APP-10293",
  "no_show_probability": 0.1825,
  "no_show_risk": "LOW",
  "expected_waiting_time": 14.5,
  "scheduling_risk": "LOW",
  "risk_score": 4,
  "risk_factors": [],
  "created_at": "2026-08-24T09:00:00Z"
}
```

### Collection 3: `users`
```json
{
  "_id": "ObjectId",
  "user_id": "USR-101",
  "name": "Dr. Administrator",
  "email": "admin@clinic.com",
  "hashed_password": "$2b$12$...",
  "role": "admin",
  "created_at": "2026-08-01T00:00:00Z"
}
```

---

## 7. Performance Optimizations (<3 Seconds Loading Guarantee)

To meet the requirement that **every section loads in less than 3 seconds**, the system incorporates performance techniques across database, backend, and frontend layers:

1. **MongoDB Database Indexes**:
   - Compound index on `appointment_id`, `clinic_id`, `doctor_id`, `patient_id`.
   - Index on `appointment_date` and `created_at` for high-speed date-range aggregations.
   - Index on `predictions.appointment_id` for $O(1)$ result join lookups.

2. **Backend Execution Efficiency**:
   - Asynchronous non-blocking database queries via `Motor`.
   - Pre-loaded scikit-learn model instances stored in memory (`ml_service`) upon FastAPI app startup, eliminating disk I/O on inference requests.
   - MongoDB `$facet` aggregation pipelines computing multiple aggregations (counts, totals, averages, time-series) in a single database roundtrip.

3. **Frontend Data Caching Hook (`useApi`)**:
   - In-memory response caching keying requests by URL and query parameters.
   - Immediate cache rendering while refreshing background data, eliminating loading state latency on tab navigation.
   - Compact Carbon skeleton shimmers preventing layout shifts during data fetch.

---

## 8. Summary Statement

The **Healthcare Appointment Intelligence System (HAI)** combines modern machine learning with an enterprise IBM Carbon design system. By pairing predictive no-show modeling and queue regression with real-time multi-factor risk diagnostics, the system gives healthcare operators actionable tools to optimize patient care delivery and clinical capacity.
