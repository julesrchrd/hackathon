// Polish MIDAS layer 1 — active mining concessions (obszary górnicze)
// Only metal ores (RUDY), status aktualny. Source: PGI-NRI / cbdgmapa.pgi.gov.pl

const MIDAS_LAYER = '/api/midas/MapServer/1/query'

const KOPALINA_FR = {
  'rudy miedzi':   'cuivre',
  'rudy cynku':    'zinc',
  'rudy ołowiu':   'plomb',
  'rudy żelaza':   'fer',
  'rudy niklu':    'nickel',
  'rudy złota':    'or',
  'rudy arsenu':   'arsenic',
  'rudy cyny':     'étain',
  'rudy chromu':   'chrome',
}

function parseSubstances(kopalina) {
  if (!kopalina) return []
  return [...new Set(
    kopalina.split(',').map(s => {
      const key = s.trim().toLowerCase()
      return KOPALINA_FR[key] || null
    }).filter(Boolean)
  )]
}

function centroidFromRings(rings) {
  const ring = rings?.[0]
  if (!ring?.length) return null
  return [
    ring.reduce((s, p) => s + p[1], 0) / ring.length,
    ring.reduce((s, p) => s + p[0], 0) / ring.length,
  ]
}

function msToDate(ms) {
  if (!ms) return null
  const d = new Date(ms)
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function transformFeature(feature) {
  const a = feature.attributes
  if (a.STATUS !== 'aktualny') return null

  const substances = parseSubstances(a.KOPALINA)
  if (!substances.length) return null

  const coordinates = centroidFromRings(feature.geometry?.rings)
  if (!coordinates) return null

  return {
    id:           `midas-og-${a.ID_KONTURU}`,
    name:         a.NAZWA_OG || a.NAZWA_ZLOZA || `Concession ${a.ID_KONTURU}`,
    status:       'valide',
    mineral_type: substances[0],
    substances,
    domaine:      'mines',
    type_titre:   'concession minière',
    country:      'Pologne',
    region:       a.WYD_WYZN || '',
    communes:     [],
    coordinates,
    company:      a.NADZOR_OUG || null,
    surface_ha:   a.POWIERZCHNIA ? Math.round(a.POWIERZCHNIA / 10000) : null,
    permits:      a.NR_REJESTR ? [a.NR_REJESTR] : [],
    last_update:  msToDate(a.DATA_USTANOWIENIA),
    links:        [],
    source:       'midas-og',
    mine_status_raw:          a.STATUS,
    mining_start_year:        a.DATA_USTANOWIENIA ? new Date(a.DATA_USTANOWIENIA).getFullYear() : null,
    mining_end_year:          a.DATA_WAZNOSCI ? new Date(a.DATA_WAZNOSCI).getFullYear() : null,
    size_category:            null,
    main_commodities_deposit: a.KOPALINA || null,
    other_commodities:        null,
    resources_total:          null,
    reserves_total:           null,
    total_ore_mined:          null,
  }
}

export async function fetchMidasMines() {
  const params = new URLSearchParams({
    where:          "KOPALINA LIKE '%RUDY%' AND STATUS = 'aktualny'",
    outFields:      '*',
    returnGeometry: 'true',
    outSR:          '4326',
    f:              'json',
  })
  const res = await fetch(`${MIDAS_LAYER}?${params}`)
  if (!res.ok) throw new Error(`MIDAS-OG HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(`MIDAS-OG API: ${data.error.message}`)
  return (data.features || []).map(transformFeature).filter(Boolean)
}
