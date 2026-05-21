const STYLES = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-slate-300 text-slate-900',
  3: 'bg-amber-600 text-amber-100',
  4: 'bg-slate-700 text-slate-300',
}

export default function RankBadge({ rank }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${STYLES[rank] || 'bg-slate-700 text-slate-300'}`}>
      {rank}
    </span>
  )
}
