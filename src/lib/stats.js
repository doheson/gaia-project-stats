// match_results_view 행들을 받아 플레이어별 통계로 집계
export function aggregatePlayerStats(rows) {
  const map = {}
  for (const row of rows) {
    if (!map[row.player_id]) {
      map[row.player_id] = {
        player_id: row.player_id, player_name: row.player_name,
        total_games: 0, wins: 0,
        _final: 0, _total: 0, _bid: 0, _rank: 0, best_score: -Infinity,
      }
    }
    const p = map[row.player_id]
    p.total_games++
    if (row.rank === 1) p.wins++
    p._final += row.final_score
    p._total += row.total_score
    p._bid   += row.bid_score
    p._rank  += row.rank
    p.best_score = Math.max(p.best_score, row.final_score)
  }
  return Object.values(map).map(p => ({
    player_id:       p.player_id,
    player_name:     p.player_name,
    total_games:     p.total_games,
    wins:            p.wins,
    win_rate:        round1(p.wins / p.total_games * 100),
    avg_final_score: round1(p._final / p.total_games),
    avg_total_score: round1(p._total / p.total_games),
    avg_bid_score:   round1(p._bid   / p.total_games),
    avg_rank:        round2(p._rank  / p.total_games),
    best_score:      p.best_score === -Infinity ? null : p.best_score,
  }))
}

// match_results_view 행들을 받아 종족별 통계로 집계
export function aggregateFactionStats(rows) {
  const map = {}
  for (const row of rows) {
    const key = row.faction_name
    if (!map[key]) {
      map[key] = {
        faction_name: row.faction_name, faction_name_ko: row.faction_name_ko,
        pick_count: 0, wins: 0,
        _final: 0, _total: 0, _bid: 0, _rank: 0,
      }
    }
    const f = map[key]
    f.pick_count++
    if (row.rank === 1) f.wins++
    f._final += row.final_score
    f._total += row.total_score
    f._bid   += row.bid_score
    f._rank  += row.rank
  }
  return Object.values(map).map(f => ({
    faction_name:    f.faction_name,
    faction_name_ko: f.faction_name_ko,
    pick_count:      f.pick_count,
    wins:            f.wins,
    win_rate:        round1(f.wins / f.pick_count * 100),
    avg_final_score: round1(f._final / f.pick_count),
    avg_total_score: round1(f._total / f.pick_count),
    avg_bid_score:   round1(f._bid   / f.pick_count),
    avg_rank:        round2(f._rank  / f.pick_count),
  }))
}

// match_results_view 행들을 받아 비딩 순위별 통계로 집계 (같은 게임 내 bid_score 내림차순)
export function aggregateBidRankStats(rows) {
  const matches = {}
  for (const row of rows) {
    if (!matches[row.match_id]) matches[row.match_id] = []
    matches[row.match_id].push(row)
  }

  const slots = Array.from({ length: 4 }, () => ({ count: 0, wins: 0, _final: 0, _bid: 0, _rank: 0 }))

  for (const players of Object.values(matches)) {
    const sorted = [...players].sort((a, b) => b.bid_score - a.bid_score)
    sorted.slice(0, 4).forEach((p, i) => {
      slots[i].count++
      if (p.rank === 1) slots[i].wins++
      slots[i]._final += p.final_score
      slots[i]._bid   += p.bid_score
      slots[i]._rank  += p.rank
    })
  }

  return slots.map((s, i) => ({
    bid_rank:        i + 1,
    label:           `비딩 ${i + 1}위`,
    count:           s.count,
    wins:            s.wins,
    win_rate:        s.count > 0 ? round1(s.wins / s.count * 100) : 0,
    avg_final_score: s.count > 0 ? round1(s._final / s.count) : 0,
    avg_bid_score:   s.count > 0 ? round1(s._bid   / s.count) : 0,
    avg_rank:        s.count > 0 ? round2(s._rank  / s.count) : 0,
  }))
}

function round1(n) { return Math.round(n * 10) / 10 }
function round2(n) { return Math.round(n * 100) / 100 }
