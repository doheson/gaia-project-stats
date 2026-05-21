import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FactionBadge from '../components/FactionBadge'
import RankBadge from '../components/RankBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MatchDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [match, setMatch] = useState(null)

  useEffect(() => {
    async function load() {
      const [resultsRes, matchRes] = await Promise.all([
        supabase
          .from('match_results_view')
          .select('*')
          .eq('match_id', id)
          .order('rank'),
        supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single(),
      ])
      setResults(resultsRes.data ?? [])
      setMatch(matchRes.data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!match) return <p className="text-slate-400">게임을 찾을 수 없습니다</p>

  const winner = results.find(r => r.rank === 1)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/matches" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← 목록으로
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-100">{match.played_at} 게임</h1>
        {match.memo && <p className="text-slate-400 text-sm mt-1">{match.memo}</p>}
      </div>

      {winner && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-yellow-300 font-semibold">{winner.player_name}</p>
            <p className="text-yellow-400/70 text-sm">
              최종 {winner.final_score}점 (총합 {winner.total_score} − 비딩 {winner.bid_score})
            </p>
          </div>
          <FactionBadge name={winner.faction_name} nameKo={winner.faction_name_ko} className="ml-auto" />
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">순위</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">플레이어</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">종족</th>
              <th className="text-right px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">비딩</th>
              <th className="text-right px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">총합</th>
              <th className="text-right px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">최종</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {results.map(r => (
              <tr
                key={r.player_name}
                className={r.rank === 1 ? 'bg-yellow-500/5' : 'hover:bg-slate-800/30'}
              >
                <td className="px-5 py-3.5">
                  <RankBadge rank={r.rank} />
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    to={`/players/${r.player_id}`}
                    className={`font-medium hover:underline ${r.rank === 1 ? 'text-yellow-300' : 'text-slate-100'}`}
                  >
                    {r.player_name}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <FactionBadge name={r.faction_name} nameKo={r.faction_name_ko} />
                </td>
                <td className="px-4 py-3.5 text-right text-slate-400">{r.bid_score}</td>
                <td className="px-4 py-3.5 text-right text-slate-300">{r.total_score}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-slate-100">{r.final_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
