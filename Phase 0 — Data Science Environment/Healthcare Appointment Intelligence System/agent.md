You are a senior full-stack architect, ML engineer, UI/UX designer, and software engineer.

I have already completed the Machine Learning portion of a Healthcare Appointment Intelligence System.

DO NOT recreate or retrain my ML models unless absolutely necessary.

Your job is to build a complete professional full-stack healthcare prediction and clinic intelligence platform around my existing ML models.

==================================================
PROJECT
==================================================

Name:

Healthcare Appointment Intelligence System

Purpose:

Build a professional healthcare analytics and prediction platform that helps clinics predict:

1. Appointment no-show probability
2. Expected patient waiting time
3. Patient scheduling risk
4. Clinic utilization

The application should look like a real professional healthcare SaaS product, NOT like a student project.

The UI must be clean, modern, minimal, professional, trustworthy, and suitable for a healthcare organization.

==================================================
EXISTING MACHINE LEARNING MODELS
==================================================

I already have these trained models:

1. no_show_model.pkl

Purpose:
Predict appointment no-show probability.

2. waiting_time_model.pkl

Purpose:
Predict expected waiting time.

DO NOT replace these models.

Load them from the backend.

The backend must expose APIs that use these models for predictions.

==================================================
TECH STACK
==================================================

Frontend:

React
Vite
TypeScript
Tailwind CSS
React Router
Axios
Recharts
Lucide React icons

Backend:

Python
FastAPI
Pydantic
Uvicorn
Joblib
Pandas
Scikit-learn
XGBoost

Database:

MongoDB

MongoDB driver:

Motor

Authentication:

JWT authentication

Password hashing:

Passlib / bcrypt

API architecture:

REST API

==================================================
IMPORTANT DESIGN RULE
==================================================

This is a healthcare prediction and analytics platform.

The UI must NOT look like:

- A gaming dashboard
- A crypto dashboard
- A generic admin template
- A student CRUD project
- A colorful marketing website
- A blue-gradient AI website

Do NOT use excessive gradients.

Do NOT use emojis.

Do NOT use cartoon illustrations.

Do NOT use giant glowing cards.

Do NOT use unnecessary animations.

Do NOT use excessive rounded containers.

Do NOT use blue as the dominant visual color.

Do NOT use random colors for every card.

Use a sophisticated healthcare SaaS visual language.

Preferred visual direction:

- White
- Off-white
- Charcoal
- Slate
- Soft neutral gray
- Deep teal
- Muted green
- Very subtle warm accent colors

Use color only to communicate status.

For example:

Low Risk:
muted green

Medium Risk:
muted amber

High Risk:
muted red

Avoid neon colors.

==================================================
TYPOGRAPHY
==================================================

Use a professional modern font.

Prefer:

Inter

or

Manrope

Use the font consistently throughout the application.

Typography should have:

- Strong hierarchy
- Excellent readability
- Professional spacing
- Appropriate font weights
- Clean dashboard headings
- Small but readable metadata

Do not use decorative fonts.

==================================================
FRONTEND STRUCTURE
==================================================

Create a scalable architecture.

Use:

src/
    components/
    layouts/
    pages/
    features/
    hooks/
    services/
    types/
    utils/
    assets/
    charts/
    auth/
    router/

Use reusable components.

Do not put the entire application inside App.tsx.

==================================================
MAIN APPLICATION LAYOUT
==================================================

Create a professional application shell.

Desktop layout:

LEFT SIDEBAR
+
TOP HEADER
+
MAIN CONTENT

Sidebar should contain:

Overview
Appointments
Predictions
Waiting Time
Scheduling Risk
Clinic Utilization
Patients
Doctors
Clinics
Analytics
Settings

At the bottom:

User profile
Logout

Sidebar should be compact and professional.

Use Lucide icons.

No emojis.

==================================================
TOP HEADER
==================================================

Header should contain:

Page title

Current clinic / organization selector

