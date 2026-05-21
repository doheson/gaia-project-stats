export default function StatCard({ title, value, sub, className = '' }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 ${className}`}>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-100 truncate">{value ?? '-'}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
