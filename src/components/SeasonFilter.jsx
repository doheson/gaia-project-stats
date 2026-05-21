import { getAvailableSeasons, getSeasonLabel, getCurrentSeason } from '../lib/seasons'

const SEASONS = getAvailableSeasons()
const CURRENT = getCurrentSeason()

export default function SeasonFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 cursor-pointer"
    >
      {SEASONS.map(s => (
        <option key={s} value={s}>
          {getSeasonLabel(s)}{s === CURRENT ? ' (현재)' : ''}
        </option>
      ))}
      <option value="all">전체 기록</option>
    </select>
  )
}