Search

Notification icon

User profile

Profile dropdown:

Profile
Settings
Logout

Keep header minimal.

==================================================
LOGIN PAGE
==================================================

Create a professional healthcare login page.

Do NOT create a flashy login.

Layout:

Left:

Professional healthcare intelligence branding

Short description:

"Predict appointment risk, optimize clinic operations, and improve patient flow."

Right:

Login card

Fields:

Email
Password

Remember me

Login button

Forgot password

Also create:

Register page

==================================================
AUTHENTICATION
==================================================

Implement:

Register
Login
Logout
JWT access token
Protected routes
Current user endpoint

Store authentication securely.

Use Axios interceptors.

Backend should verify JWT.

Passwords must NEVER be stored as plain text.

==================================================
DASHBOARD
==================================================

Create the main dashboard.

Dashboard should show:

Total Appointments

Predicted No-shows

Average Waiting Time

High Risk Appointments

Clinic Utilization

Doctor Load

Use professional KPI cards.

Example:

Total Appointments
110,521

Predicted No-shows
22,314

Average Waiting Time
18 min

High Risk
2,341

Clinic Utilization
40.2%

Do not use fake hardcoded values once backend APIs exist.

All dashboard statistics must come from backend APIs.

==================================================
DASHBOARD CHARTS
==================================================

Create professional analytics charts.

Charts:

1. Appointment volume over time

2. No-show rate over time

3. Waiting time trend

4. Clinic utilization comparison

5. Doctor workload

6. Scheduling risk distribution

Use Recharts.

Charts should be clean.

Do not overload charts with unnecessary visual elements.

Use tooltips.

Use legends only when needed.

==================================================
APPOINTMENTS PAGE
==================================================

Create a professional appointment management page.

Table columns:

Appointment ID
Patient
Doctor
Clinic
Appointment Date
Waiting Time
No-show Probability
Scheduling Risk
Status
Actions

Add:

Search

Filter

Date filter

Clinic filter

Doctor filter

Risk filter

Pagination

Sorting

Status badges

Clicking an appointment opens a detailed drawer/modal.

==================================================
APPOINTMENT DETAIL
==================================================

Show:

Patient information

Appointment information

Doctor

Clinic

Scheduled date

Appointment date

No-show probability

Risk level

Expected waiting time

Queue length

Patients ahead

Doctor load

Room availability

Consultation duration

SMS received

Relevant patient factors

Use clean information sections.

==================================================
PREDICTION PAGE
==================================================

Create a dedicated prediction interface.

Title:

Appointment Risk Prediction

Form:

Age
Gender
Scholarship
Hypertension
Diabetes
Alcoholism
Handicap
SMS received
Scheduled date
Appointment date

Operational information:

Doctor
Clinic
Queue length
Patients ahead
Doctor load
Room availability
Consultation duration

When user clicks:

"Run Prediction"

Call backend API.

Display:

No-show probability

Expected waiting time

Scheduling risk

Risk score

Use professional result cards.

Example:

No-show Probability

73%

High Risk

Expected Waiting Time

34 min

Scheduling Risk

HIGH

==================================================
PREDICTION UX
==================================================

Do not immediately show results before API response.

Show loading state:

"Analyzing appointment..."

Handle errors professionally.

Example:

"Unable to generate prediction. Please verify the appointment information."

Do not expose backend stack traces.

==================================================
NO-SHOW PREDICTION
==================================================

Backend must load:

no_show_model.pkl

Use exactly the features required by the model.

Current features:

Age
Scholarship
Hipertension
Diabetes
Alcoholism
Handcap
SMS_received
waiting_days
appointment_day
appointment_month
appointment_hour

Do not accidentally change feature order.

Create:

POST /api/predictions/no-show

Request:

{
    "age": 42,
    "scholarship": 0,
    "hypertension": 0,
    "diabetes": 0,
    "alcoholism": 0,
    "handicap": 0,
    "sms_received": 1,
    "scheduled_day": "...",
    "appointment_day": "..."
}

