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
        <div className="max-w-7xl mx-auto px-4">
          {/* 상단 행: 로고 + 게임입력 버튼 */}
          <div className="flex items-center justify-between h-14">
            <NavLink to="/" className="text-violet-400 font-bold tracking-tight shrink-0">
              <span className="text-base sm:text-lg">🪐 가이아 전적사이트</span>
            </NavLink>
            {/* 데스크탑 네비 */}
            <div className="hidden sm:flex items-center gap-1 flex-1 mx-4">
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
              className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              + 게임 입력
            </NavLink>
          </div>
          {/* 모바일 하단 네비 */}
          <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
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
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
