import { getFaction } from '../lib/factions'

export default function FactionBadge({ name, nameKo: nameKoProp, className = '' }) {
  const faction = getFaction(name) || getFaction(nameKoProp)
  const displayName = faction?.nameKo || nameKoProp || name || '?'
  const color = faction?.color || '#64748b'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color,
        borderColor: `${color}50`,
      }}
    >
      {displayName}
    </span>
  )
}
