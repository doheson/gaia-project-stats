import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

const SORT_OPTIONS = [
  { key: 'wins',            label: '우승 수',     desc: true },
  { key: 'win_rate',        label: '승률',        desc: true },
  { key: 'total_games',     label: '게임 수',     desc: true },
  { key: 'avg_final_score', label: '평균 최종점수', desc: true },
  { key: 'avg_rank',        label: '평균 순위',   desc: false },
]

export default function Players() {
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState([])
  const [sortKey, setSortKey] = useState('wins')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('player_stats_view').select('*')
      setPlayers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const sorted = [...players].sort((a, b) => {
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
    return sortDesc ? -diff : diff
  })

  function handleSort(key, defaultDesc) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(defaultDesc) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">플레이어</h1>
        <p className="text-slate-400 text-sm mt-1">총 {players.length}명</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">#</th>
                <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">플레이어</th>
                {SORT_OPTIONS.map(opt => (
                  <th
                    key={opt.key}
                    className="text-right px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium cursor-pointer hover:text-violet-300 transition-colors select-none"
                    onClick={() => handleSort(opt.key, opt.desc)}
                  >
                    {opt.label}
                    {sortKey === opt.key && (
                      <span className="ml-1 text-violet-400">{sortDesc ? '↓' : '↑'}</span>
                    )}
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">최고점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.map((p, i) => (
                <tr key={p.player_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-slate-600">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <Link
                      to={`/players/${p.player_id}`}
                      className="font-medium text-slate-100 hover:text-violet-300 transition-colors"
                    >
                      {p.player_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{p.wins}</td>
                  <td className="px-4 py-3.5 text-right text-violet-400 font-medium">{p.win_rate}%</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{p.total_games}</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{p.avg_final_score}</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{p.avg_rank}</td>
                  <td className="px-5 py-3.5 text-right text-slate-100 font-medium">{p.best_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
