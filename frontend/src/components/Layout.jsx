import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Lightbulb, Map, TrendingUp, Wrench, BarChart3, Info, Radio } from 'lucide-react'

export const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/streetlights', label: 'Streetlights', icon: Lightbulb },
  { to: '/iot', label: 'IoT Monitor', icon: Radio },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/about', label: 'About', icon: Info },
]

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-cobalt text-white shadow-sm' : 'text-gray-700 hover:bg-white/70'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen">
      <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-60 flex-col rounded-none border-y-0 border-l-0 p-4 lg:flex">
        <div className="px-2 pb-6 pt-2">
          <div className="text-xl font-semibold tracking-tight">SmartStreet</div>
          <div className="mt-1 text-xs leading-snug text-gray-600">AI-Powered Streetlight Monitoring & Predictive Maintenance</div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkCls}>
              <Icon size={18} strokeWidth={1.8} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-white/60 p-3 text-xs text-gray-600">
          Demo data is <b className="text-ink">synthetic</b>. It does not describe real streetlights.
        </div>
      </aside>

      <header className="glass sticky top-0 z-30 flex items-center gap-1 overflow-x-auto rounded-none border-x-0 border-t-0 px-3 py-2 lg:hidden">
        <span className="mr-2 font-semibold">SmartStreet</span>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkCls} title={label}>
            <Icon size={18} strokeWidth={1.8} /><span className="sr-only">{label}</span>
          </NavLink>
        ))}
      </header>

      <main className="lg:ml-60">
        <Outlet />
      </main>
    </div>
  )
}
