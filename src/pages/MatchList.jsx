import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FactionBadge from '../components/FactionBadge'
import RankBadge from '../components/RankBadge'
import LoadingSpinner from '../components/LoadingSpinner'

function groupByMatch(rows) {
  const map = {}
  for (const row of rows) {
    if (!map[row.match_id]) {
      map[row.match_id] = { match_id: row.match_id, played_at: row.played_at, memo: row.memo, players: [] }
    }
    map[row.match_id].players.push(row)
  }
  return Object.values(map).sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
}

export default function MatchList() {
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('match_results_view')
        .select('match_id, played_at, memo, player_name, faction_name, faction_name_ko, final_score, total_score, bid_score, rank')
        .order('played_at', { ascending: false })
      setMatches(groupByMatch(data ?? []))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">게임 목록</h1>
          <p className="text-slate-400 text-sm mt-1">총 {matches.length}게임</p>
        </div>
        <Link
          to="/new-match"
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + 게임 입력
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {matches.length === 0 ? (
          <p className="py-16 text-center text-slate-500">게임 기록이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-3 sm:px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium w-24">날짜</th>
                  <th className="text-center px-2 sm:px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium w-10">순위</th>
                  <th className="text-left px-2 sm:px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">플레이어</th>
                  <th className="text-left px-2 sm:px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">종족</th>
                  <th className="hidden sm:table-cell text-right px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium w-14">총점</th>
                  <th className="hidden sm:table-cell text-right px-3 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium w-14">비딩</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium w-14">최종</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => {
                  const sorted = [...match.players].sort((a, b) => a.rank - b.rank)
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
                        <td className="px-3 sm:px-5 py-2 align-top pt-3" rowSpan={sorted.length}>
                          <Link
                            to={`/matches/${match.match_id}`}
                            className="text-xs text-slate-300 hover:text-violet-300 transition-colors block whitespace-nowrap"
                          >
                            {match.played_at}
                          </Link>
                          {match.memo && (
                            <span className="text-xs text-slate-600 block mt-0.5 max-w-[80px] truncate">{match.memo}</span>
                          )}
                        </td>
                      ) : null}
                      <td className="px-2 sm:px-3 py-2 text-center">
                        <RankBadge rank={p.rank} />
                      </td>
                      <td className={`px-2 sm:px-3 py-2 font-medium whitespace-nowrap ${p.rank === 1 ? 'text-yellow-300' : 'text-slate-100'}`}>
                        {p.player_name}
                      </td>
                      <td className="px-2 sm:px-3 py-2">
                        <FactionBadge name={p.faction_name} nameKo={p.faction_name_ko} />
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 text-right text-slate-400">{p.total_score}</td>
                      <td className="hidden sm:table-cell px-3 py-2 text-right text-slate-500">{p.bid_score}</td>
                      <td className="px-3 sm:px-5 py-2 text-right font-semibold text-slate-100">{p.final_score}</td>
                    </tr>
                  ))
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
