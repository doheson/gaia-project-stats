import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  // 인증
  const auth = (req.headers['authorization'] ?? '').trim()
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== process.env.API_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  const { played_at, memo, players } = req.body ?? {}

  // 기본 유효성 검사
  if (!played_at || !/^\d{4}-\d{2}-\d{2}$/.test(played_at)) {
    return res.status(400).json({ ok: false, error: 'played_at은 YYYY-MM-DD 형식이어야 합니다' })
  }
  if (!Array.isArray(players) || players.length !== 4) {
    return res.status(400).json({ ok: false, error: 'players는 정확히 4명이어야 합니다' })
  }

  for (const p of players) {
    if (typeof p.name !== 'string' || !p.name.trim()) {
      return res.status(400).json({ ok: false, error: 'name이 필요합니다' })
    }
    if (typeof p.faction !== 'string' || !p.faction.trim()) {
      return res.status(400).json({ ok: false, error: `faction이 필요합니다: "${p.name}"` })
    }
    if (typeof p.bid_score !== 'number' || !Number.isInteger(p.bid_score) || p.bid_score < 0) {
      return res.status(400).json({ ok: false, error: `bid_score는 0 이상의 정수여야 합니다: "${p.name}"` })
    }
    if (typeof p.total_score !== 'number' || !Number.isInteger(p.total_score) || p.total_score < 0) {
      return res.status(400).json({ ok: false, error: `total_score는 0 이상의 정수여야 합니다: "${p.name}"` })
    }
    if (p.total_score < p.bid_score) {
      return res.status(400).json({ ok: false, error: `total_score는 bid_score 이상이어야 합니다: "${p.name}"` })
    }
  }

  // 중복 검사
  if (new Set(players.map(p => p.name)).size !== 4) {
    return res.status(400).json({ ok: false, error: '플레이어 이름이 중복되었습니다' })
  }
  if (new Set(players.map(p => p.faction)).size !== 4) {
    return res.status(400).json({ ok: false, error: '종족이 중복되었습니다' })
  }

  // 플레이어 ID 조회
  const { data: dbPlayers, error: pErr } = await supabase.from('players').select('id, name')
  if (pErr) return res.status(500).json({ ok: false, error: pErr.message })

  // 이름/연도 정확 일치 → 실패 시 슬래시 앞 이름만으로 재시도
  function resolvePlayer(key) {
    const exact = dbPlayers.find(p => p.name === key)
    if (exact) return { player: exact }

    const byFirstName = dbPlayers.filter(p => p.name.split('/')[0] === key)
    if (byFirstName.length === 1) return { player: byFirstName[0] }
    if (byFirstName.length > 1) return { player: null, ambiguous: byFirstName.map(p => p.name) }

    return { player: null }
  }

  for (const p of players) {
    const { player, ambiguous } = resolvePlayer(p.name)
    if (ambiguous) {
      return res.status(400).json({ ok: false, error: `이름 "${p.name}"이 여러 명과 일치합니다: ${ambiguous.join(', ')} — 이름/연도 형식으로 보내주세요` })
    }
    if (!player) {
      return res.status(400).json({ ok: false, error: `등록되지 않은 플레이어: "${p.name}"` })
    }
  }

  // 종족 ID 조회 (code / 영어이름 / 한국어이름 모두 허용)
  const { data: dbFactions, error: fErr } = await supabase.from('factions').select('id, name, name_ko, code')
  if (fErr) return res.status(500).json({ ok: false, error: fErr.message })

  function resolveFaction(key) {
    return dbFactions.find(f => f.code === key || f.name === key || f.name_ko === key)
  }

  for (const p of players) {
    if (!resolveFaction(p.faction)) {
      return res.status(400).json({ ok: false, error: `알 수 없는 종족: "${p.faction}"` })
    }
  }

  // 순위 계산: final_score(= total - bid) 내림차순, 동점 시 total_score 내림차순
  const sorted = [...players].sort(
    (a, b) =>
      (b.total_score - b.bid_score) - (a.total_score - a.bid_score) ||
      b.total_score - a.total_score
  )
  const rankMap = new Map(sorted.map((p, i) => [p.name, i + 1]))

  // matches 테이블 insert
  const { data: match, error: matchErr } = await supabase
    .from('matches')
    .insert({ played_at, memo: (typeof memo === 'string' ? memo.trim() : '') || null })
    .select()
    .single()

  if (matchErr) return res.status(500).json({ ok: false, error: matchErr.message })

  // match_results 테이블 insert
  const results = players.map(p => ({
    match_id: match.id,
    player_id: resolvePlayer(p.name).player.id,
    faction_id: resolveFaction(p.faction).id,
    bid_score: p.bid_score,
    total_score: p.total_score,
    rank: rankMap.get(p.name),
  }))

  const { error: rErr } = await supabase.from('match_results').insert(results)
  if (rErr) {
    // match_results 실패 시 match 롤백
    await supabase.from('matches').delete().eq('id', match.id)
    return res.status(500).json({ ok: false, error: rErr.message })
  }

  return res.status(200).json({ ok: true, match_id: match.id })
}
