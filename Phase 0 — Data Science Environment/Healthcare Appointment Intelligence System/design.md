You are a Senior Staff Frontend Engineer, Product Designer, UX Architect, and Design Systems Engineer.

I have an existing Healthcare Appointment Intelligence System.

The application is already functional. DO NOT rebuild the application from scratch.

Your job is to perform a complete professional UI/UX redesign and frontend architecture upgrade while preserving all existing functionality, API integrations, authentication, database behavior, machine-learning functionality, routes, calculations, and business logic.

The new interface must look like a real enterprise healthcare intelligence/operations platform built by a professional product team.

IMPORTANT:
The visual direction is INSPIRED BY IBM CARBON DESIGN SYSTEM principles described in the provided DESIGN.md file.

Do NOT copy IBM branding, IBM logos, IBM product names, or IBM proprietary visual identity.

Use Carbon-style enterprise design principles adapted specifically for this Healthcare Appointment Intelligence System.

==================================================
1. PRIMARY DESIGN OBJECTIVE
==================================================

Transform the current application from:

- generic dashboard
- "vibe coded" appearance
- excessive colors
- inconsistent spacing
- inconsistent cards
- weak typography
- unclear charts
- poor loading states
- inconsistent buttons
- visually noisy UI

into:

A PROFESSIONAL ENTERPRISE HEALTHCARE INTELLIGENCE PLATFORM.

The final result should feel comparable to:

- enterprise healthcare analytics software
- hospital operations command centers
- clinical intelligence platforms
- enterprise BI dashboards
- professional SaaS products
- government/healthcare information systems

The interface must communicate:

PRECISION
TRUST
SAFETY
DATA
CLARITY
PROFESSIONALISM
OPERATIONAL INTELLIGENCE

It must NOT look like:

- a student project
- a template dashboard
- a Tailwind demo
- a "vibe coded" AI website
- a gaming dashboard
- a crypto dashboard
- a marketing landing page
- a colorful startup dashboard

==================================================
2. DESIGN SYSTEM
==================================================

Use the provided DESIGN.md as the primary visual reference.

Core principles:

- light theme
- white primary canvas
- light gray secondary surfaces
- dark charcoal typography
- one primary brand accent
- semantic colors only where meaning requires them
- 1px borders
- minimal/no decorative shadows
- flat geometry
- consistent spacing
- professional typography
- strong information hierarchy
- dense but readable enterprise layout

The application should use a LIGHT professional theme.

DO NOT make the entire application dark.

DO NOT introduce unnecessary gradients.

DO NOT use glassmorphism.

DO NOT use glowing cards.

DO NOT use excessive rounded cards.

DO NOT use neon colors.

DO NOT use decorative blobs.

DO NOT use excessive animations.

==================================================
3. COLOR SYSTEM
==================================================

Create a centralized design token system.

Do not hardcode colors throughout components.

Create tokens similar to:

--color-background
--color-surface
--color-surface-subtle
--color-border
--color-border-strong

--color-text-primary
--color-text-secondary
--color-text-muted

--color-primary
--color-primary-hover
--color-primary-active

Semantic colors:

--color-success
--color-warning
--color-danger
--color-info

Use the primary accent sparingly.

Recommended visual direction:

Primary:
Professional healthcare blue

Neutral:
White
Very light gray
Medium gray
Charcoal

Semantic:
Green = success / healthy / low risk
Amber/yellow = warning / medium risk
Red = danger / high risk
Blue = information / neutral intelligence

IMPORTANT:

Every color must have a semantic reason.

Do NOT use random colors simply to make the dashboard "colorful".

==================================================
4. COLOR MEANING SYSTEM
==================================================

Implement a strict semantic color language.

GREEN:

Use only for:
- healthy
- successful
- low risk
- completed
- available capacity
- positive operational state

AMBER:

Use only for:
- warning
- medium risk
- approaching capacity
- attention required

RED:

Use only for:
- high risk
- critical issue
- failed operation
- dangerous capacity
- no-show risk when classified as high

BLUE:

Use for:
- primary actions
- selected navigation
- informational content
- active links
- neutral analytics
- system intelligence

