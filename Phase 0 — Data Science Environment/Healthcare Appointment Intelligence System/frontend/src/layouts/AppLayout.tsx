import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
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
import { HAILogo } from '@/components/ui/HAILogo'
import type { Clinic, Role } from '@/types'

interface NavGroup {
  title: string
  items: Array<{
    to: string
    label: string
    icon: typeof LayoutDashboard
    matchPaths: string[]
    roles?: Role[]
  }>
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard Overview', icon: LayoutDashboard, matchPaths: ['/'] },
    ],
  },
  {
    title: 'Patient Intelligence',
    items: [
      { to: '/patients', label: 'Patients Directory', icon: Users, matchPaths: ['/patients'] },
      { to: '/appointments', label: 'Appointments Schedule', icon: CalendarClock, matchPaths: ['/appointments'] },
      { to: '/predictions', label: 'Model Predictions', icon: Activity, matchPaths: ['/predictions'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/waiting-time', label: 'Waiting Time Analytics', icon: Clock, matchPaths: ['/waiting-time'] },
      { to: '/scheduling-risk', label: 'Scheduling Risk', icon: ShieldAlert, matchPaths: ['/scheduling-risk'], roles: ['admin', 'doctor'] },
      { to: '/clinic-utilization', label: 'Clinic Utilization', icon: Building2, matchPaths: ['/clinic-utilization'], roles: ['admin'] },
      { to: '/doctors', label: 'Doctor Workload', icon: Stethoscope, matchPaths: ['/doctors'], roles: ['admin', 'doctor'] },
      { to: '/clinics', label: 'Clinics Directory', icon: Building, matchPaths: ['/clinics'], roles: ['admin'] },
    ],
  },
  {
    title: 'System & Reporting',
    items: [
      { to: '/analytics', label: 'Advanced Analytics', icon: ChartNoAxesCombined, matchPaths: ['/analytics'], roles: ['admin'] },
      { to: '/settings', label: 'System Settings', icon: Settings, matchPaths: ['/settings'] },
    ],
  },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [clinicId, setClinicId] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    clinicApi.list().then(setClinics).catch(() => setClinics([]))
  }, [])

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
    <div className="flex min-h-screen bg-background font-sans">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-carbon-gray-20 bg-surface lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:flex ${sidebarOpen ? 'flex' : 'hidden'}`}
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-carbon-gray-20 px-4">
          <HAILogo variant="primary" theme="light" size="md" />
          <button className="p-1 text-carbon-gray-60 hover:bg-carbon-gray-10 hover:text-carbon-gray-100 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pr-0.5 py-3">
          {NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.roles || (user?.role ? item.roles.includes(user.role as Role) : false),
            )
            if (filteredItems.length === 0) return null

            return (
              <div key={group.title} className="mb-4">
                <p className="px-4 pb-1.5 text-xs font-semibold tracking-normal text-carbon-gray-60">{group.title}</p>
                <ul className="space-y-0.5">
                  {filteredItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={closeMenus}
                        className={({ isActive }) =>
                          `relative flex h-10 items-center gap-3 border-l-4 px-4 text-xs font-medium transition-colors ${
                            isActive
                              ? 'border-primary-500 bg-primary-50/70 font-semibold text-primary-600'
                              : 'border-transparent text-carbon-gray-70 hover:bg-carbon-gray-10 hover:text-carbon-gray-100'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="border-t border-carbon-gray-20 bg-carbon-gray-10 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-carbon-gray-90 text-white font-semibold text-xs font-mono">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-carbon-gray-100">{user?.name ?? 'User'}</p>
              <span className="inline-block rounded-none bg-carbon-gray-20 px-1.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-carbon-gray-70">
                {user?.role ?? 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={closeMenus} aria-hidden="true" />}

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-carbon-gray-20 bg-surface px-4 sm:px-6"
        >
          <div className="flex items-center gap-3">
            <button className="p-1 text-carbon-gray-60 hover:bg-carbon-gray-10 hover:text-carbon-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm font-semibold text-carbon-gray-100">Healthcare Intelligence</span>
              <span className="h-4 w-px bg-carbon-gray-20 mx-1" />
              <span className="text-xs text-carbon-gray-60">Operations Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Clinic Filter */}
            <select
              value={clinicId}
              onChange={(event) => setClinicId(event.target.value)}
              className="hidden h-9 rounded-none border border-carbon-gray-30 bg-surface px-2 text-xs text-carbon-gray-100 focus:border-primary-500 focus:outline-none sm:block cursor-pointer"
              aria-label="Select clinic"
            >
              <option value="">All clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.clinic_id}>
                  {clinic.clinic_id} - {clinic.name}
                </option>
              ))}
            </select>

            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="relative" role="search">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-carbon-gray-50" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search appointments..."
                className="h-9 w-36 rounded-none border border-carbon-gray-30 bg-surface pl-8 pr-2 text-xs text-carbon-gray-100 placeholder-carbon-gray-50 focus:border-primary-500 focus:outline-none sm:w-52"
                aria-label="Search"
              />
            </form>

            <button className="relative p-1.5 text-carbon-gray-60 hover:bg-carbon-gray-10 hover:text-carbon-gray-100" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-none p-1 text-carbon-gray-100 hover:bg-carbon-gray-10"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary-500 text-xs font-semibold text-white">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-carbon-gray-60 sm:block" aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-none border border-carbon-gray-20 bg-surface py-1 text-carbon-gray-100 shadow-carbon z-50" role="menu">
                  <div className="px-4 py-2 border-b border-carbon-gray-20">
                    <p className="text-xs font-semibold">{user?.name ?? 'User'}</p>
                    <p className="text-[10px] text-carbon-gray-60 font-mono">{user?.email ?? ''}</p>
                  </div>
                  <Link to="/settings" onClick={closeMenus} className="block px-4 py-2 text-xs text-carbon-gray-70 hover:bg-carbon-gray-10 hover:text-carbon-gray-100" role="menuitem">
                    System Settings
                  </Link>
                  <button
                    onClick={() => {
                      closeMenus()
                      logout()
                    }}
                    className="flex w-full items-center gap-2 border-t border-carbon-gray-20 px-4 py-2 text-left text-xs font-medium text-danger hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet Container */}
        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
          <Outlet context={{ clinics, clinicId, setClinicId }} />
        </main>
      </div>
    </div>
  )
}