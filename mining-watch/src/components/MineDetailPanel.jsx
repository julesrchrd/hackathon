import { X, MapPin, Building2, Layers, FileText, ExternalLink, Activity, Tag, BarChart3, Database } from 'lucide-react'
import { STATUSES } from '../data/mines'

export default function MineDetailPanel({ mine, onClose }) {
  return (
    <div
      className={`
        absolute top-0 right-0 h-full w-[380px] z-[1000]
        bg-[#12151e] border-l border-[#1e2437]
        flex flex-col shadow-2xl
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
      <div className="px-5 pt-5 pb-4 border-b border-[#1e2437]">
        <div className="flex items-start gap-3">
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: status?.color || '#6b7280' }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base leading-snug">{mine.name}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={status} label={mine.status} />
              {mine.substances.map(s => (
                <span key={s} className="text-xs text-slate-500 bg-[#1a1d2e] px-2 py-0.5 rounded-full capitalize">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1a1d2e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Key info grid */}
        <Section>
          <SectionTitle icon={<Activity className="w-3.5 h-3.5" />}>Informations clés</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <InfoCard
              icon={<MapPin className="w-3.5 h-3.5" />}
              label="Région"
              value={mine.region || '—'}
            />
            <InfoCard
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Titulaire"
              value={mine.company || '—'}
            />
            <InfoCard
              icon={<Layers className="w-3.5 h-3.5" />}
              label="Surface totale"
              value={mine.surface_ha != null ? `${mine.surface_ha.toLocaleString('fr-FR')} ha` : '—'}
            />
            <InfoCard
              icon={<Tag className="w-3.5 h-3.5" />}
              label="Type de titre"
              value={mine.type_titre || '—'}
            />
          </div>
        </Section>

        {/* Source badge */}
        {mine.source === 'gtk' && (
          <Section>
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs text-sky-400 font-medium">Source : GTK Finland</span>
            </div>
          </Section>
        )}

        {/* GTK-specific: exploitation info */}
        {mine.source === 'gtk' && (
          <Section>
            <SectionTitle icon={<BarChart3 className="w-3.5 h-3.5" />}>Exploitation</SectionTitle>
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <InfoCard
                icon={<Tag className="w-3.5 h-3.5" />}
                label="Taille du gisement"
                value={mine.size_category || '—'}
              />
              <InfoCard
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Années d'exploitation"
                value={mine.mining_start_year
                  ? `${mine.mining_start_year}${mine.mining_end_year ? ' – ' + mine.mining_end_year : ' →'}`
                  : '—'}
              />
            </div>
            {mine.main_commodities_deposit && (
              <p className="mt-2 text-xs text-slate-400">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Commodités principales : </span>
                {mine.main_commodities_deposit}
              </p>
            )}
            {mine.other_commodities && (
              <p className="mt-1 text-xs text-slate-400">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Autres : </span>
                {mine.other_commodities}
              </p>
            )}
          </Section>
        )}

        {/* GTK-specific: resources & reserves */}
        {mine.source === 'gtk' && (mine.resources_total || mine.reserves_total || mine.total_ore_mined) && (
          <Section>
            <SectionTitle icon={<BarChart3 className="w-3.5 h-3.5" />}>Ressources & réserves</SectionTitle>
            <div className="mt-2.5 space-y-2">
              {mine.resources_total && (
                <div className="bg-[#1a1d2e] rounded-lg px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Ressources totales</p>
                  <p className="text-xs text-slate-200 font-mono">{mine.resources_total}</p>
                </div>
              )}
              {mine.reserves_total && (
                <div className="bg-[#1a1d2e] rounded-lg px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Réserves totales</p>
                  <p className="text-xs text-slate-200 font-mono">{mine.reserves_total}</p>
                </div>
              )}
              {mine.total_ore_mined && (
                <div className="bg-[#1a1d2e] rounded-lg px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Minerai extrait total</p>
                  <p className="text-xs text-slate-200 font-mono">{mine.total_ore_mined}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Camino domaine */}
        {mine.domaine && mine.source !== 'gtk' && (
          <Section>
            <SectionTitle icon={<Tag className="w-3.5 h-3.5" />}>Domaine</SectionTitle>
            <p className="mt-2 text-sm text-slate-300 capitalize">{mine.domaine}</p>
          </Section>
        )}

        {/* Communes */}
        {mine.communes?.length > 0 && (
          <Section>
            <SectionTitle icon={<MapPin className="w-3.5 h-3.5" />}>Communes concernées</SectionTitle>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {mine.communes.join(', ')}
            </p>
          </Section>
        )}

        {/* Références */}
        {mine.permits?.length > 0 && (
          <Section>
            <SectionTitle icon={<FileText className="w-3.5 h-3.5" />}>Références</SectionTitle>
            <ul className="mt-2.5 space-y-2">
              {mine.permits.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: status?.color || '#f59e0b' }}
                  />
                  <span className="text-xs text-slate-300 leading-relaxed font-mono">{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Links */}
        {mine.links?.length > 0 && (
          <Section>
            <SectionTitle icon={<ExternalLink className="w-3.5 h-3.5" />}>Sources & liens</SectionTitle>
            <div className="mt-2.5 space-y-1.5">
              {mine.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  {link.label}
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-[#1e2437] flex items-center justify-between">
        <span className="text-xs text-slate-700 font-mono">{mine.id}</span>
      </div>
    </>
  )
}

function StatusBadge({ status, label }) {
  const color = status?.color || '#6b7280'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
      {status?.label || label}
    </span>
  )
}

function Section({ children }) {
  return <div className="px-5 py-4 border-b border-[#1a1d2e]/70">{children}</div>
}

function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
      <span className="text-slate-600">{icon}</span>
      {children}
    </div>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-[#1a1d2e] rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-600 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-slate-200 font-medium leading-snug">{value}</p>
    </div>
  )
}