GRAY:

Use for:
- neutral information
- inactive states
- secondary content
- historical data
- labels
- supporting UI

Never use color without meaning.

==================================================
5. TYPOGRAPHY
==================================================

Use:

IBM Plex Sans

or an equivalent professional enterprise sans-serif if the project cannot load IBM Plex Sans.

Prefer:

IBM Plex Sans

Typography must be centralized.

Create typography tokens:

display
heading-xl
heading-lg
heading-md
heading-sm
body-lg
body
body-sm
caption
label
button

Use professional font weights.

Large headings should NOT be excessively bold.

Recommended:

Display:
42–60px
weight 300–400

Page heading:
28–36px
weight 400

Section heading:
20–24px
weight 500

Body:
14–16px
weight 400

Metadata:
12–14px

Buttons:
14px

Maintain consistent line-height.

Do not use decorative fonts.

Do not use cartoon fonts.

Do not use overly heavy typography.

==================================================
6. SPACING SYSTEM
==================================================

Use a 4px spacing grid.

Create tokens:

4px
8px
12px
16px
24px
32px
48px
64px
96px

All layouts must use the spacing system.

Do NOT randomly use:

17px
19px
27px
31px
etc.

unless absolutely required.

Create predictable spacing between:

page title
description
filters
cards
tables
charts
sections

==================================================
7. BORDER RADIUS
==================================================

Use professional enterprise geometry.

Default:

border-radius: 0px

Cards:
0px

Buttons:
0px

Inputs:
0px

Tables:
0px

Panels:
0px

Small status indicators may use subtle 2–4px rounding only when necessary.

Do NOT use:

- pill buttons
- huge rounded cards
- 20px rounded containers
- excessive circular UI

The interface should feel engineered rather than playful.

==================================================
8. GLOBAL APPLICATION LAYOUT
==================================================

Create a consistent enterprise application shell.

Desktop:

------------------------------------------------
| Sidebar | Top Application Bar                |
|         |------------------------------------|
|         | Page Header                         |
|         |------------------------------------|
|         | Content                            |
|         |                                    |
|         |                                    |
------------------------------------------------

SIDEBAR:

Fixed left navigation.

Professional compact layout.

Sections:

OVERVIEW

Dashboard Overview

PATIENT INTELLIGENCE

Patients Directory
Appointments Schedule
Model Predictions

OPERATIONS

Waiting Time Analytics
Scheduling Risk
Clinic Utilization
Doctor Workload

SYSTEM & REPORTING

Advanced Analytics
Reports
System Settings

Do not use emoji icons.

Use a professional icon library such as:

Lucide React

or the project's existing icon library.

Icons must be:

- consistent
- thin/medium stroke
- same visual family
- approximately 18–20px

Never use emojis as icons.

==================================================
9. SIDEBAR DESIGN
==================================================

Sidebar:

Width:
240–260px desktop.

Background:
white or very light neutral.

Right border:
1px solid border color.

Navigation items:

height:
40–48px

Padding:
12–16px

Active item:

Use subtle primary-color background.

Use primary-color indicator on the left.

Example:

| active navigation
| Dashboard Overview

Do NOT create giant blue blocks.

Inactive:

neutral text.

Hover:

light gray background.

Selected:

light primary tint + primary text.

==================================================
10. TOP APPLICATION BAR
==================================================

Create a professional application header.

Left:

Application name:

Healthcare Intelligence

Optional small system/environment label:

Operations Platform

Center/right:

Clinic selector
Search
Notifications
User menu

Avoid excessive UI.

Header height:

56–64px.

Use subtle bottom border.

Do not use gradients.

==================================================
11. PAGE HEADER SYSTEM
==================================================

Every page must have a consistent header.

Example:

Healthcare Intelligence
Operations / Dashboard

Operational Command Center

Enterprise operational metrics for appointment volume, waiting time,
no-show probability, clinic utilization, and doctor workload.

Actions:

Date range
Clinic
Export
Refresh

Page title must be visually dominant.

Description must be smaller and muted.

Do not use huge marketing-style headings.

==================================================
12. DASHBOARD DESIGN
==================================================

