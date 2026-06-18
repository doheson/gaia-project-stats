import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { applySeasonFilter, getSeasonLabel } from '../lib/seasons'
import { aggregatePlayerStats } from '../lib/stats'
import { useSeasonFilter } from '../hooks/useSeasonFilter'
import SeasonFilter from '../components/SeasonFilter'
import LoadingSpinner from '../components/LoadingSpinner'

const SORT_OPTIONS = [
  { key: 'wins',            label: '우승 수',      desc: true  },
  { key: 'win_rate',        label: '승률',         desc: true  },
  { key: 'total_games',     label: '게임 수',      desc: true  },
  { key: 'avg_final_score', label: '평균 최종점수', desc: true  },
  { key: 'avg_rank',        label: '평균 순위',    desc: false },
]

export default function Players() {
  const [season, setSeason] = useSeasonFilter()
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState([])
  const [sortKey, setSortKey] = useState('wins')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('match_results_view')
        .select('player_id, player_name, faction_name, bid_score, total_score, final_score, rank')
      query = applySeasonFilter(query, season)
      const { data } = await query
      setPlayers(aggregatePlayerStats(data ?? []))
      setLoading(false)
    }
    load()
  }, [season])

  const sorted = [...players].sort((a, b) => {
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
    return sortDesc ? -diff : diff
  })

  function handleSort(key, defaultDesc) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(defaultDesc) }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">플레이어</h1>
          <p className="text-slate-400 text-sm mt-1">{getSeasonLabel(season)} · 총 {players.length}명</p>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/manage-players"
            className="text-sm text-slate-400 hover:text-violet-300 border border-slate-700 hover:border-violet-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            + 플레이어 관리
          </NavLink>
          <SeasonFilter value={season} onChange={setSeason} />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">#</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">플레이어</th>
                    {SORT_OPTIONS.map(opt => (
                      <th
                        key={opt.key}
                        className="text-right px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium cursor-pointer hover:text-violet-300 transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort(opt.key, opt.desc)}
                      >
                        {opt.label}
                        {sortKey === opt.key && (
                          <span className="ml-1 text-violet-400">{sortDesc ? '↓' : '↑'}</span>
                        )}
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">최고점</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sorted.length === 0 && (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-500">이 시즌 기록이 없습니다</td></tr>
                  )}
                  {sorted.map((p, i) => (
                    <tr key={p.player_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{i + 1}</td>
                      <td className="px-3 py-3">
                        <Link
                          to={`/players/${p.player_id}`}
                          className="font-medium text-slate-100 hover:text-violet-300 transition-colors whitespace-nowrap"
                        >
                          {p.player_name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right text-slate-300">{p.wins}</td>
                      <td className="px-3 py-3 text-right text-violet-400 font-medium">{p.win_rate}%</td>
                      <td className="px-3 py-3 text-right text-slate-300">{p.total_games}</td>
                      <td className="px-3 py-3 text-right text-slate-300">{p.avg_final_score}</td>
                      <td className="px-3 py-3 text-right text-slate-300">{p.avg_rank}</td>
                      <td className="px-4 py-3 text-right text-slate-100 font-medium">{p.best_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="sm:hidden text-xs text-slate-600 text-right px-4 py-2">← 좌우로 스크롤</p>
          </>
        )}
      </div>
    </div>
  )
}
