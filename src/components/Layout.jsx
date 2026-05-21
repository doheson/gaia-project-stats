import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/',         label: '대시보드', end: true },
  { to: '/matches',  label: '게임 목록' },
  { to: '/players',  label: '플레이어' },
  { to: '/factions', label: '종족 통계' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-14">
          <NavLink to="/" className="text-violet-400 font-bold text-lg tracking-tight mr-4 shrink-0">
            🪐 가이아 전적사이트
          </NavLink>
          <div className="flex items-center gap-1 flex-1">
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <NavLink
            to="/new-match"
            className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            + 게임 입력
          </NavLink>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
