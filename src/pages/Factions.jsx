import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { getCurrentSeason, applySeasonFilter, getSeasonLabel } from '../lib/seasons'
import { aggregateFactionStats } from '../lib/stats'
import { getFactionColor } from '../lib/factions'
import FactionBadge from '../components/FactionBadge'
import SeasonFilter from '../components/SeasonFilter'
import LoadingSpinner from '../components/LoadingSpinner'

const CHART_STYLE = {
  cartesian: { strokeDasharray: '3 3', stroke: '#1e293b' },
  axis: { fill: '#64748b', fontSize: 11 },
  tooltip: {
    contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 },
    labelStyle: { color: '#94a3b8' },
  },
}

const SORT_OPTIONS = [
  { key: 'pick_count',      label: '픽 수',        desc: true  },
  { key: 'win_rate',        label: '승률',         desc: true  },
  { key: 'wins',            label: '우승 수',      desc: true  },
  { key: 'avg_total_score', label: '평균 총점수',  desc: true  },
  { key: 'avg_final_score', label: '평균 최종점수', desc: true  },
  { key: 'avg_bid_score',   label: '평균 비딩',    desc: true  },
  { key: 'avg_rank',        label: '평균 순위',    desc: false },
]

export default function Factions() {
  const [season, setSeason] = useState(getCurrentSeason())
  const [loading, setLoading] = useState(true)
  const [factions, setFactions] = useState([])
  const [sortKey, setSortKey] = useState('pick_count')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('match_results_view')
        .select('faction_name, faction_name_ko, bid_score, total_score, final_score, rank')
      query = applySeasonFilter(query, season)
      const { data } = await query
      setFactions(aggregateFactionStats(data ?? []))
      setLoading(false)
    }
    load()
  }, [season])

  const sorted = [...factions].sort((a, b) => {
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
    return sortDesc ? -diff : diff
  })

  function handleSort(key, defaultDesc) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(defaultDesc) }
  }

  const chartData = [...factions]
    .sort((a, b) => b.win_rate - a.win_rate)
    .map(f => ({
      name: f.faction_name_ko,
      nameEn: f.faction_name,
      win_rate: f.win_rate,
    }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">종족 통계</h1>
          <p className="text-slate-400 text-sm mt-1">{getSeasonLabel(season)}</p>
        </div>
        <SeasonFilter value={season} onChange={setSeason} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {chartData.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">종족별 승률</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: -10 }}>
                  <CartesianGrid {...CHART_STYLE.cartesian} vertical={false} />
                  <XAxis dataKey="name" tick={{ ...CHART_STYLE.axis, fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
                  <YAxis tick={CHART_STYLE.axis} unit="%" />
                  <Tooltip {...CHART_STYLE.tooltip} formatter={v => [`${v}%`, '승률']} />
                  <Bar dataKey="win_rate" radius={[3, 3, 0, 0]}>
                    {chartData.map(entry => (
                      <Cell key={entry.nameEn} fill={getFactionColor(entry.nameEn)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {factions.length === 0 ? (
              <p className="py-16 text-center text-slate-500">이 시즌 기록이 없습니다</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">종족</th>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sorted.map(f => (
                        <tr key={f.faction_name} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <FactionBadge name={f.faction_name} nameKo={f.faction_name_ko} />
                          </td>
                          <td className="px-3 py-3 text-right text-slate-300">{f.pick_count}</td>
                          <td className="px-3 py-3 text-right text-violet-400 font-medium">{f.win_rate}%</td>
                          <td className="px-3 py-3 text-right text-slate-300">{f.wins}</td>
                          <td className="px-3 py-3 text-right text-slate-300">{f.avg_total_score}</td>
                          <td className="px-3 py-3 text-right text-slate-300">{f.avg_final_score}</td>
                          <td className="px-3 py-3 text-right text-slate-300">{f.avg_bid_score}</td>
                          <td className="px-3 py-3 text-right text-slate-300">{f.avg_rank}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="sm:hidden text-xs text-slate-600 text-right px-4 py-2">← 좌우로 스크롤</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