Redesign the dashboard completely.

Top:

Breadcrumb / section label

Page title

Description

Global filters

Then:

KEY OPERATIONAL METRICS

Use professional metric cards.

Example:

TOTAL APPOINTMENTS
110,527

27 tracking days

PREDICTED NO-SHOWS
783

Probability ≥ 50%

AVERAGE WAITING TIME
48 min

Model estimate

HIGH-RISK APPOINTMENTS
10,430

Scheduling risk

CLINIC UTILIZATION
40%

Capacity average

DOCTOR WORKLOAD
0.40

Average active load

Cards should:

- use white background
- have 1px border
- no large shadows
- have consistent height
- have consistent padding
- use small semantic indicator
- have clear metric hierarchy
- have concise metadata

Do not create colorful rainbow cards.

Only use semantic accent indicators.

==================================================
13. DATA VISUALIZATION SYSTEM
==================================================

This is extremely important.

EVERY chart must be understandable without guessing.

Every chart MUST have:

1. Clear title
2. Clear subtitle
3. X-axis label
4. Y-axis label
5. Appropriate tick values
6. Units
7. Legend when necessary
8. Tooltip
9. Accessible labels
10. Meaningful color semantics

Example:

Appointment Volume

X-axis:
Date

Y-axis:
Appointments

No-show Rate Trend

X-axis:
Date

Y-axis:
No-show Rate (%)

Waiting Time

X-axis:
Date

Y-axis:
Average Waiting Time (minutes)

Clinic Utilization

X-axis:
Clinic

Y-axis:
Utilization (%)

Doctor Workload

X-axis:
Doctor

Y-axis:
Active Appointments

Never leave charts with unexplained axes.

==================================================
14. CHART DESIGN
==================================================

Charts should look like professional enterprise analytics.

Use:

- subtle grid lines
- restrained colors
- clear axis labels
- readable typography
- clean tooltips
- consistent chart height
- responsive containers

Do NOT use:

- 3D charts
- unnecessary gradients
- glowing charts
- decorative backgrounds
- excessive colors
- giant legends
- pie charts when a bar chart is clearer

Use charts based on information type.

Line chart:
Trends over time

Bar chart:
Comparison

Horizontal bar:
Rankings

Donut:
Part-to-whole only when useful

Area:
Use sparingly

==================================================
15. CHART COLOR SEMANTICS
==================================================

Do not assign random colors.

Example:

Appointment volume:
Primary blue

Waiting time:
Neutral/dark gray or primary

Low risk:
Green

Medium risk:
Amber

High risk:
Red

Utilization:
Primary blue

Capacity warning:
Amber

Critical capacity:
Red

Doctor workload:
Neutral gray with primary highlight for selected/critical values

If multiple series exist, create a documented series palette.

==================================================
16. LOADING SYSTEM
==================================================

This is REQUIRED.

Every page must have professional skeleton loading.

NEVER show:

"Loading..."

as the only loading state.

NEVER show a blank white page.

Create reusable:

<Skeleton />

<PageSkeleton />

<DashboardSkeleton />

<TableSkeleton />

<ChartSkeleton />

<CardSkeleton />

<ProfileSkeleton />

etc.

Skeletons must match the actual layout.

Example:

Dashboard loading:

- title skeleton
- subtitle skeleton
- filter skeleton
- six metric-card skeletons
- chart skeletons
- table skeleton

Patients page:

- page header skeleton
- filter skeleton
- table skeleton

Model Predictions:

- model summary skeleton
- prediction cards skeleton
- prediction table skeleton

Skeleton animation must be subtle.

No flashy animation.

==================================================
17. ERROR STATES
==================================================

Create professional error states.

Never display raw:

"AxiosError"
"500"
"undefined"
"Something went wrong"

to users.

Create:

<ErrorState />

Example:

Unable to load appointment data

We couldn't retrieve the latest appointment information.

[Retry]

For API errors:

log technical details internally.

Show human-readable message to user.

==================================================
18. EMPTY STATES
==================================================

Create reusable:

<EmptyState />

Examples:

No appointments found

There are no appointments matching the selected filters.

[Clear filters]

