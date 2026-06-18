import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { applySeasonFilter, getSeasonLabel } from '../lib/seasons'
import { aggregateFactionStats, aggregateBidRankStats } from '../lib/stats'
import { getFactionColor } from '../lib/factions'
import { CHART_STYLE } from '../lib/chartStyle'
import { useSeasonFilter } from '../hooks/useSeasonFilter'
import FactionBadge from '../components/FactionBadge'
import SeasonFilter from '../components/SeasonFilter'
import LoadingSpinner from '../components/LoadingSpinner'

const BID_RANK_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

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
  const [season, setSeason] = useSeasonFilter()
  const [loading, setLoading] = useState(true)
  const [factions, setFactions] = useState([])
  const [bidRankStats, setBidRankStats] = useState([])
  const [sortKey, setSortKey] = useState('pick_count')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('match_results_view')
        .select('match_id, faction_name, faction_name_ko, bid_score, total_score, final_score, rank')
      query = applySeasonFilter(query, season)
      const { data } = await query
      setFactions(aggregateFactionStats(data ?? []))
      setBidRankStats(aggregateBidRankStats(data ?? []))
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

          {bidRankStats.some(s => s.count > 0) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">비딩 순위별 승률</h2>
              <p className="text-xs text-slate-500 mb-4">같은 게임 내 bid_score 높은 순 — 비딩 1위가 가장 많이 비딩한 플레이어</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={bidRankStats} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <CartesianGrid {...CHART_STYLE.cartesian} vertical={false} />
                  <XAxis dataKey="label" tick={CHART_STYLE.axis} />
                  <YAxis tick={CHART_STYLE.axis} unit="%" domain={[0, 100]} />
                  <Tooltip {...CHART_STYLE.tooltip} formatter={v => [`${v}%`, '승률']} />
                  <Bar dataKey="win_rate" radius={[3, 3, 0, 0]}>
                    {bidRankStats.map((_, i) => (
                      <Cell key={i} fill={BID_RANK_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-3 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium">비딩 순위</th>
                      <th className="text-right px-3 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium">게임 수</th>
                      <th className="text-right px-3 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium">승률</th>
                      <th className="text-right px-3 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium">평균 비딩</th>
                      <th className="text-right px-3 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium">평균 최종점수</th>
                      <th className="text-right px-3 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium">평균 순위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bidRankStats.map((s, i) => (
                      <tr key={s.bid_rank} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-3 py-2 font-medium" style={{ color: BID_RANK_COLORS[i] }}>{s.label}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{s.count}</td>
                        <td className="px-3 py-2 text-right font-medium" style={{ color: BID_RANK_COLORS[i] }}>{s.win_rate}%</td>
                        <td className="px-3 py-2 text-right text-slate-300">{s.avg_bid_score}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{s.avg_final_score}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{s.avg_rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