Backend calculates:

waiting_days

appointment_day

appointment_month

appointment_hour

Then sends the correct feature vector to:

no_show_model.pkl

Return:

{
    "probability": 0.73,
    "risk": "HIGH"
}

==================================================
WAITING TIME PREDICTION
==================================================

Load:

waiting_time_model.pkl

Model features:

queue_length
patients_ahead
consultation_duration
doctor_load
room_available

Create:

POST /api/predictions/waiting-time

Return:

{
    "expected_waiting_time": 34.5
}

Round display value appropriately.

==================================================
SCHEDULING RISK
==================================================

Use the existing scheduling risk logic.

Create backend service:

scheduling_risk_service.py

The risk system should consider:

No-show probability
Expected waiting time
Doctor load
Queue length
Room availability

Return:

risk level

risk score

risk factors

Example:

{
    "risk": "HIGH",
    "score": 13,
    "factors": [
        "High no-show probability",
        "High doctor workload",
        "Long queue",
        "Room unavailable"
    ]
}

Do not blindly hardcode the frontend risk.

Risk calculation belongs to backend.

==================================================
COMBINED PREDICTION
==================================================

Create the most important endpoint:

POST

/api/predictions/full

This endpoint should run:

1. No-show model
2. Waiting-time model
3. Scheduling risk logic

Return:

{
    "no_show_probability": 0.73,
    "expected_waiting_time": 34.5,
    "scheduling_risk": "HIGH",
    "risk_score": 13,
    "risk_factors": []
}

This endpoint will be used by the main prediction page.

==================================================
CLINIC UTILIZATION
==================================================

Implement clinic utilization analytics.

Use clinic operational data.

Calculate:

Average doctor load

Clinic utilization

Patient volume

Average waiting time

Total consultation time

Doctors per clinic

Utilization should use the current operational definition:

utilization_percentage =
average_doctor_load * 100

Do not produce impossible values above 100%.

Create:

GET /api/analytics/clinic-utilization

Return clinic-level statistics.

==================================================
CLINIC UTILIZATION PAGE
==================================================

Show:

Clinic cards

Utilization chart

Clinic comparison

Patient volume

Average waiting time

Average doctor load

Table:

Clinic
Doctors
Patients
Average Wait
Doctor Load
Utilization

Add date filtering if supported.

==================================================
WAITING TIME ANALYTICS
==================================================

Create page:

Waiting Time Analytics

Show:

Average waiting time

Maximum waiting time

Median waiting time

Waiting time distribution

Waiting time by clinic

Waiting time by doctor

Waiting time trend

Use professional charts.

==================================================
SCHEDULING RISK PAGE
==================================================

Create:

Scheduling Risk

Show:

Low risk appointments
Medium risk appointments
High risk appointments

Risk distribution chart.

High-risk appointment table:

Patient
Doctor
Clinic
No-show probability
Expected wait
Risk score
Risk factors

Allow filtering.

==================================================
PATIENTS PAGE
==================================================

Create patient management interface.

Patient table:

Patient ID
Name
Age
Gender
Appointments
No-show rate
Last appointment
Risk status

Patient detail page:

Appointment history

No-show history

Waiting time history

Risk trends

Do not expose unnecessary sensitive information.

==================================================
DOCTORS PAGE
==================================================

Show:

Doctor

Clinic

Appointments

Average waiting time

Doctor load

No-show rate

Utilization

Create doctor detail page.

Charts:

Patient volume

Waiting time

Load trend

==================================================
CLINICS PAGE
==================================================

Show all clinics.

Columns:

Clinic ID
Doctors
Appointments
Utilization
Average waiting time
No-show rate

Click clinic:

Clinic overview

Doctors

Appointments

Utilization

Waiting time

Risk distribution

==================================================
ANALYTICS PAGE
==================================================

Create advanced analytics.

