export function groupByMatch(rows) {
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
