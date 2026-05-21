import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { getFactionColor } from '../lib/factions'
import FactionBadge from '../components/FactionBadge'
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
  { key: 'pick_count',      label: '픽 수',       desc: true },
  { key: 'win_rate',        label: '승률',        desc: true },
  { key: 'wins',            label: '우승 수',     desc: true },
  { key: 'avg_total_score', label: '평균 총점수', desc: true },
  { key: 'avg_final_score', label: '평균 최종점수', desc: true },
  { key: 'avg_bid_score',   label: '평균 비딩',   desc: true },
  { key: 'avg_rank',        label: '평균 순위',   desc: false },
]

export default function Factions() {
  const [loading, setLoading] = useState(true)
  const [factions, setFactions] = useState([])
  const [sortKey, setSortKey] = useState('pick_count')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('faction_stats_view').select('*')
      setFactions(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const sorted = [...factions].sort((a, b) => {
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
    return sortDesc ? -diff : diff
  })

  function handleSort(key, defaultDesc) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(defaultDesc) }
  }

  const chartData = [...factions]
    .filter(f => f.pick_count > 0)
    .sort((a, b) => b.win_rate - a.win_rate)
    .map(f => ({
      name: f.faction_name_ko,
      nameEn: f.faction_name,
      win_rate: parseFloat(f.win_rate) || 0,
    }))

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">종족 통계</h1>
        <p className="text-slate-400 text-sm mt-1">총 {factions.length}종족</p>
      </div>

      {/* Win rate chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">종족별 승률</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: -10 }}>
              <CartesianGrid {...CHART_STYLE.cartesian} vertical={false} />
              <XAxis dataKey="name" tick={{ ...CHART_STYLE.axis, fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={CHART_STYLE.axis} unit="%" />
              <Tooltip
                {...CHART_STYLE.tooltip}
                formatter={v => [`${v}%`, '승률']}
              />
              <Bar dataKey="win_rate" radius={[3, 3, 0, 0]}>
                {chartData.map(entry => (
                  <Cell key={entry.nameEn} fill={getFactionColor(entry.nameEn)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">종족</th>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.filter(f => f.pick_count > 0).map(f => (
                <tr key={f.faction_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <FactionBadge name={f.faction_name} nameKo={f.faction_name_ko} />
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{f.pick_count}</td>
                  <td className="px-4 py-3.5 text-right text-violet-400 font-medium">{f.win_rate}%</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{f.wins}</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{f.avg_total_score}</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{f.avg_final_score}</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{f.avg_bid_score}</td>
                  <td className="px-4 py-3.5 text-right text-slate-300">{f.avg_rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
