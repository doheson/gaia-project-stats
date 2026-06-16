import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/',              label: '대시보드', end: true },
  { to: '/matches',       label: '게임 목록' },
  { to: '/players',       label: '플레이어' },
  { to: '/factions',      label: '통계' },
  { to: '/hall-of-fame',  label: '🏆 명예의 전당' },
  { to: '/faction-info',  label: '📋 종족 정보' },
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
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-center">
          <a
            href="https://github.com/doheson/gaia-project-stats"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            github.com/doheson/gaia-project-stats
          </a>
        </div>
      </footer>
    </div>
  )
}