No predictions available

The prediction model has not generated results for this period.

==================================================
19. TABLE DESIGN
==================================================

All tables must look like enterprise data tables.

Use:

- clear column headers
- subtle borders
- compact rows
- hover state
- pagination
- sorting
- filtering
- empty state
- loading state
- responsive behavior

Example:

PATIENT
APPOINTMENT DATE
CLINIC
DOCTOR
WAITING TIME
NO-SHOW PROBABILITY
RISK
STATUS

Use semantic status colors.

Do not color entire rows unnecessarily.

Use small status indicators.

==================================================
20. PATIENT DIRECTORY
==================================================

Redesign Patients Directory.

Header:

Patients Directory

Search:
Search patient records

Filters:

Clinic
Appointment status
Risk level
Date range

Table:

Patient ID
Appointment
Clinic
Doctor
Appointment Date
Waiting Time
No-show Probability
Risk
Status

Use pagination.

Add:

View details

Do not expose unnecessary sensitive information.

==================================================
21. APPOINTMENTS PAGE
==================================================

Create a professional appointment operations page.

Include:

Date range

Clinic selector

Doctor selector

Status filter

Risk filter

Search

Main table.

Add optional calendar/list toggle if existing backend supports it.

Do not invent backend functionality.

If a feature does not exist in the backend:

create the UI only if it can safely be implemented without breaking existing architecture, otherwise leave a clean extension point.

==================================================
22. MODEL PREDICTIONS PAGE
==================================================

This is one of the most important pages.

It should communicate AI/ML results professionally.

Page title:

Model Predictions

Sections:

MODEL STATUS

Waiting Time Model

No-show Prediction Model

Scheduling Risk Model

Each model should display:

Model name
Status
Last trained
Prediction target
Performance metrics

Example:

Waiting Time Model

MAE
2.41 min

RMSE
3.02 min

R²
0.991

Use clean metric presentation.

Do not make the AI look magical.

The UI should communicate that predictions are data-driven estimates.

==================================================
23. WAITING TIME ANALYTICS
==================================================

Create a professional analytics page.

Top metrics:

Average Waiting Time
Median Waiting Time
Maximum Waiting Time
Patients Served

Charts:

Waiting time trend

X:
Date

Y:
Waiting Time (minutes)

Waiting time distribution

X:
Waiting Time (minutes)

Y:
Patients

Clinic comparison:

X:
Clinic

Y:
Average Waiting Time (minutes)

Doctor workload relationship:

X:
Doctor Load

Y:
Waiting Time (minutes)

Add explanatory descriptions.

==================================================
24. SCHEDULING RISK
==================================================

Create a professional risk monitoring interface.

Top:

Risk Overview

Metrics:

High Risk
Medium Risk
Low Risk
Total Appointments

Risk distribution chart.

Use:

Green = low
Amber = medium
Red = high

Create risk table:

Appointment
Clinic
Doctor
Time
Risk Score
Risk Level
Reason

Do not use color everywhere.

Only risk fields should carry semantic color.

==================================================
25. CLINIC UTILIZATION
==================================================

Create a professional operational analytics page.

Metrics:

Average Utilization
Highest Utilization
Lowest Utilization
Total Clinics

Main visualization:

Clinic Utilization

X:
Clinic

Y:
Utilization (%)

Clearly display percentage.

Important:

Utilization values must be logically validated.

Never allow impossible percentages such as 170% unless the metric definition explicitly supports over-capacity.

If backend data produces >100% utilization:

do NOT silently hide it.

Display an appropriate capacity interpretation or flag the data quality issue.

==================================================
26. DOCTOR WORKLOAD
==================================================

Create:

Doctor Workload Analytics

Metrics:

Average Load
Highest Load
Active Appointments
Doctors

Charts:

Doctor workload distribution

X:
Doctor

Y:
Active Appointments

Workload trend:

X:
Date

Y:
Average Doctor Load

Use neutral visual treatment.

Highlight only doctors requiring attention.

==================================================
27. CLINICS DIRECTORY
==================================================

Create enterprise clinic directory.

Each clinic should show:

