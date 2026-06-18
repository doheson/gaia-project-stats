import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ManagePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('players').select('id, name').order('name')
    setPlayers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('players').insert({ name: trimmed })
    if (err) {
      setError(err.message)
    } else {
      setName('')
      await load()
    }
    setSaving(false)
  }

  async function handleDelete(player) {
    if (pw !== '1228') {
      setPwError(true)
      return
    }
    const { count } = await supabase
      .from('match_results')
      .select('id', { count: 'exact', head: true })
      .eq('player_id', player.id)
    if (count > 0) {
      setError(`${player.name}은(는) 게임 기록이 있어 삭제할 수 없습니다.`)
      setDeleteTarget(null)
      setPw('')
      return
    }
    await supabase.from('players').delete().eq('id', player.id)
    setDeleteTarget(null)
    setPw('')
    await load()
  }

  function openDelete(p) {
    setDeleteTarget(p)
    setPw('')
    setPwError(false)
    setError('')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">플레이어 관리</h1>
        <p className="text-slate-400 text-sm mt-1">총 {players.length}명</p>
      </div>

      {/* 추가 폼 */}
      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">새 플레이어 추가</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="예: 준혁/97"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? '추가 중…' : '추가'}
          </button>
        </div>
        <p className="text-xs text-slate-500">형식: <span className="text-slate-400">이름/출생연도2자리</span> (예: 준혁/97, 루다/90)</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {/* 플레이어 목록 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <ul className="divide-y divide-slate-800/60">
            {players.length === 0 && (
              <li className="py-8 text-center text-slate-500 text-sm">플레이어가 없습니다</li>
            )}
            {players.map(p => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-slate-100 text-sm font-medium">{p.name}</span>
                {deleteTarget?.id === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={pw}
                      onChange={e => { setPw(e.target.value); setPwError(false) }}
                      placeholder="비밀번호"
                      autoFocus
                      className={`w-24 bg-slate-800 border rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none ${pwError ? 'border-red-500' : 'border-slate-700 focus:border-violet-500'}`}
                    />
                    <button
                      onClick={() => handleDelete(p)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(null); setPw(''); setPwError(false) }}
                      className="text-xs text-slate-400 hover:text-slate-300"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openDelete(p)}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
