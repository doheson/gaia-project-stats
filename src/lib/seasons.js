export function getCurrentSeason() {
  const now = new Date()
  const year = now.getFullYear()
  const s = now.getMonth() < 6 ? 1 : 2  // 0~5월 → 시즌1, 6~11월 → 시즌2
  return `${year}-S${s}`
}

export function getSeasonRange(season) {
  if (season === 'all') return { start: null, end: null }
  const [year, s] = season.split('-S')
  const sNum = parseInt(s)
  const startMonth = sNum === 1 ? 1 : 7
  const endMonth   = sNum === 1 ? 6 : 12
  const lastDay = new Date(parseInt(year), endMonth, 0).getDate()
  return {
    start: `${year}-${String(startMonth).padStart(2, '0')}-01`,
    end:   `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function getSeasonLabel(season) {
  if (season === 'all') return '전체 기록'
  const [year, s] = season.split('-S')
  return `${String(year).slice(2)}-시즌${s}`
}

export function getAvailableSeasons() {
  const current = getCurrentSeason()
  const [curYear, curS] = current.split('-S').map(Number)
  const seasons = []
  for (let year = 2025; year <= curYear; year++) {
    const maxS = year === curYear ? curS : 2
    for (let s = 1; s <= maxS; s++) {
      seasons.push(`${year}-S${s}`)
    }
  }
  return seasons.reverse() // 최신순
}

export function applySeasonFilter(query, season) {
  const { start, end } = getSeasonRange(season)
  if (start) query = query.gte('played_at', start)
  if (end)   query = query.lte('played_at', end)
  return query
}
