import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCurrentSeason, applySeasonFilter, getSeasonLabel } from '../lib/seasons'
import { aggregatePlayerStats, aggregateFactionStats } from '../lib/stats'
import StatCard from '../components/StatCard'
import FactionBadge from '../components/FactionBadge'
import SeasonFilter from '../components/SeasonFilter'
import LoadingSpinner from '../components/LoadingSpinner'

function groupByMatch(rows) {
  const map = {}
  for (const row of rows) {
    if (!map[row.match_id]) {
      map[row.match_id] = { match_id: row.match_id, played_at: row.played_at, created_at: row.created_at, players: [] }
    }
    map[row.match_id].players.push(row)
  }
  return Object.values(map).sort((a, b) => {
    const dateDiff = new Date(b.played_at) - new Date(a.played_at)
    if (dateDiff !== 0) return dateDiff
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export default function Dashboard() {
  const [season, setSeason] = useState(getCurrentSeason())
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('match_results_view')
        .select('match_id, played_at, created_at, player_id, player_name, faction_name, faction_name_ko, bid_score, total_score, final_score, rank')
        .order('played_at', { ascending: false })
        .order('created_at', { ascending: false })
      query = applySeasonFilter(query, season)
      const { data } = await query
      setRows(data ?? [])
      setLoading(false)
    }
    load()
  }, [season])

  const matches        = groupByMatch(rows)
  const playerStats    = aggregatePlayerStats(rows).sort((a, b) => b.wins - a.wins)
  const factionStats   = aggregateFactionStats(rows).sort((a, b) => b.win_rate - a.win_rate)
  const recentMatches  = matches.slice(0, 5)
  const topPlayer      = playerStats[0]
  const topFaction     = factionStats[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">대시보드</h1>
          <p className="text-slate-400 text-sm mt-1">{getSeasonLabel(season)} 전적 현황</p>
        </div>
        <SeasonFilter value={season} onChange={setSeason} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="총 게임 수" value={matches.length} />
            <StatCard title="플레이어 수" value={playerStats.length} />
            <StatCard
              title="최다 우승"
              value={topPlayer?.player_name ?? '-'}
              sub={topPlayer ? `${topPlayer.wins}승 · 승률 ${topPlayer.win_rate}%` : ''}
            />
            <StatCard
              title="최고 승률 종족"
              value={topFaction?.faction_name_ko ?? '-'}
              sub={topFaction ? `승률 ${topFaction.win_rate}% · ${topFaction.pick_count}픽` : ''}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent matches */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-semibold text-slate-100 text-sm">최근 게임</h2>
                <Link to="/matches" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  전체 보기 →
                </Link>
              </div>
              <div className="divide-y divide-slate-800/60">
                {recentMatches.length === 0 && (
                  <p className="px-5 py-8 text-center text-slate-500 text-sm">이 시즌 게임 기록이 없습니다</p>
                )}
                {recentMatches.map(match => {
                  const winner = match.players.find(p => p.rank === 1)
                  const sorted = [...match.players].sort((a, b) => a.rank - b.rank)
                  return (
                    <Link
                      key={match.match_id}
                      to={`/matches/${match.match_id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="text-xs text-slate-500 w-20 shrink-0">{match.played_at}</span>
                      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                        {sorted.map(p => (
                          <FactionBadge key={p.player_name} name={p.faction_name} nameKo={p.faction_name_ko} />
                        ))}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-yellow-400 font-medium">{winner?.player_name}</p>
                        <p className="text-xs text-slate-500">{winner?.final_score}점</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Player standings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-semibold text-slate-100 text-sm">플레이어 순위</h2>
                <Link to="/players" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  전체 보기 →
                </Link>
              </div>
              <div className="divide-y divide-slate-800/60">
                {playerStats.length === 0 && (
                  <p className="px-5 py-8 text-center text-slate-500 text-sm">기록 없음</p>
                )}
                {playerStats.map((p, i) => (
                  <Link
                    key={p.player_id}
                    to={`/players/${p.player_id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-slate-600 text-sm w-5 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm text-slate-100 min-w-0 truncate">{p.player_name}</span>
                    <span className="text-xs text-slate-400 shrink-0">{p.wins}승</span>
                    <span className="text-xs text-violet-400 w-10 text-right shrink-0">{p.win_rate}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
