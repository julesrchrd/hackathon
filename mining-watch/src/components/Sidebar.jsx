import { useState } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, Gem } from 'lucide-react'
import { MINERAL_TYPES, STATUSES, COUNTRIES } from '../data/mines'

export default function Sidebar({ searchQuery, onSearchChange, filters, onFiltersChange, resultCount }) {
  const [expanded, setExpanded] = useState({ status: true, mineral: false, country: false })

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleFilter = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    onFiltersChange({ ...filters, [key]: next })
  }

  const clearFilters = () => onFiltersChange({ status: [], mineral_type: [], country: [] })

  const activeCount = Object.values(filters).reduce((n, arr) => n + arr.length, 0)

  return (
    <aside className="w-72 h-full flex flex-col bg-[#12151e] border-r border-[#1e2437] shrink-0">

      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 border-b border-[#1e2437]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Gem className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-none tracking-tight">MineWatch</h1>
            <p className="text-slate-500 text-xs mt-0.5">Veille minière européenne</p>
          </div>
        </div>
      </div>

      {/* ── Recherche ── */}
      <div className="px-4 py-3 border-b border-[#1e2437]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Nom, pays, minéral, opérateur…"
            className="w-full bg-[#1a1d2e] text-slate-200 placeholder-slate-600 text-sm
                       pl-9 pr-8 py-2.5 rounded-lg border border-[#252840]
                       focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20
                       transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <SlidersHorizontal className="w-3 h-3" />
            Filtres
            {activeCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-semibold">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-amber-500/80 hover:text-amber-400 transition-colors">
              Réinitialiser
            </button>
          )}
        </div>

        <FilterSection title="Statut" open={expanded.status} onToggle={() => toggle('status')}>
          {STATUSES.map(s => (
            <CheckItem
              key={s.value}
              label={s.label}
              checked={(filters.status || []).includes(s.value)}
              onChange={() => toggleFilter('status', s.value)}
              accentColor={s.color}
            />
          ))}
        </FilterSection>

        <FilterSection title="Type de minéral" open={expanded.mineral} onToggle={() => toggle('mineral')}>
          {MINERAL_TYPES.map(m => (
            <CheckItem
              key={m}
              label={m}
              checked={(filters.mineral_type || []).includes(m)}
              onChange={() => toggleFilter('mineral_type', m)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Pays" open={expanded.country} onToggle={() => toggle('country')}>
          {COUNTRIES.map(c => (
            <CheckItem
              key={c}
              label={c}
              checked={(filters.country || []).includes(c)}
              onChange={() => toggleFilter('country', c)}
            />
          ))}
        </FilterSection>
      </div>

      {/* ── Compteur résultats ── */}
      <div className="px-4 py-3 border-t border-[#1e2437]">
        <p className="text-xs text-slate-500">
          <span className="text-slate-300 font-semibold">{resultCount}</span>{' '}
          projet{resultCount !== 1 ? 's' : ''} affiché{resultCount !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  )
}

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-[#1a1d2e]/60">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0.5 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

function CheckItem({ label, checked, onChange, accentColor }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all
          ${checked
            ? 'border-transparent'
            : 'border-slate-600 group-hover:border-slate-400'}`}
        style={checked ? { backgroundColor: accentColor || '#f59e0b' } : {}}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 3L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-xs transition-colors ${checked ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'}`}>
        {label}
      </span>
    </label>
  )
}