Include:

Appointment trends

No-show trends

Waiting time trends

Clinic utilization

Doctor workload

Risk distribution

SMS impact

Age group analysis

Neighbourhood analysis

Use filters:

Date

Clinic

Doctor

Risk

Age group

==================================================
MONGODB DATABASE
==================================================

Use MongoDB.

Create database:

healthcare_intelligence

Collections:

users
patients
appointments
doctors
clinics
predictions
clinic_metrics

Use proper MongoDB schemas/models.

Do not store passwords in plain text.

==================================================
DATABASE DESIGN
==================================================

users:

_id
name
email
password_hash
role
created_at

roles:

admin
doctor
staff

patients:

patient_id
name
age
gender
created_at

appointments:

appointment_id
patient_id
doctor_id
clinic_id
scheduled_day
appointment_day
status
sms_received
queue_length
patients_ahead
consultation_duration
doctor_load
room_available
waiting_time

predictions:

appointment_id
no_show_probability
expected_waiting_time
scheduling_risk
risk_score
risk_factors
created_at

clinics:

clinic_id
name
location
doctor_ids

doctors:

doctor_id
name
clinic_id
specialization
active

==================================================
FASTAPI STRUCTURE
==================================================

Create:

backend/
    app/
        main.py

        core/
            config.py
            security.py

        db/
            mongodb.py

        models/
            user.py
            patient.py
            appointment.py
            doctor.py
            clinic.py
            prediction.py

        schemas/
            auth.py
            patient.py
            appointment.py
            prediction.py

        routes/
            auth.py
            patients.py
            appointments.py
            doctors.py
            clinics.py
            predictions.py
            analytics.py

        services/
            ml_service.py
            no_show_service.py
            waiting_time_service.py
            scheduling_risk_service.py
            utilization_service.py

        ml/
            no_show_model.pkl
            waiting_time_model.pkl

        utils/

    requirements.txt
    .env.example

==================================================
ML SERVICE
==================================================

Create a centralized ML service.

Do not load the model on every request.

Load models once when FastAPI starts.

Example concept:

no_show_model = joblib.load(...)

waiting_time_model = joblib.load(...)

Use dependency/service architecture.

==================================================
API RESPONSE FORMAT
==================================================

Use consistent JSON responses.

Success:

{
    "success": true,
    "data": {}
}

Error:

{
    "success": false,
    "message": "Invalid appointment data"
}

Do not expose stack traces.

==================================================
VALIDATION
==================================================

Use Pydantic.

Validate:

Age

Dates

Queue length

Patients ahead

Doctor load

Room availability

Consultation duration

Probability values

Do not allow invalid negative values where inappropriate.

==================================================
ERROR HANDLING
==================================================

Implement global FastAPI exception handling.

Return useful errors.

Frontend should display human-readable messages.

==================================================
CORS
==================================================

Configure CORS for frontend.

Development:

http://localhost:5173

Do not use wildcard CORS in production configuration.

==================================================
ENVIRONMENT VARIABLES
==================================================

Create:

.env.example

Include:

MONGODB_URL=
DATABASE_NAME=
JWT_SECRET=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
FRONTEND_URL=

Never hardcode secrets.

==================================================
FRONTEND API
==================================================

Create:

src/services/api.ts

Use Axios.

Create separate API services:

authApi.ts
appointmentApi.ts
predictionApi.ts
clinicApi.ts
doctorApi.ts
analyticsApi.ts

Do not call Axios directly from every component.

==================================================
STATE MANAGEMENT
==================================================

Use React Context or another lightweight approach for authentication.

Do not introduce Redux unless genuinely necessary.

==================================================
LOADING STATES
==================================================

Every API-driven page must have:

Loading state

Empty state

Error state

Success state

Do not leave blank screens.

Use professional skeleton loaders where appropriate.

==================================================
RESPONSIVE DESIGN
==================================================

The dashboard must work on:

