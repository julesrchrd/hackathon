import { X } from 'lucide-react'
import { STATUSES } from '../data/mines'

export default function MineDetailPanel({ mine, onClose }) {
  return (
    <div
      className={`
        absolute top-0 right-0 h-full w-[380px] z-[1000]
        bg-white border-l border-gray-200
        flex flex-col shadow-lg
        transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${mine ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {mine && <Content mine={mine} onClose={onClose} />}
    </div>
  )
}

function Content({ mine, onClose }) {
  const status = STATUSES.find(s => s.value === mine.status)

  return (
    <>
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-gray-900 font-semibold text-lg leading-snug">{mine.name}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-medium" style={{ color: status?.color || '#6b7280' }}>
                {status?.label || mine.status}
              </span>
              {mine.substances?.length > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500 capitalize">{mine.substances.join(', ')}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Key info grid */}
        <Section>
          <SectionTitle>Informations clés</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <InfoCard label="Région" value={mine.region || '—'} />
            <InfoCard label="Titulaire" value={mine.company || '—'} />
            <InfoCard
              label="Surface totale"
              value={mine.surface_ha != null ? `${mine.surface_ha.toLocaleString('fr-FR')} ha` : '—'}
            />
            <InfoCard label="Type de titre" value={mine.type_titre || '—'} />
          </div>
        </Section>

        {/* Source GTK */}
        {mine.source === 'gtk' && (
          <Section>
            <span className="text-xs text-sky-600 font-medium">Source : GTK Finland</span>
          </Section>
        )}

        {/* GTK: exploitation */}
        {mine.source === 'gtk' && (
          <Section>
            <SectionTitle>Exploitation</SectionTitle>
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <InfoCard label="Taille du gisement" value={mine.size_category || '—'} />
              <InfoCard
                label="Années d'exploitation"
                value={mine.mining_start_year
                  ? `${mine.mining_start_year}${mine.mining_end_year ? ' – ' + mine.mining_end_year : ' →'}`
                  : '—'}
              />
            </div>
            {mine.main_commodities_deposit && (
              <p className="mt-2 text-xs text-gray-600">
                <span className="text-gray-400 uppercase text-[10px] tracking-wider">Commodités principales : </span>
                {mine.main_commodities_deposit}
              </p>
            )}
            {mine.other_commodities && (
              <p className="mt-1 text-xs text-gray-600">
                <span className="text-gray-400 uppercase text-[10px] tracking-wider">Autres : </span>
                {mine.other_commodities}
              </p>
            )}
          </Section>
        )}

        {/* GTK: ressources & réserves */}
        {mine.source === 'gtk' && (mine.resources_total || mine.reserves_total || mine.total_ore_mined) && (
          <Section>
            <SectionTitle>Ressources & réserves</SectionTitle>
            <div className="mt-2.5 space-y-2">
              {mine.resources_total && (
                <div className="bg-gray-50 rounded px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Ressources totales</p>
                  <p className="text-xs text-gray-800 font-mono">{mine.resources_total}</p>
                </div>
              )}
              {mine.reserves_total && (
                <div className="bg-gray-50 rounded px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Réserves totales</p>
                  <p className="text-xs text-gray-800 font-mono">{mine.reserves_total}</p>
                </div>
              )}
              {mine.total_ore_mined && (
                <div className="bg-gray-50 rounded px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Minerai extrait total</p>
                  <p className="text-xs text-gray-800 font-mono">{mine.total_ore_mined}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Domaine */}
        {mine.domaine && mine.source !== 'gtk' && (
          <Section>
            <SectionTitle>Domaine</SectionTitle>
            <p className="mt-2 text-sm text-gray-700 capitalize">{mine.domaine}</p>
          </Section>
        )}

        {/* Communes */}
        {mine.communes?.length > 0 && (
          <Section>
            <SectionTitle>Communes concernées</SectionTitle>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {mine.communes.join(', ')}
            </p>
          </Section>
        )}

        {/* Références */}
        {mine.permits?.length > 0 && (
          <Section>
            <SectionTitle>Références</SectionTitle>
            <ul className="mt-2.5 space-y-2">
              {mine.permits.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: status?.color || '#94a3b8' }}
                  />
                  <span className="text-xs text-gray-700 leading-relaxed font-mono">{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Liens */}
        {mine.links?.length > 0 && (
          <Section>
            <SectionTitle>Sources & liens</SectionTitle>
            <div className="mt-2.5 space-y-1.5">
              {mine.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-slate-600 underline hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>
    </>
  )
}

function Section({ children }) {
  return <div className="px-5 py-4 border-b border-gray-100">{children}</div>
}

function SectionTitle({ children }) {
  return (
    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
      {children}
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded px-3 py-2.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">{label}</span>
      <p className="text-sm text-gray-800 font-medium leading-snug">{value}</p>
    </div>
  )
}
