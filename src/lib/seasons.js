export function getCurrentSeason() {
  const now = new Date()
  const year = now.getFullYear()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${year}-Q${q}`
}

export function getSeasonRange(season) {
  if (season === 'all') return { start: null, end: null }
  const [year, q] = season.split('-Q')
  const qNum = parseInt(q)
  const startMonth = (qNum - 1) * 3 + 1
  const endMonth = startMonth + 2
  const lastDay = new Date(parseInt(year), endMonth, 0).getDate()
  return {
    start: `${year}-${String(startMonth).padStart(2, '0')}-01`,
    end:   `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function getSeasonLabel(season) {
  if (season === 'all') return '전체 기록'
  const [year, q] = season.split('-Q')
  return `${String(year).slice(2)}-시즌${q}`
}

export function getAvailableSeasons() {
  const current = getCurrentSeason()
  const [curYear, curQ] = current.split('-Q').map(Number)
  const seasons = []
  for (let year = 2025; year <= curYear; year++) {
    const maxQ = year === curYear ? curQ : 4
    for (let q = 1; q <= maxQ; q++) {
      seasons.push(`${year}-Q${q}`)
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
