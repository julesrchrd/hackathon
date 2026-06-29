import { X, MapPin, Building2, Calendar, Layers, BarChart3, FileText, ExternalLink, Activity } from 'lucide-react'
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
          {/* Status color bar */}
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: status?.color || '#6b7280' }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base leading-snug">{mine.name}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={status} />
              <span className="text-xs text-slate-500 bg-[#1a1d2e] px-2 py-0.5 rounded-full">
                {mine.mineral_type}
              </span>
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

        {/* Description */}
        {mine.description && (
          <Section>
            <p className="text-sm text-slate-400 leading-relaxed">{mine.description}</p>
          </Section>
        )}

        {/* Key metrics grid */}
        <Section>
          <SectionTitle icon={<Activity className="w-3.5 h-3.5" />}>Informations clés</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <InfoCard
              icon={<MapPin className="w-3.5 h-3.5" />}
              label="Localisation"
              value={[mine.country, mine.region].filter(Boolean).join(', ')}
            />
            <InfoCard
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Opérateur"
              value={mine.company || '—'}
            />
            <InfoCard
              icon={<Layers className="w-3.5 h-3.5" />}
              label="Superficie"
              value={mine.surface_ha ? `${mine.surface_ha.toLocaleString('fr-FR')} ha` : '—'}
            />
            <InfoCard
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              label="Ressources estimées"
              value={mine.resources_estimate || '—'}
            />
          </div>
        </Section>

        {/* Permits */}
        {mine.permits?.length > 0 && (
          <Section>
            <SectionTitle icon={<FileText className="w-3.5 h-3.5" />}>Permis & autorisations</SectionTitle>
            <ul className="mt-2.5 space-y-2">
              {mine.permits.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: status?.color || '#f59e0b' }}
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* External links */}
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

        {/* Placeholder zone for future data */}
        <Section>
          <div className="rounded-lg border border-dashed border-[#252840] px-4 py-4 text-center">
            <p className="text-xs text-slate-600">Zone réservée pour données additionnelles</p>
          </div>
        </Section>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-[#1e2437] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Calendar className="w-3 h-3" />
          Mis à jour le {mine.last_update || '—'}
        </div>
        {mine.egdi_id && (
          <span className="text-xs text-slate-700 font-mono">EGDI #{mine.egdi_id}</span>
        )}
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${status.color}18`, color: status.color, border: `1px solid ${status.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: status.color }} />
      {status.label}
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