Clinic ID
Clinic name
Doctors
Appointments
Utilization
Average waiting time
Risk status

Use table/list structure.

Do not use giant colorful cards.

==================================================
28. ADVANCED ANALYTICS
==================================================

Create an advanced analytics workspace.

Possible sections based ONLY on existing backend/API data:

Appointment Trends

Waiting Time Analysis

No-show Analysis

Clinic Performance

Doctor Workload

Risk Analysis

Model Performance

Use tabs or a clean section navigation.

Do not fabricate metrics.

Only display values returned by the backend.

==================================================
29. FILTER SYSTEM
==================================================

Create reusable filter components.

Examples:

DateRangeFilter
ClinicFilter
DoctorFilter
RiskFilter
StatusFilter
SearchInput

Filters must have:

- labels
- accessible controls
- clear state
- reset option
- loading state
- responsive behavior

On desktop:

horizontal filter toolbar.

On mobile:

stacked filters or filter drawer.

==================================================
30. BUTTON SYSTEM
==================================================

Create centralized button variants:

Primary
Secondary
Tertiary
Ghost
Danger

Primary:
Main action

Secondary:
Secondary action

Ghost:
Low emphasis

Danger:
Destructive operation

Do not make every button blue.

Do not use pill-shaped buttons.

Button heights should be consistent.

==================================================
31. FORM SYSTEM
==================================================

Create reusable form components:

Input
Select
DatePicker
Search
Textarea
Checkbox
Radio
Toggle

Every field must have:

Label
Input
Helper text when required
Error state

Focus state must be highly visible.

Keyboard navigation must work.

==================================================
32. NOTIFICATION SYSTEM
==================================================

Create professional notifications/toasts.

Types:

Success
Warning
Error
Info

Use semantic colors.

Keep messages short.

Example:

Prediction generated successfully.

Appointment data refreshed.

Unable to load clinic data.

Do not use emoji inside notifications.

==================================================
33. MODALS
==================================================

Create professional modal system.

Use for:

Delete confirmation
Record details
Model information
Export
Configuration

Modal hierarchy:

Title
Description
Content
Actions

Primary action right aligned.

Danger actions must be visually distinct.

==================================================
34. RESPONSIVE DESIGN
==================================================

The application must be fully responsive.

Desktop:
1280px+

Tablet:
768–1279px

Mobile:
320–767px

Desktop:

sidebar visible.

Tablet:

sidebar collapsible.

Mobile:

sidebar becomes drawer.

Tables:

horizontal scrolling or responsive card conversion where appropriate.

Charts:

must resize correctly.

Never allow:

horizontal page overflow
broken cards
overlapping text
cut-off buttons
unreadable charts

==================================================
35. ACCESSIBILITY
==================================================

Implement professional accessibility.

Requirements:

WCAG-conscious contrast.

Keyboard navigation.

Visible focus states.

ARIA labels where necessary.

Semantic HTML.

Proper heading hierarchy.

Buttons must be real buttons.

Links must be real links.

Inputs must have labels.

Charts should provide accessible descriptions.

Do not depend on color alone to communicate risk.

Example:

High Risk
+ red indicator

Medium Risk
+ amber indicator

Low Risk
+ green indicator

==================================================
36. MICRO-INTERACTIONS
==================================================

Use subtle animations only.

Allowed:

- skeleton shimmer
- hover transitions
- focus transitions
- menu transitions
- modal transitions
- table hover
- chart tooltip transitions

Animation duration:

approximately 150–250ms.

Do NOT use:

- bouncing cards
- floating elements
- excessive page animations
- parallax
- spinning decorative elements
- flashy transitions

Enterprise software should feel stable.

==================================================
37. ICON SYSTEM
==================================================

Remove all emojis from the interface.

Do NOT use:

📊
🏥
👨‍⚕️
⚠️
🤖
📅
etc.

Use a professional icon library such as Lucide React.

Icons must communicate meaning.

Examples:

Dashboard:
LayoutDashboard

Patients:
Users

Appointments:
Calendar

Predictions:
Brain / Activity

Waiting:
Clock

Risk:
ShieldAlert

Clinic:
Building2

Doctor:
Stethoscope

