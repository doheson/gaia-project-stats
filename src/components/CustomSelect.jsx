import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

// options: [{ value, label, color?, disabled? }]
// disabledValues: string[]
export default function CustomSelect({ value, onChange, options, placeholder = '선택', disabledValues = [] }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({})
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  function calcPos() {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const approxHeight = Math.min(256, options.length * 40)
    if (spaceBelow < approxHeight && r.top > approxHeight) {
      setPos({ bottom: window.innerHeight - r.top + 4, top: undefined, left: r.left, width: r.width })
    } else {
      setPos({ top: r.bottom + 4, bottom: undefined, left: r.left, width: r.width })
    }
  }

  function toggle() {
    if (!open) calcPos()
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (!triggerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target))
        setOpen(false)
    }
    function onScroll() { calcPos() }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return (
    <div className="relative flex-1 min-w-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
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

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-y-auto max-h-64"
        >
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
        </div>,
        document.body
      )}
    </div>
  )
}
