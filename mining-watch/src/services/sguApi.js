// Swedish SGU Mineralrättsregistret (MRR) — WMS GetFeatureInfo grid sampling
// WFS is disabled on SGU's GeoServer, so we systematically sample the country
// with a 20×20 grid of GetFeatureInfo requests and deduplicate by permit ID.

const SGU_WMS = '/api/sgu/wms/130/mrr'

// Sweden WGS84 bounding box
const SW_LON = 10.5, SW_LAT = 55.3
const NE_LON = 24.5, NE_LAT = 69.1
const GRID      = 20   // 20×20 = 400 sample points per layer
const BATCH     = 25   // parallel requests per batch

const CELL_W = (NE_LON - SW_LON) / GRID
const CELL_H = (NE_LAT - SW_LAT) / GRID

// Layers to sample — skip oil/gas/diamond layers
const SGU_LAYERS = [
  {
    name:       'SE.GOV.SGU.MRR.BEARBETNINGSKONCESSIONER_APPROVED_VY',
    status:     'valide',
    type_titre: 'bearbetningskoncession',
  },
  {
    name:       'SE.GOV.SGU.MRR.BEARBETNINGSKONCESSIONER_APPLIED_VY',
    status:     'demande initiale',
    type_titre: 'bearbetningskoncession (ansökt)',
  },
  {
    name:       'SE.GOV.SGU.MRR.MINERAL_APPROVED_VY',
    status:     'demande initiale',
    type_titre: 'undersökningstillstånd — metaller/mineral',
  },
]

function buildUrl(layerName, lon, lat) {
  // BBOX = cell boundaries; center pixel (50,50) targets the centroid of the cell
  const params = new URLSearchParams({
    SERVICE:      'WMS',
    VERSION:      '1.3.0',
    REQUEST:      'GetFeatureInfo',
    LAYERS:       layerName,
    QUERY_LAYERS: layerName,
    CRS:          'CRS:84',
    BBOX:         `${lon - CELL_W / 2},${lat - CELL_H / 2},${lon + CELL_W / 2},${lat + CELL_H / 2}`,
    WIDTH:        100,
    HEIGHT:       100,
    I:            50,
    J:            50,
    INFO_FORMAT:  'application/json',
    FEATURE_COUNT: 50,
  })
  return `${SGU_WMS}?${params}`
}

function pickProp(props, ...keys) {
  for (const k of keys) {
    const v = props[k] ?? props[k.toUpperCase()] ?? props[k.toLowerCase()]
    if (v != null && v !== '') return v
  }
  return null
}

function centroid(geometry) {
  if (!geometry) return null
  if (geometry.type === 'Point') {
    return [geometry.coordinates[1], geometry.coordinates[0]]
  }
  const ring = geometry.type === 'MultiPolygon'
    ? geometry.coordinates?.[0]?.[0]
    : geometry.coordinates?.[0]
  if (!ring?.length) return null
  return [
    ring.reduce((s, p) => s + p[1], 0) / ring.length,
    ring.reduce((s, p) => s + p[0], 0) / ring.length,
  ]
}

function transformFeature(f, layerDef) {
  const p = f.properties || {}
  const rawId = pickProp(p, 'identitetsnummer', 'IDENTITETSNUMMER', 'id', 'ID', 'OBJECTID', 'permit_id')
  if (!rawId) return null
  const coords = centroid(f.geometry)
  if (!coords) return null

  return {
    id:           `sgu-${rawId}`,
    name:         pickProp(p, 'namn', 'NAMN', 'name', 'NAME', 'permit_name') || `Concession ${rawId}`,
    status:       layerDef.status,
    mineral_type: 'minerai',
    substances:   ['minerai'],   // MRR doesn't specify substance; processing concessions are metals/minerals by law
    domaine:      'mines',
    type_titre:   layerDef.type_titre,
    country:      'Suède',
    region:       pickProp(p, 'lan', 'LAN', 'county', 'region') || '',
    communes:     [],
    coordinates:  coords,
    company:      pickProp(p, 'agare', 'AGARE', 'ägare', 'owner', 'innehavare') || null,
    surface_ha:   null,
    permits:      [String(rawId)],
    last_update:  pickProp(p, 'giltighetstid', 'GILTIGHETSTID', 'validity', 'valid_to') || null,
    links:        [],
    source:       'sgu',
    mine_status_raw: pickProp(p, 'status', 'STATUS', 'tillstandsstatus') || null,
  }
}

async function sampleLayer(layerDef) {
  const seen = new Map()

  // Build grid of sample URLs
  const urls = []
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const lon = SW_LON + (c + 0.5) * CELL_W
      const lat = SW_LAT + (r + 0.5) * CELL_H
      urls.push(buildUrl(layerDef.name, lon, lat))
    }
  }

  // Request in batches
  for (let i = 0; i < urls.length; i += BATCH) {
    const slice = urls.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      slice.map(url =>
        fetch(url)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    )
    for (const res of results) {
      if (res.status !== 'fulfilled' || !res.value) continue
      for (const feature of (res.value.features || [])) {
        const mine = transformFeature(feature, layerDef)
        if (mine && !seen.has(mine.id)) seen.set(mine.id, mine)
      }
    }
  }

  return [...seen.values()]
}

export async function fetchSguMines() {
  const results = await Promise.allSettled(SGU_LAYERS.map(sampleLayer))
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  // Final dedup across layers (a permit might appear in applied and approved)
  const unique = [...new Map(all.map(m => [m.id, m])).values()]
  console.log(`[SGU] ${unique.length} mines/permis suédois`)
  return unique
}
