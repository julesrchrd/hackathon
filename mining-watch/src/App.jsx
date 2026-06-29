import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import MineDetailPanel from './components/MineDetailPanel'
import { mines as allMines } from './data/mines'

export default function App() {
  const [selectedMine, setSelectedMine] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ status: [], mineral_type: [], country: [] })

  const filteredMines = useMemo(() => {
    return allMines.filter(mine => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const hit =
          mine.name.toLowerCase().includes(q) ||
          mine.country.toLowerCase().includes(q) ||
          (mine.company || '').toLowerCase().includes(q) ||
          (mine.mineral_type || '').toLowerCase().includes(q) ||
          (mine.region || '').toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filters.status.length && !filters.status.includes(mine.status)) return false
      if (filters.mineral_type.length && !filters.mineral_type.includes(mine.mineral_type)) return false
      if (filters.country.length && !filters.country.includes(mine.country)) return false
      return true
    })
  }, [searchQuery, filters])

  const handleMineSelect = (mine) => {
    setSelectedMine(prev => (prev?.id === mine.id ? null : mine))
  }

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      <Sidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredMines.length}
      />

      <div className="flex-1 relative overflow-hidden">
        <MapView
          mines={filteredMines}
          selectedMine={selectedMine}
          onMineSelect={handleMineSelect}
        />

        <MineDetailPanel
          mine={selectedMine}
          onClose={() => setSelectedMine(null)}
        />
      </div>
    </div>
  )
}
