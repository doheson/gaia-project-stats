import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { aggregatePlayerStats } from '../lib/stats'
import FactionBadge from '../components/FactionBadge'
import LoadingSpinner from '../components/LoadingSpinner'

function Medal({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-slate-500 text-sm font-medium">{rank}</span>
}

function Th({ children, right }) {
  return (
    <th className={`px-4 py-2 text-xs text-slate-500 font-medium ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

export default function HallOfFame() {
  const [loading, setLoading] = useState(true)
  const [topTotal, setTopTotal]   = useState([])   // 종료점수 개인 top5
  const [topFinal, setTopFinal]   = useState([])   // 최종점수 개인 top5
  const [topWins, setTopWins]     = useState([])   // 우승 횟수 top5
  const [factionBest, setFactionBest] = useState([]) // 종족별 최고 기록

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [totalRes, finalRes, allRes] = await Promise.all([
        supabase
          .from('match_results_view')
          .select('player_name, faction_name, faction_name_ko, total_score, final_score, played_at')
          .order('total_score', { ascending: false })
          .limit(5),
        supabase
          .from('match_results_view')
          .select('player_name, faction_name, faction_name_ko, total_score, final_score, played_at')
          .order('final_score', { ascending: false })
          .limit(5),
        supabase
          .from('match_results_view')
          .select('player_id, player_name, faction_name, faction_name_ko, bid_score, total_score, final_score, rank'),
      ])

      setTopTotal(totalRes.data ?? [])
      setTopFinal(finalRes.data ?? [])

      const all = allRes.data ?? []

      // 우승 횟수 top5
      const playerStats = aggregatePlayerStats(all)
      setTopWins([...playerStats].sort((a, b) => b.wins - a.wins).slice(0, 5))

      // 종족별: 각 종족의 최고 종료점수 기록 + 최고 최종점수 기록을 따로 계산
      const totalMap = {}  // 종족별 최고 total_score 기록
      const finalMap = {}  // 종족별 최고 final_score 기록
      for (const row of all) {
        const k = row.faction_name
        if (!totalMap[k] || row.total_score > totalMap[k].score) {
          totalMap[k] = { score: row.total_score, player: row.player_name, faction_name: k, faction_name_ko: row.faction_name_ko }
        }
        if (!finalMap[k] || row.final_score > finalMap[k].score) {
          finalMap[k] = { score: row.final_score, player: row.player_name }
        }
      }

      // 두 맵을 합쳐서 종족별 1행으로 만들기, 최고 종료점수 내림차순 정렬
      const factions = Object.keys(totalMap).map(k => ({
        faction_name:    totalMap[k].faction_name,
        faction_name_ko: totalMap[k].faction_name_ko,
        best_total:      totalMap[k].score,
        best_total_by:   totalMap[k].player,
        best_final:      finalMap[k]?.score ?? null,
        best_final_by:   finalMap[k]?.player ?? null,
      }))
      factions.sort((a, b) => b.best_total - a.best_total)
      setFactionBest(factions)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">🏆 명예의 전당</h1>
        <p className="text-slate-400 text-sm mt-1">전체 기간 최고 기록</p>
      </div>

      {/* 상단 3개 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* 종료점수 TOP5 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">🎯 종료점수 TOP 5</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <Th>#</Th>
                <Th>플레이어</Th>
                <Th>종족</Th>
                <Th right>점수</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topTotal.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5"><Medal rank={i + 1} /></td>
                  <td className="px-4 py-2.5 text-slate-200 font-medium whitespace-nowrap">{row.player_name}</td>
                  <td className="px-4 py-2.5"><FactionBadge name={row.faction_name} nameKo={row.faction_name_ko} /></td>
                  <td className="px-4 py-2.5 text-right font-bold text-amber-400">{row.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 최종점수 TOP5 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">⚡ 최종점수 TOP 5</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <Th>#</Th>
                <Th>플레이어</Th>
                <Th>종족</Th>
                <Th right>점수</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topFinal.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5"><Medal rank={i + 1} /></td>
                  <td className="px-4 py-2.5 text-slate-200 font-medium whitespace-nowrap">{row.player_name}</td>
                  <td className="px-4 py-2.5"><FactionBadge name={row.faction_name} nameKo={row.faction_name_ko} /></td>
                  <td className="px-4 py-2.5 text-right font-bold text-violet-400">{row.final_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 우승 횟수 TOP5 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">👑 우승 횟수 TOP 5</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <Th>#</Th>
                <Th>플레이어</Th>
                <Th right>우승</Th>
                <Th right>승률</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topWins.map((p, i) => (
                <tr key={p.player_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5"><Medal rank={i + 1} /></td>
                  <td className="px-4 py-2.5 text-slate-200 font-medium whitespace-nowrap">{p.player_name}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-yellow-400">{p.wins}회</td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{p.win_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 하단: 종족별 최고 기록 통합 테이블 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">🌟 종족별 최고 기록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">#</th>
                <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">종족</th>
                <th className="text-right px-4 py-2.5 text-xs text-amber-500/80 font-medium">최고 종료점수</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-600 font-medium">달성자</th>
                <th className="text-right px-4 py-2.5 text-xs text-violet-400/80 font-medium">최고 최종점수</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-600 font-medium">달성자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {factionBest.map((f, i) => (
                <tr key={f.faction_name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <FactionBadge name={f.faction_name} nameKo={f.faction_name_ko} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-amber-400">{f.best_total}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">{f.best_total_by}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-violet-400">{f.best_final ?? '-'}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">{f.best_final_by ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sm:hidden text-xs text-slate-600 text-right px-4 py-2">← 좌우로 스크롤</p>
      </div>

    </div>
  )
}
