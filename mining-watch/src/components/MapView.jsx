import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { STATUSES } from '../data/mines'

const STATUS_COLOR = Object.fromEntries(STATUSES.map(s => [s.value, s.color]))

function createPinIcon(status, isSelected) {
  const color = STATUS_COLOR[status] || '#6b7280'
  const size = isSelected ? 20 : 10

  return L.divIcon({
    html: `
      <div style="width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <div style="
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${color};
          border:2px solid ${isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)'};
        "></div>
      </div>
    `,
    className: '',
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
  })
}

function FlyTo({ mine }) {
  const map = useMap()
  useEffect(() => {
    if (mine) {
      map.flyTo(mine.coordinates, Math.max(map.getZoom(), 9), { duration: 0.9, easeLinearity: 0.4 })
    }
  }, [mine, map])
  return null
}

function Legend() {
  return (
    <div className="absolute bottom-8 left-4 z-[1000] bg-[#12151e]/90 backdrop-blur-md border border-[#1e2437] rounded-xl px-3.5 py-3 space-y-2">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Statut</p>
      {STATUSES.map(s => (
        <div key={s.value} className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}80` }}
          />
          <span className="text-xs text-slate-400">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function MapView({ mines, selectedMine, onMineSelect }) {
  const europeBounds = [[34, -12], [55, 30]]

  return (
    <div className="relative h-full w-full">
      <MapContainer
        bounds={europeBounds}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        minZoom={4}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <ZoomControl position="bottomright" />

        {mines.map(mine => (
          <Marker
            key={mine.id}
            position={mine.coordinates}
            icon={createPinIcon(mine.status, selectedMine?.id === mine.id)}
            eventHandlers={{ click: () => onMineSelect(mine) }}
          />
        ))}

        {selectedMine && <FlyTo mine={selectedMine} />}
      </MapContainer>

      <Legend />
    </div>
  )
}
