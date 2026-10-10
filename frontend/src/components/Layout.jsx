import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Lightbulb, Map, TrendingUp, Wrench,
  BarChart3, Info, Radio, Menu, X, ChevronRight
} from 'lucide-react'

export const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/streetlights', label: 'Streetlight Registry', icon: Lightbulb },
  { to: '/iot', label: 'IoT Monitor', icon: Radio },
  { to: '/map', label: 'Interactive Map', icon: Map },
  { to: '/predictions', label: 'Predictive Analysis', icon: TrendingUp },
  { to: '/maintenance', label: 'Maintenance Queue', icon: Wrench },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/about', label: 'About', icon: Info },
]

const sideLink = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded transition-colors ${
    isActive
      ? 'bg-[#17365D] text-white'
      : 'text-gray-600 hover:bg-[#E8ECF1] hover:text-[#17365D]'
  }`

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Top Government Header Bar ── */}
      <header className="z-50 border-b-2 border-[#17365D] bg-[#17365D] text-white shadow-md" style={{ position: 'sticky', top: 0 }}>
        <div className="flex items-center justify-between px-4 py-0" style={{ minHeight: '56px' }}>
          {/* Left: Emblem + Branding */}
          <div className="flex items-center gap-3">
            <button
              className="mr-1 rounded p-1 text-white/80 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {/* Ashoka-style emblem placeholder */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold text-sm text-white border border-white/30 select-none">
              🏛
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-wide">SmartStreet</div>
              <div className="text-[11px] text-white/70 hidden sm:block">Municipal Streetlight Monitoring &amp; Predictive Maintenance System</div>
            </div>
          </div>

          {/* Right: Status pill */}
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span className="hidden md:flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              System Operational
            </span>
            <span className="hidden lg:block border-l border-white/20 pl-3">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed inset-y-0 left-0 top-[56px] z-40 flex w-60 flex-col
            border-r border-gray-200 bg-white shadow-sm
            transition-transform lg:translate-x-0 lg:static lg:top-auto lg:inset-y-auto
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <div className="px-3 pt-4 pb-2">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Navigation</p>
          </div>
          <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={sideLink}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-gray-100 px-4 py-3 text-[11px] text-gray-400 leading-relaxed">
            Demo data is <strong className="text-gray-500">synthetic</strong>. Not representative of real streetlight infrastructure.
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 top-[56px] z-30 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Page Content ── */}
        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
