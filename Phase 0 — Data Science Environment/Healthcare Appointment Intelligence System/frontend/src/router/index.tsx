import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { RequireAuth, RedirectIfAuthenticated } from '@/auth/RequireAuth'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AppointmentsPage } from '@/pages/AppointmentsPage'
import { PredictionsPage } from '@/pages/PredictionsPage'
import { WaitingTimePage } from '@/pages/WaitingTimePage'
import { SchedulingRiskPage } from '@/pages/SchedulingRiskPage'
import { ClinicUtilizationPage } from '@/pages/ClinicUtilizationPage'
import { PatientsPage } from '@/pages/PatientsPage'
import { PatientDetailPage } from '@/pages/PatientDetailPage'
import { DoctorsPage } from '@/pages/DoctorsPage'
import { DoctorDetailPage } from '@/pages/DoctorDetailPage'
import { ClinicsPage } from '@/pages/ClinicsPage'
import { ClinicDetailPage } from '@/pages/ClinicDetailPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/register',
    element: (
      <RedirectIfAuthenticated>
        <RegisterPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      { path: 'predictions', element: <PredictionsPage /> },
      { path: 'waiting-time', element: <WaitingTimePage /> },
      { path: 'scheduling-risk', element: <SchedulingRiskPage /> },
      { path: 'clinic-utilization', element: <ClinicUtilizationPage /> },
      { path: 'patients', element: <PatientsPage /> },
      { path: 'patients/:id', element: <PatientDetailPage /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      { path: 'clinics', element: <ClinicsPage /> },
      { path: 'clinics/:id', element: <ClinicDetailPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])