Desktop
Laptop
Tablet

Mobile should have a responsive sidebar.

Do not sacrifice desktop quality.

==================================================
ACCESSIBILITY
==================================================

Use:

Semantic HTML

Accessible labels

Keyboard navigation

Proper contrast

ARIA where needed

Buttons must have meaningful labels.

==================================================
SECURITY
==================================================

Implement:

JWT authentication

Password hashing

Input validation

CORS

Protected routes

Environment variables

No secrets in frontend

No model files exposed publicly

No sensitive information in logs

==================================================
DATABASE SEEDING
==================================================

Create a seed script.

Seed:

5 clinics

Doctors

Sample patients

Sample appointments

Use the actual clinic IDs from the dataset:

C01
C02
C03
C04
C05

Do not create unrealistic thousands of fake records unless necessary.

Use the existing CSV for meaningful data ingestion.

==================================================
DATA IMPORT
==================================================

Create:

scripts/import_data.py

Read:

clinic_operations.csv

Insert useful records into MongoDB.

Avoid duplicate records.

Use AppointmentID as a unique appointment identifier.

==================================================
DASHBOARD DATA
==================================================

Dashboard values must come from MongoDB/backend.

Do not hardcode dashboard numbers.

Use aggregation pipelines where appropriate.

==================================================
UI DESIGN SYSTEM
==================================================

Create reusable:

Button
Input
Select
Modal
Drawer
Table
Badge
Card
StatCard
ChartCard
PageHeader
FilterBar
EmptyState
LoadingState
ErrorState

All components should follow the same visual system.

==================================================
COLOR SYSTEM
==================================================

Use a professional neutral healthcare palette.

Suggested:

Background:
#F7F8F6

Surface:
#FFFFFF

Primary:
deep teal / dark green

Text:
dark charcoal

Muted:
slate gray

Success:
muted green

Warning:
muted amber

Danger:
muted red

Do not make the interface predominantly blue.

==================================================
ICONS
==================================================

Use Lucide React.

Examples:

Calendar
Users
Clock
Activity
Building2
Stethoscope
UserRound
ShieldAlert
ChartNoAxesCombined
Settings
Search

Never use emoji icons.

==================================================
ANIMATIONS
==================================================

Animations should be subtle.

Use:

fade

small transitions

hover states

skeleton loaders

Do not use:

large page animations

bouncing cards

excessive motion

==================================================
PROFESSIONAL HEALTHCARE UX
==================================================

The application should feel like software used by:

Hospital administrators
Clinic managers
Doctors
Reception staff

The user should immediately understand:

What is happening today?

Which appointments are risky?

Which clinics are overloaded?

Who is likely to no-show?

How long will patients wait?

==================================================
NO FAKE AI CLAIMS
==================================================

Do not display statements such as:

"AI knows the patient"

"100% accurate"

"Guaranteed prediction"

"Medical diagnosis"

The system is an operational prediction and analytics system.

Clearly label predictions as:

Prediction
Risk estimate
Expected waiting time

==================================================
IMPORTANT ML SAFETY
==================================================

This system is NOT a medical diagnosis system.

It predicts appointment operational behavior.

Do not generate medical diagnoses.

Do not recommend medical treatment.

==================================================
DOCUMENTATION
==================================================

Create:

README.md

Include:

Project overview

Architecture

Tech stack

Folder structure

Installation

Environment variables

MongoDB setup

Backend setup

Frontend setup

ML model setup

Data import

Running development servers

API documentation

Example API requests

Example responses

==================================================
API DOCUMENTATION
==================================================

FastAPI Swagger should be available.

Use:

/docs

Document every endpoint with:

summary

description

request schema

response schema

==================================================
TESTING
==================================================

Create backend tests for:

Authentication

No-show prediction

Waiting-time prediction

Scheduling risk

Clinic utilization

Appointments

Create frontend tests for critical prediction components if practical.

==================================================
DOCKER
==================================================

