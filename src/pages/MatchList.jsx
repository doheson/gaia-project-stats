import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCurrentSeason, applySeasonFilter, getSeasonLabel } from '../lib/seasons'
import FactionBadge from '../components/FactionBadge'
import RankBadge from '../components/RankBadge'
import SeasonFilter from '../components/SeasonFilter'
import LoadingSpinner from '../components/LoadingSpinner'

function groupByMatch(rows) {
  const map = {}
  for (const row of rows) {
    if (!map[row.match_id]) {
      map[row.match_id] = { match_id: row.match_id, played_at: row.played_at, created_at: row.created_at, memo: row.memo, players: [] }
    }
    map[row.match_id].players.push(row)
  }
  return Object.values(map).sort((a, b) => {
    const dateDiff = new Date(b.played_at) - new Date(a.played_at)
    if (dateDiff !== 0) return dateDiff
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export default function MatchList() {
  const [season, setSeason] = useState(getCurrentSeason())
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('match_results_view')
        .select('match_id, played_at, created_at, memo, player_name, faction_name, faction_name_ko, final_score, total_score, bid_score, rank')
        .order('played_at', { ascending: false })
        .order('created_at', { ascending: false })
      query = applySeasonFilter(query, season)
      const { data } = await query
      setMatches(groupByMatch(data ?? []))
      setLoading(false)
    }
    load()
  }, [season])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">게임 목록</h1>
          <p className="text-slate-400 text-sm mt-1">{getSeasonLabel(season)} · 총 {matches.length}게임</p>
        </div>
        <div className="flex items-center gap-3">
          <SeasonFilter value={season} onChange={setSeason} />
          <Link
            to="/new-match"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            + 게임 입력
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? <LoadingSpinner /> : matches.length === 0 ? (
          <p className="py-16 text-center text-slate-500">이 시즌 게임 기록이 없습니다</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-center sm:text-left px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">날짜</th>
                    <th className="text-center px-1 sm:px-3 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">순위</th>
                    <th className="text-left px-1 sm:px-3 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">플레이어</th>
                    <th className="text-left px-1 sm:px-3 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">종족</th>
                    <th className="text-right px-1 sm:px-3 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">총점</th>
                    <th className="text-right px-1 sm:px-3 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">비딩</th>
                    <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">최종</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(match => {
                    const sorted = [...match.players].sort((a, b) => a.rank - b.rank)
                    const [dy, dm, dd] = (match.played_at ?? '').split('-')
                    return sorted.map((p, i) => (
                      <tr
                        key={`${match.match_id}-${p.player_name}`}
                        className={`
                          ${i === 0 ? 'border-t-2 border-slate-700' : 'border-t border-slate-800/60'}
                          ${p.rank === 1 ? 'bg-yellow-500/5' : 'hover:bg-slate-800/30'}
                          transition-colors
                        `}
                      >
                        {i === 0 ? (
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2 align-top pt-2 sm:pt-3 text-center sm:text-left" rowSpan={sorted.length}>
                            <Link
                              to={`/matches/${match.match_id}`}
                              className="text-slate-300 hover:text-violet-300 transition-colors block"
                            >
                              <span className="sm:hidden leading-tight text-center">
                                <span className="block">{dy?.slice(2)}</span>
                                <span className="block text-slate-600">-</span>
                                <span className="block">{dm}</span>
                                <span className="block text-slate-600">-</span>
                                <span className="block">{dd}</span>
                              </span>
                              <span className="hidden sm:inline whitespace-nowrap">{match.played_at}</span>
                            </Link>
                            {match.memo && (
                              <span className="text-slate-600 block mt-0.5 max-w-[60px] sm:max-w-[80px] truncate">{match.memo}</span>
                            )}
                          </td>
                        ) : null}
                        <td className="px-1 sm:px-3 py-1.5 sm:py-2 text-center"><RankBadge rank={p.rank} /></td>
                        <td className={`px-1 sm:px-3 py-1.5 sm:py-2 font-medium whitespace-nowrap ${p.rank === 1 ? 'text-yellow-300' : 'text-slate-100'}`}>
                          {p.player_name}
                        </td>
                        <td className="px-1 sm:px-3 py-1.5 sm:py-2">
                          <FactionBadge name={p.faction_name} nameKo={p.faction_name_ko} />
                        </td>
                        <td className="px-1 sm:px-3 py-1.5 sm:py-2 text-right text-slate-400">{p.total_score}</td>
                        <td className="px-1 sm:px-3 py-1.5 sm:py-2 text-right text-slate-500">{p.bid_score}</td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right font-semibold text-slate-100">{p.final_score}</td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
