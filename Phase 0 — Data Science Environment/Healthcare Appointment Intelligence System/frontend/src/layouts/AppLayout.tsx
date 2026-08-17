import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  Building,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  ChevronDown,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  Stethoscope,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { clinicApi } from '@/services/clinicApi'
import type { Clinic } from '@/types'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, matchPaths: ['/'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarClock, matchPaths: ['/appointments'] },
  { to: '/predictions', label: 'Predictions', icon: Activity, matchPaths: ['/predictions'] },
  { to: '/waiting-time', label: 'Waiting Time', icon: Clock, matchPaths: ['/waiting-time'] },
  { to: '/scheduling-risk', label: 'Scheduling Risk', icon: ShieldAlert, matchPaths: ['/scheduling-risk'] },
  { to: '/clinic-utilization', label: 'Clinic Utilization', icon: Building2, matchPaths: ['/clinic-utilization'] },
  { to: '/patients', label: 'Patients', icon: Users, matchPaths: ['/patients'] },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, matchPaths: ['/doctors'] },
  { to: '/clinics', label: 'Clinics', icon: Building, matchPaths: ['/clinics'] },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined, matchPaths: ['/analytics'] },
  { to: '/settings', label: 'Settings', icon: Settings, matchPaths: ['/settings'] },
]

const TITLES: Record<string, string> = {
  '/': 'Overview',
  '/appointments': 'Appointments',
  '/predictions': 'Predictions',
  '/waiting-time': 'Waiting Time',
  '/scheduling-risk': 'Scheduling Risk',
  '/clinic-utilization': 'Clinic Utilization',
  '/patients': 'Patients',
  '/doctors': 'Doctors',
  '/clinics': 'Clinics',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [clinicId, setClinicId] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    clinicApi.list().then(setClinics).catch(() => setClinics([]))
  }, [])

  const pageTitle = TITLES[location.pathname] ?? 'Healthcare Intelligence'

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!search.trim()) return
    navigate(`/appointments?search=${encodeURIComponent(search.trim())}`)
    setSearch('')
  }

  const closeMenus = () => {
    setSidebarOpen(false)
    setProfileOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border bg-surface lg:static lg:z-auto lg:flex ${sidebarOpen ? 'flex' : 'hidden'}`}
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-700 text-white">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-charcoal">Healthcare Intelligence</p>
            <p className="text-xs text-charcoal-muted">Operations Platform</p>
          </div>
          <button className="ml-auto rounded-md p-1 text-charcoal-muted hover:text-charcoal lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-800'
                        : 'text-charcoal-muted hover:bg-gray-50 hover:text-charcoal'
                    }`
                  }
                >
                  <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-charcoal-muted">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-charcoal">{user?.name ?? 'User'}</p>
              <p className="truncate text-xs capitalize text-charcoal-muted">{user?.role ?? ''}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-charcoal-muted" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeMenus} aria-hidden="true" />}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <button className="rounded-md p-1 text-charcoal-muted hover:text-charcoal lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold tracking-tight text-charcoal">{pageTitle}</h1>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <select
              value={clinicId}
              onChange={(event) => setClinicId(event.target.value)}
              className="hidden h-9 rounded-md border border-border bg-white px-2 text-sm text-charcoal focus:border-primary-600 focus:outline-none sm:block"
              aria-label="Select clinic"
            >
              <option value="">All clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.clinic_id}>
                  {clinic.clinic_id} · {clinic.name}
                </option>
              ))}
            </select>

            <form onSubmit={handleSearch} className="relative" role="search">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search appointments"
                className="h-9 w-36 rounded-md border border-border bg-white pl-8 pr-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:w-56"
                aria-label="Search"
              />
            </form>

            <button className="relative rounded-md p-1.5 text-charcoal-muted hover:bg-gray-100 hover:text-charcoal" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-charcoal-muted">
                  <UserRound className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <ChevronDown className="hidden h-4 w-4 text-charcoal-muted sm:block" aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg" role="menu">
                  <Link to="/settings" onClick={closeMenus} className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50" role="menuitem">
                    Profile
                  </Link>
                  <Link to="/settings" onClick={closeMenus} className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50" role="menuitem">
                    Settings
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      closeMenus()
                      logout()
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet context={{ clinics, clinicId, setClinicId }} />
        </main>
      </div>
    </div>
  )
}