Create:

docker-compose.yml

Services:

frontend

backend

mongodb

Use environment variables.

Make the project easy to start.

==================================================
LOGGING
==================================================

Use structured backend logging.

Log:

API request errors

Prediction errors

Database errors

Do NOT log passwords or sensitive personal information.

==================================================
FINAL PROJECT STRUCTURE
==================================================

The final project should approximately look like:

healthcare-intelligence/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ml/
│   │       ├── no_show_model.pkl
│   │       └── waiting_time_model.pkl
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env.example
│
├── scripts/
│   └── import_data.py
│
├── data/
│   └── clinic_operations.csv
│
├── docker-compose.yml
├── README.md
└── .gitignore

==================================================
IMPORTANT DEVELOPMENT RULES
==================================================

1. Do not generate everything blindly in one giant file.

2. Build the architecture cleanly.

3. Keep frontend and backend separated.

4. Use reusable components.

5. Use TypeScript properly.

6. Use Pydantic schemas.

7. Use MongoDB aggregation where appropriate.

8. Do not hardcode prediction results.

9. Do not hardcode dashboard statistics.

10. Do not duplicate business logic.

11. Keep ML logic inside backend services.

12. Keep database logic separate from routes.

13. Keep frontend API calls inside service files.

14. Keep authentication centralized.

15. Keep secrets in .env.

16. Do not expose .pkl files through the frontend.

17. Do not change the feature order used by the existing ML models.

18. Do not retrain models unless there is a clear technical reason.

19. Do not replace MongoDB with PostgreSQL.

20. Do not replace React with another frontend framework.

==================================================
EXECUTION ORDER
==================================================

Do NOT attempt to create the entire project without verifying each layer.

Implement in this order:

PHASE 1
Project architecture

PHASE 2
FastAPI setup

PHASE 3
MongoDB connection

PHASE 4
Load existing ML models

PHASE 5
Prediction services

PHASE 6
Prediction APIs

PHASE 7
Authentication

PHASE 8
CRUD APIs

PHASE 9
Analytics APIs

PHASE 10
React application shell

PHASE 11
Authentication UI

PHASE 12
Dashboard

PHASE 13
Prediction UI

PHASE 14
Appointments

PHASE 15
Doctors

PHASE 16
Clinics

PHASE 17
Analytics

PHASE 18
Responsive UI refinement

PHASE 19
Testing

PHASE 20
Docker

PHASE 21
Documentation

==================================================
MOST IMPORTANT REQUIREMENT
==================================================

Before writing code:

1. Inspect the existing project files.
2. Inspect the existing ML model files.
3. Inspect clinic_operations.csv.
4. Inspect the feature names and feature order used to train the models.
5. Do not overwrite existing ML files.
6. Reuse the existing models.
7. Reuse existing useful Python code where appropriate.
8. Create a clean production-style architecture around it.

If something already exists, improve or integrate it rather than unnecessarily duplicating it.

==================================================
FINAL GOAL
==================================================

When complete, I should be able to run:

MongoDB

Backend:

uvicorn app.main:app --reload

Frontend:

npm run dev

Then open the application and:

1. Register/login
2. View dashboard
3. View appointments
4. Enter appointment information
5. Run no-show prediction
6. Get no-show probability
7. Get expected waiting time
8. Get scheduling risk
9. View clinic utilization
10. View doctors
11. View clinics
12. View analytics
13. Filter and search data
14. Store predictions in MongoDB
15. View historical predictions

The finished result must look like a serious professional healthcare operations intelligence product suitable for a portfolio project and technical interview.

Do not stop after creating the folder structure.

Actually implement the working frontend, backend, database integration, authentication, APIs, ML integration, analytics, and UI.

Start by inspecting my existing project and then implement PHASE 1 only.

After completing each phase, explain:

- What you created
- Which files changed
- How to run it
- How to test it
- What the next phase will be

Do not move to the next phase until the current phase is working.