import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroSection, FilterSidebar, WarehouseGrid,WarehouseCard } from '../../components/index'
import { useWarehouses } from '../../hooks/useWarehouses' // Corrección de la ruta

export function BodegaScreen() {
  const [searchParams] = useSearchParams()
  const [filteredWarehouses, setFilteredWarehouses] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [0, 3500000],
    size: '',
    features: []
  })
  
  const ciudadSeleccionada = searchParams.get('ciudad') || ''
  const { warehouses, loading, error } = useWarehouses()

  // Scroll to top cuando se monta el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtrar warehouses cuando cambien los filtros o se carguen los datos
  useEffect(() => {
    if (!warehouses.length) {
      setFilteredWarehouses([])
      return
    }

    const filtered = warehouses.filter(warehouse => {
      // Filtro por ciudad de la URL
      if (ciudadSeleccionada && !warehouse.location.toLowerCase().includes(ciudadSeleccionada.toLowerCase())) {
        return false
      }
      
      // Filtro por ubicación específica
      if (filters.location && !warehouse.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
      
      // Filtro por rango de precio
      if (filters.priceRange && filters.priceRange[1] < 3500000) {
        const warehouseMaxPrice = warehouse.priceRange?.max || 0
        if (warehouseMaxPrice > filters.priceRange[1]) return false
      }
      
      // Filtro por tamaño
      if (filters.size) {
        const hasMatchingSize = warehouse.sizes?.some(size => {
          const sizeNumber = parseInt(size.replace('m³', ''))
          switch (filters.size) {
            case '1-5 m²': return sizeNumber >= 1 && sizeNumber <= 5
            case '5-15 m²': return sizeNumber > 5 && sizeNumber <= 15
            case '15-40 m²': return sizeNumber > 15 && sizeNumber <= 40
            case '+40 m²': return sizeNumber > 40
            default: return true
          }
        })
        if (!hasMatchingSize) return false
      }
      
      // Filtro por características
      if (filters.features?.length > 0) {
        const hasFeature = filters.features.some(f => 
          warehouse.features?.some(feature => 
            feature.toLowerCase().includes(f.toLowerCase())
          )
        )
        if (!hasFeature) return false
      }
      
      return true
    })
    
    setFilteredWarehouses(filtered)
  }, [warehouses, ciudadSeleccionada, filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#4B799B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando bodegas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>Error al cargar las bodegas: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

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

      {/* Botón Filtros solo en mobile */}
      <div className="md:hidden flex justify-end px-4 py-2">
        <button
          className="bg-[#4B799B] text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-[#3b5f7a] transition-colors"
          onClick={() => setShowFilters(true)}
        >
          Filtros
        </button>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-1">
          <FilterSidebar 
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={setFilters}
            ciudadSeleccionada={ciudadSeleccionada}
            hideMapOnMobile={true}
          />
        </div>
        <div className="md:col-span-3">
          {/* Usar datos de la base de datos en lugar de WarehouseGrid */}
          {filteredWarehouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <WarehouseCard key={warehouse.id} warehouse={warehouse} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {warehouses.length === 0 
                  ? "No hay bodegas disponibles en este momento."
                  : "No se encontraron bodegas que coincidan con tus filtros."
                }
              </p>
              {warehouses.length > 0 && (
                <button
                  onClick={() => setFilters({
                    location: '',
                    priceRange: [0, 3500000],
                    size: '',
                    features: []
                  })}
                  className="mt-4 px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>            
    </div>
  )
}