Analytics:
ChartNoAxesCombined

Settings:
Settings

Use icons consistently.

==================================================
38. COMPONENT ARCHITECTURE
==================================================

Refactor the frontend into reusable components.

Suggested architecture:

src/

components/

  layout/
    AppShell
    Sidebar
    TopBar
    Breadcrumbs
    PageHeader

  ui/
    Button
    Input
    Select
    Modal
    Badge
    Tooltip
    Skeleton
    EmptyState
    ErrorState
    Spinner

  cards/
    MetricCard
    ModelMetricCard
    RiskCard

  tables/
    DataTable
    Pagination
    TableToolbar

  charts/
    ChartContainer
    LineChart
    BarChart
    DonutChart
    ChartLegend

  filters/
    FilterBar
    DateRangeFilter
    ClinicFilter
    RiskFilter

pages/

  Dashboard
  Patients
  Appointments
  Predictions
  WaitingTime
  SchedulingRisk
  ClinicUtilization
  DoctorWorkload
  Clinics
  AdvancedAnalytics

services/

  api
  appointments
  patients
  predictions
  clinics
  analytics

hooks/

  useAppointments
  usePatients
  usePredictions
  useAnalytics

theme/

  tokens
  typography
  colors

Do not create unnecessary duplication.

==================================================
39. API / BACKEND SAFETY
==================================================

VERY IMPORTANT:

DO NOT modify backend APIs unless absolutely necessary.

Before changing anything:

inspect the existing API architecture.

Understand:

- endpoints
- request format
- response format
- authentication
- error handling
- model prediction endpoints
- database interactions

The redesign must consume the existing backend.

Do not create fake/mock data to make the UI look complete.

Use real API data.

If mock data currently exists:

identify it clearly and replace it with the real API where available.

==================================================
40. DATABASE SAFETY
==================================================

Do not modify MongoDB schema merely for visual purposes.

Do not destroy existing collections.

Do not reset the database.

Do not modify production data.

If additional fields are genuinely required:

first inspect the existing backend models and API.

Only make minimal compatible changes.

==================================================
41. ML MODEL SAFETY
==================================================

Do NOT modify:

waiting-time model logic

no-show model logic

scheduling-risk logic

model files

training logic

prediction calculations

unless explicitly required.

The UI should display the existing model outputs professionally.

Examples:

Waiting Time:

48 min

No-show probability:

72%

Risk:

HIGH

Risk score:

13

Model metrics:

MAE
RMSE
R²

Do not invent ML metrics.

==================================================
42. DATA VALIDATION
==================================================

Before rendering analytics:

validate API data.

Handle:

null
undefined
NaN
empty arrays
negative values
invalid percentages
missing dates
missing clinic IDs

Create formatting utilities:

formatNumber()
formatPercentage()
formatDuration()
formatDate()
formatProbability()

Examples:

110527

should display:

110,527

0.4

should display:

0.40

40

should display:

40%

48

should display:

48 min

==================================================
43. DASHBOARD INFORMATION HIERARCHY
==================================================

The dashboard should answer these questions immediately:

1. How many appointments are being handled?

2. How many no-shows are predicted?

3. How long are patients waiting?

4. Which appointments are high risk?

5. How efficiently are clinics being utilized?

6. How heavily are doctors loaded?

The most important information must appear above the fold.

==================================================
44. VISUAL DENSITY
==================================================

Do not create enormous empty spaces.

Do not compress everything.

Target:

professional enterprise information density.

Cards should be compact.

Charts should have enough space for labels.

Tables should be information dense.

Whitespace should separate hierarchy rather than create emptiness.

==================================================
45. DESIGN CONSISTENCY
==================================================

Every page must look like it belongs to the SAME application.

The following must remain consistent:

Typography
Colors
Spacing
Borders
Buttons
Inputs
Cards
Tables
Charts
Navigation
Page headers
Loading states
Error states
Empty states

Do not redesign each page independently.

Build the design system FIRST.

Then apply it to every page.

==================================================
46. PAGE-BY-PAGE REDESIGN
==================================================

Redesign ALL existing pages.

Do not stop after Dashboard.

