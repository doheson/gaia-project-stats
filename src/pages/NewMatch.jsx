import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getFaction, getFactionColor } from '../lib/factions'
import CustomSelect from '../components/CustomSelect'
import FactionBadge from '../components/FactionBadge'
import RankBadge from '../components/RankBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const today = new Date().toISOString().split('T')[0]

const EMPTY_SLOT = { playerId: '', factionId: '', bidScore: '', finalScore: '' }

export default function NewMatch() {
  const navigate = useNavigate()
  const [loadingData, setLoadingData] = useState(true)
  const [players, setPlayers] = useState([])
  const [factions, setFactions] = useState([])
  const [playedAt, setPlayedAt] = useState(today)
  const [memo, setMemo] = useState('')
  const [slots, setSlots] = useState([EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT].map(s => ({ ...s })))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const [pRes, fRes] = await Promise.all([
        supabase.from('players').select('id, name').order('name'),
        supabase.from('factions').select('id, name, name_ko, code').order('name_ko'),
      ])
      setPlayers(pRes.data ?? [])
      setFactions(fRes.data ?? [])
      setLoadingData(false)
    }
    load()
  }, [])

  // Computed values per slot
  const computed = slots.map(s => {
    const bid = parseInt(s.bidScore) || 0
    const final = parseInt(s.finalScore) || 0
    return { bid, final, total: bid + final }
  })

  // Auto-rank: sort by final desc, total desc as tiebreaker
  const ranks = (() => {
    const withIdx = computed.map((c, i) => ({ ...c, i }))
    withIdx.sort((a, b) => b.final - a.final || b.total - a.total)
    const r = new Array(4).fill(0)
    withIdx.forEach((c, pos) => { r[c.i] = pos + 1 })
    return r
  })()

  function updateSlot(idx, field, value) {
    setSlots(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
    setError('')
  }

  function validate() {
    const issues = []
    if (slots.some(s => !s.playerId)) issues.push('플레이어 4명을 모두 선택해주세요')
    if (slots.some(s => !s.factionId)) issues.push('종족 4개를 모두 선택해주세요')
    const pIds = slots.map(s => s.playerId).filter(Boolean)
    if (new Set(pIds).size !== pIds.length) issues.push('중복된 플레이어가 있습니다')
    const fIds = slots.map(s => s.factionId).filter(Boolean)
    if (new Set(fIds).size !== fIds.length) issues.push('중복된 종족이 있습니다')
    if (slots.some(s => s.finalScore === '')) issues.push('최종 점수를 모두 입력해주세요')
    return issues
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const issues = validate()
    if (issues.length) { setError(issues.join(' · ')); return }

    setSubmitting(true)
    setError('')

    const { data: match, error: matchErr } = await supabase
      .from('matches')
      .insert({ played_at: playedAt, memo: memo.trim() || null })
      .select()
      .single()

    if (matchErr) { setError(matchErr.message); setSubmitting(false); return }

    const results = slots.map((s, i) => ({
      match_id: match.id,
      player_id: s.playerId,
      faction_id: parseInt(s.factionId),
      bid_score: computed[i].bid,
      total_score: computed[i].total,
      rank: ranks[i],
    }))

    const { error: rErr } = await supabase.from('match_results').insert(results)
    if (rErr) {
      // Rollback match on error
      await supabase.from('matches').delete().eq('id', match.id)
      setError(rErr.message)
      setSubmitting(false)
      return
    }

    navigate(`/matches/${match.id}`)
  }

  if (loadingData) return <LoadingSpinner />

  const usedPlayerIds = slots.map(s => s.playerId).filter(Boolean)
  const usedFactionIds = slots.map(s => s.factionId).filter(Boolean)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">게임 입력</h1>
        <p className="text-slate-400 text-sm mt-1">새 게임 결과를 기록합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date + Memo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">날짜</label>
              <input
                type="date"
                value={playedAt}
                onChange={e => setPlayedAt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">메모 (선택)</label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="예: 정규 모임"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Player slots */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">플레이어 정보</h2>
          </div>

          <div className="divide-y divide-slate-800/60">
            {slots.map((slot, i) => {
              const usedColorGroups = slots
                .filter((_, idx) => idx !== i)
                .map(s => {
                  const f = factions.find(f => String(f.id) === String(s.factionId))
                  return f ? getFaction(f.code)?.colorGroup : null
                })
                .filter(Boolean)

              const factionOptions = factions.map(f => {
                const color = getFactionColor(f.code)
                const colorGroup = getFaction(f.code)?.colorGroup
                return { value: f.id, label: f.name_ko, color, disabled: usedColorGroups.includes(colorGroup) }
              })

              return (
              <div key={i} className="px-4 py-3 space-y-2">
                {/* 행 1: 번호 + 플레이어 + 종족 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium w-5 shrink-0">{i + 1}</span>
                  <CustomSelect
                    value={slot.playerId}
                    onChange={val => updateSlot(i, 'playerId', val)}
                    options={players.map(p => ({ value: p.id, label: p.name }))}
                    placeholder="플레이어 선택"
                    disabledValues={usedPlayerIds}
                  />
                  <CustomSelect
                    value={slot.factionId}
                    onChange={val => updateSlot(i, 'factionId', val)}
                    options={factionOptions}
                    placeholder="종족 선택"
                    disabledValues={usedFactionIds}
                  />
                </div>
                {/* 행 2: 비딩 + 총합 + 최종 + 순위 */}
                <div className="flex items-center gap-2 pl-7">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">비딩</p>
                    <input
                      type="number" min="0" value={slot.bidScore} placeholder="0"
                      onChange={e => updateSlot(i, 'bidScore', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-100 text-right focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">최종</p>
                    <input
                      type="number" min="0" value={slot.finalScore} placeholder="0"
                      onChange={e => updateSlot(i, 'finalScore', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-100 text-right focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="w-14 text-center">
                    <p className="text-xs text-slate-500 mb-1">총합</p>
                    <p className="text-sm font-semibold text-violet-300 py-2">
                      {slot.finalScore !== '' ? computed[i].total : '-'}
                    </p>
                  </div>
                  <div className="w-10 text-center">
                    <p className="text-xs text-slate-500 mb-1">순위</p>
                    <div className="flex justify-center py-1">
                      {slot.finalScore !== '' ? <RankBadge rank={ranks[i]} /> : <span className="text-slate-700">-</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          </div>

          {/* Preview summary */}
          {slots.every(s => s.finalScore !== '') && (
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-800/30">
              <div className="flex flex-wrap gap-2">
                {[...Array(4)]
                  .map((_, i) => ({ idx: i, rank: ranks[i], ...computed[i], ...slots[i] }))
                  .sort((a, b) => a.rank - b.rank)
                  .map(s => {
                    const p = players.find(p => p.id === s.playerId)
                    const f = factions.find(f => f.id === parseInt(s.factionId))
                    return (
                      <div key={s.idx} className="flex items-center gap-2 text-xs">
                        <RankBadge rank={s.rank} />
                        <span className={s.rank === 1 ? 'text-yellow-300 font-medium' : 'text-slate-300'}>
                          {p?.name ?? '?'}
                        </span>
                        {f && <FactionBadge name={f.name} nameKo={f.name_ko} />}
                        <span className="text-slate-400">{s.final}점</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            {submitting ? '저장 중...' : '게임 저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
