import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { getFaction } from '../lib/factions'
import FactionBadge from '../components/FactionBadge'
import RankBadge from '../components/RankBadge'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CHART_STYLE = {
  cartesian: { strokeDasharray: '3 3', stroke: '#1e293b' },
  axis: { fill: '#64748b', fontSize: 11 },
  tooltip: {
    contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 },
    labelStyle: { color: '#94a3b8' },
  },
}

export default function PlayerDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    async function load() {
      const [statsRes, historyRes] = await Promise.all([
        supabase.from('player_stats_view').select('*').eq('player_id', id).single(),
        supabase
          .from('match_results_view')
          .select('match_id, played_at, faction_name, faction_name_ko, bid_score, total_score, final_score, rank')
          .eq('player_id', id)
          .order('played_at', { ascending: true }),
      ])
      setStats(statsRes.data)
      setHistory(historyRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!stats) return <p className="text-slate-400">플레이어를 찾을 수 없습니다</p>

  // Score history chart data
  const chartData = history.map((h, i) => ({
    game: i + 1,
    date: h.played_at,
    final: h.final_score,
    total: h.total_score,
    bid: h.bid_score,
  }))

  // Faction breakdown
  const factionMap = {}
  for (const h of history) {
    const key = h.faction_name
    if (!factionMap[key]) {
      factionMap[key] = { name: h.faction_name, nameKo: h.faction_name_ko, games: 0, wins: 0, totalFinal: 0, color: '' }
    }
    const f = factionMap[key]
    f.games++
    if (h.rank === 1) f.wins++
    f.totalFinal += h.final_score
    f.color = getFaction(h.faction_name)?.color || '#64748b'
  }
  const factionData = Object.values(factionMap)
    .map(f => ({ ...f, avgFinal: Math.round(f.totalFinal / f.games * 10) / 10 }))
    .sort((a, b) => b.games - a.games)

  const avgFinal = stats.avg_final_score

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/players" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← 목록으로
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-100">{stats.player_name}</h1>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="게임 수" value={stats.total_games} />
        <StatCard title="우승" value={stats.wins} />
        <StatCard title="승률" value={`${stats.win_rate}%`} />
        <StatCard title="평균 최종점수" value={stats.avg_final_score} />
        <StatCard title="최고점" value={stats.best_score} />
      </div>

      {/* Score history chart */}
      {chartData.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">최종점수 추이</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid {...CHART_STYLE.cartesian} />
              <XAxis dataKey="date" tick={CHART_STYLE.axis} />
              <YAxis tick={CHART_STYLE.axis} />
              <Tooltip {...CHART_STYLE.tooltip} formatter={(v, name) => [v, name === 'final' ? '최종점수' : name]} />
              <ReferenceLine y={avgFinal} stroke="#7c3aed" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="final" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Faction usage */}
        {factionData.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">종족별 전적</h2>
            </div>
            {factionData.length > 1 && (
              <div className="p-5 pb-2">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={factionData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid {...CHART_STYLE.cartesian} vertical={false} />
                    <XAxis dataKey="nameKo" tick={{ ...CHART_STYLE.axis, fontSize: 10 }} />
                    <YAxis tick={CHART_STYLE.axis} />
                    <Tooltip
                      {...CHART_STYLE.tooltip}
                      formatter={(v, name) => [v, name === 'avgFinal' ? '평균 최종점수' : name]}
                    />
                    <Bar dataKey="avgFinal" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="divide-y divide-slate-800/60">
              {factionData.map(f => (
                <div key={f.name} className="flex items-center gap-3 px-5 py-2.5">
                  <FactionBadge name={f.name} nameKo={f.nameKo} />
                  <span className="flex-1" />
                  <span className="text-xs text-slate-400">{f.games}게임</span>
                  <span className="text-xs text-yellow-400 w-10 text-right">{f.wins}승</span>
                  <span className="text-xs text-slate-300 w-14 text-right">{f.avgFinal}점</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match history */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">게임 기록</h2>
          </div>
          <div className="divide-y divide-slate-800/60">
            {[...history].reverse().map(h => (
              <Link
                key={h.match_id}
                to={`/matches/${h.match_id}`}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-800/40 transition-colors"
              >
                <span className="text-xs text-slate-500 w-20 shrink-0">{h.played_at}</span>
                <RankBadge rank={h.rank} />
                <FactionBadge name={h.faction_name} nameKo={h.faction_name_ko} />
                <span className="flex-1" />
                <span className="text-xs text-slate-100 font-medium">{h.final_score}</span>
                <span className="text-xs text-slate-600">({h.total_score}-{h.bid_score})</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