Minimum:

Dashboard

Patients Directory

Appointments Schedule

Model Predictions

Waiting Time Analytics

Scheduling Risk

Clinic Utilization

Doctor Workload

Clinics Directory

Advanced Analytics

Settings if present

Authentication pages if present

Every page must have:

- consistent header
- consistent navigation
- consistent spacing
- loading skeleton
- error state
- empty state where relevant
- responsive layout
- professional typography
- proper data visualization
- accessible controls

==================================================
47. AUTHENTICATION UI
==================================================

If login/signup pages exist:

Make them professional and minimal.

Light background.

Professional healthcare intelligence branding.

No giant illustrations.

No gradients.

No emojis.

Clear form hierarchy.

Show:

Healthcare Intelligence

Secure Operations Platform

Use professional typography.

==================================================
48. SEARCH
==================================================

Create a professional global search interface if the current system supports search.

Search placeholder:

Search appointments, patients, clinics...

Use keyboard-accessible search.

Show:

recent searches if supported

results

empty state

loading state

error state

Do not create fake results.

==================================================
49. EXPORT / REPORTING
==================================================

If existing backend supports export:

create professional export controls.

Formats:

CSV
Excel
PDF

only when actually supported.

Do not show buttons for functionality that doesn't exist.

==================================================
50. DESIGN TOKENS
==================================================

Create one source of truth.

Example:

:root {

  --color-background: #ffffff;

  --color-surface: #f4f4f4;

  --color-surface-strong: #e0e0e0;

  --color-border: #dcdcdc;

  --color-border-strong: #8d8d8d;

  --color-text-primary: #161616;

  --color-text-secondary: #525252;

  --color-text-muted: #8d8d8d;

  --color-primary: #0f62fe;

  --color-primary-hover: #0353e9;

  --color-success: #198038;

  --color-warning: #f1c21b;

  --color-danger: #da1e28;

  --color-info: #0f62fe;

  --radius-none: 0px;

  --radius-small: 2px;

  --spacing-1: 4px;

  --spacing-2: 8px;

  --spacing-3: 12px;

  --spacing-4: 16px;

  --spacing-5: 24px;

  --spacing-6: 32px;

  --spacing-7: 48px;

  --spacing-8: 64px;

}

Adjust values if necessary to fit the existing technology.

==================================================
51. IMPORTANT: DO NOT MAKE IT LOOK LIKE A TEMPLATE
==================================================

Avoid common AI-generated dashboard patterns.

DO NOT use:

- giant rounded cards
- gradients everywhere
- excessive glass effects
- floating blobs
- huge colorful icons
- emoji icons
- random purple/pink/green cards
- excessive shadows
- giant centered dashboards
- meaningless decorative graphics
- "AI magic" visual effects
- unnecessary badges
- excessive pills

The application must look like a serious enterprise system.

==================================================
52. PROFESSIONAL DATA LANGUAGE
==================================================

Use precise terminology.

Instead of:

"Wow! Your clinic is doing great!"

Use:

"Clinic utilization is within the target operating range."

Instead of:

"AI says this patient might not come!"

Use:

"Predicted no-show probability: 72%."

Instead of:

"Super busy doctor"

Use:

"High workload."

Instead of:

"Everything looks good"

Use:

"No operational exceptions detected."

The interface must sound professional.

==================================================
53. UX DETAILS
==================================================

Add:

- hover states
- focus states
- disabled states
- loading states
- error states
- empty states
- success feedback
- confirmation dialogs
- keyboard navigation
- responsive behavior

Every interactive component must have:

default
hover
focus
active
disabled
loading

where appropriate.

==================================================
54. PERFORMANCE
==================================================

Do not sacrifice performance for visual effects.

Use:

lazy loading where appropriate

memoization where useful

efficient API requests

chart rendering optimization

pagination for large datasets

virtualization only when necessary

Do not reload entire pages unnecessarily.

==================================================
55. CODE QUALITY
==================================================

Write production-quality code.

Requirements:

- clean component architecture
- reusable components
- no unnecessary duplication
- no dead code
- no console errors
- no React warnings
- no broken imports
- no unused variables
- proper TypeScript types if project uses TypeScript
- proper error handling
- clean naming
- maintainable structure

