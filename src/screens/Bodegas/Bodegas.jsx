import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroSection, FilterSidebar, WarehouseGrid } from '../../components/index'
import { WAREHOUSES_DATA } from '../../data/warehouse'

export function BodegaScreen() {
  const [searchParams] = useSearchParams()
  const [filteredWarehouses, setFilteredWarehouses] = useState(WAREHOUSES_DATA)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [0, 3500000],
    size: '',
    features: []
  })
  
  const ciudadSeleccionada = searchParams.get('ciudad') || ''

  useEffect(() => {
    const filtered = WAREHOUSES_DATA.filter(warehouse => {
      if (ciudadSeleccionada && warehouse.city.toLowerCase() !== ciudadSeleccionada.toLowerCase()) return false
      if (filters.location && warehouse.location.toLowerCase() !== filters.location.toLowerCase()) return false
      if (filters.priceRange && filters.priceRange[1] < 3500000 && warehouse.price > filters.priceRange[1]) return false
      if (filters.size) {
        const sizeNumber = parseInt(warehouse.sizes[0])
        switch (filters.size) {
          case '1-5 m²': if (!(sizeNumber >= 1 && sizeNumber <= 5)) return false; break
          case '5-15 m²': if (!(sizeNumber > 5 && sizeNumber <= 15)) return false; break
          case '15-40 m²': if (!(sizeNumber > 15 && sizeNumber <= 40)) return false; break
          case '+40 m²': if (!(sizeNumber > 40)) return false; break
        }
      }
      if (filters.features?.length > 0) {
        const hasFeature = filters.features.some(f => warehouse.features.includes(f))
        if (!hasFeature) return false
      }
      return true
    })
    setFilteredWarehouses(filtered)
  }, [ciudadSeleccionada, filters])

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      {ciudadSeleccionada && (
        <div className="bg-white border-b px-6 py-4">
          <div className="max-w-[1500px] mx-auto">
            <h2 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
              Bodegas disponibles en {ciudadSeleccionada} ({filteredWarehouses.length} resultados)
            </h2>
          </div>
        </div>
      )}
      <div className="max-w-[1700px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-1">
          <FilterSidebar 
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={setFilters}
            ciudadSeleccionada={ciudadSeleccionada}
          />
        </div>
        <div className="md:col-span-3">
          <WarehouseGrid warehouses={filteredWarehouses} />
        </div>
      </div>            
    </div>
  )
}
