import { useEffect, useRef, useState } from 'react'

// options: [{ value, label, color? }]
// disabledValues: string[]
export default function CustomSelect({ value, onChange, options, placeholder = '선택', disabledValues = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-left focus:outline-none focus:border-violet-500"
      >
        {selected ? (
          <>
            {selected.color && (
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-600 shrink-0"
                style={{ backgroundColor: selected.color }}
              />
            )}
            <span className="text-slate-100 truncate">{selected.label}</span>
          </>
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
        <svg
          className={`ml-auto w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-y-auto max-h-64">
          {options.map(o => {
            const isDisabled = String(o.value) !== String(value) && (disabledValues.includes(String(o.value)) || o.disabled)
            const isSelected = String(o.value) === String(value)
            return (
              <button
                key={o.value}
                type="button"
                disabled={isDisabled}
                onClick={() => { onChange(String(o.value)); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700/70 cursor-pointer'}
                  ${isSelected ? 'bg-slate-700' : ''}
                `}
              >
                {o.color && (
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-600 shrink-0"
                    style={{ backgroundColor: o.color }}
                  />
                )}
                <span className={isSelected ? 'text-violet-300 font-medium' : 'text-slate-100'}>
                  {o.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