Do not write giant 1000-line components.

Break complex pages into components.

==================================================
56. IMPLEMENTATION PROCESS
==================================================

Do NOT immediately start changing random files.

First inspect the entire existing frontend.

Identify:

1. framework
2. routing
3. component architecture
4. styling system
5. API layer
6. authentication
7. existing pages
8. chart library
9. state management
10. backend API structure

Then create an implementation plan.

After understanding the application:

STEP 1

Create the design token system.

STEP 2

Create typography system.

STEP 3

Create global layout.

STEP 4

Create Sidebar.

STEP 5

Create TopBar.

STEP 6

Create PageHeader.

STEP 7

Create Button/Input/Select components.

STEP 8

Create MetricCard.

STEP 9

Create Skeleton system.

STEP 10

Create ErrorState and EmptyState.

STEP 11

Create DataTable.

STEP 12

Create ChartContainer.

STEP 13

Create standardized charts.

STEP 14

Redesign Dashboard.

STEP 15

Redesign every remaining page.

STEP 16

Apply responsive design.

STEP 17

Run build.

STEP 18

Fix all errors.

STEP 19

Check every route.

STEP 20

Perform final visual consistency audit.

==================================================
57. IMPORTANT: INSPECT BEFORE MODIFYING
==================================================

Before modifying code:

inspect the existing project files.

Do not assume:

- React version
- Tailwind version
- API endpoints
- backend structure
- component names
- chart library
- authentication implementation

Determine them from the actual project.

Do not delete existing functionality just because it is implemented differently from your preferred architecture.

Refactor carefully.

==================================================
58. NO MOCK DATA
==================================================

This is critical.

Do NOT create fake:

patients
appointments
clinics
doctors
predictions
waiting times
risk scores
model metrics

just to make the dashboard look better.

Use actual API data.

If API data is unavailable:

show a proper empty/error state.

==================================================
59. FINAL VISUAL QUALITY CHECK
==================================================

Before finishing, inspect every page.

Ask:

Does this look like professional enterprise healthcare software?

Are the colors meaningful?

Are charts understandable?

Are X and Y axes labeled?

Are units displayed?

Are loading skeletons present?

Are errors handled?

Are empty states handled?

Are buttons consistent?

Are cards consistent?

Are fonts consistent?

Are spacing values consistent?

Are there any emojis?

Are there any unnecessary gradients?

Are there any excessive rounded cards?

Are there any random colors?

Are there any console errors?

Are there any layout issues?

Are there any mobile issues?

Are there any fake values?

Fix everything found.

==================================================
60. FINAL REQUIREMENT
==================================================

The final application should feel like:

"Healthcare Operations Intelligence Platform"

not:

"AI Dashboard Template"

The user should immediately understand:

- operational status
- appointment volume
- patient waiting time
- no-show predictions
- scheduling risk
- clinic utilization
- doctor workload
- ML model performance

The interface should be:

LIGHT
PRECISE
CALM
DATA-DRIVEN
ACCESSIBLE
RESPONSIVE
ENTERPRISE
PROFESSIONAL

Use the provided DESIGN.md as the foundational design reference.

Do not blindly copy it.

Adapt its principles into a healthcare intelligence product.

Most importantly:

DO NOT BREAK EXISTING FUNCTIONALITY.

DO NOT INVENT DATA.

DO NOT USE EMOJIS.

DO NOT USE DARK UI AS THE PRIMARY THEME.

DO NOT USE RANDOM COLORS.

DO NOT LEAVE CHARTS WITHOUT AXIS LABELS.

DO NOT SHOW BLANK SCREENS DURING API LOADING.

DO NOT USE "Loading..." AS THE ONLY LOADING STATE.

DO NOT CREATE A GENERIC AI-GENERATED DASHBOARD.

BUILD A COHERENT, PRODUCTION-QUALITY ENTERPRISE HEALTHCARE INTELLIGENCE DESIGN SYSTEM AND APPLY IT CONSISTENTLY ACROSS THE ENTIRE APPLICATION.