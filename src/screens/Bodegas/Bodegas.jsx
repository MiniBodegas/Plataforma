import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroSection, FilterSidebar, WarehouseGrid } from '../../components/index'

// CONGELAR los datos para evitar cualquier mutación
const WAREHOUSES_DATA = Object.freeze([
  Object.freeze({
    id: 1,
    name: "Bogotá Norte",
    location: "Norte",
    city: "Bogotá",
    sizes: ["50 m²", "80 m²", "120 m²", "200 m²"],
    price: 1200000,
    priceRange: Object.freeze({ min: 1200000, max: 2500000 }),
    rating: 4.5, // Valor completamente fijo
    image: "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Múltiples bodegas disponibles en la zona norte de Bogotá.",
    features: Object.freeze(["Directo en vehiculo", "Acceso en primer piso", "Sin escaleras"]),
    warehouseCount: 15
  }),
  Object.freeze({
    id: 2,
    name: "Medellín Centro",
    location: "Sur",
    city: "Medellín",
    sizes: ["45 m²", "70 m²", "90 m²", "150 m²"],
    price: 900000,
    priceRange: Object.freeze({ min: 900000, max: 1800000 }),
    rating: 4.2, // Valor completamente fijo
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Bodegas en el corazón de Medellín.",
    features: Object.freeze(["Acceso con montacarga", "Ascensor"]),
    warehouseCount: 12
  }),
  Object.freeze({
    id: 3,
    name: "Cali Industrial",
    location: "Este",
    city: "Cali",
    sizes: ["100 m²", "150 m²", "200 m²", "300 m²"],
    price: 1500000,
    priceRange: Object.freeze({ min: 1500000, max: 3200000 }),
    rating: 4.8, // Valor completamente fijo
    image: "https://images.unsplash.com/photo-1566844157-8267b80d7e5a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Zona industrial con bodegas de gran capacidad.",
    features: Object.freeze(["Directo en vehiculo", "Acceso con montacarga"]),
    warehouseCount: 8
  }),
  Object.freeze({
    id: 4,
    name: "Bogotá Chapinero",
    location: "Oeste",
    city: "Bogotá",
    sizes: ["30 m²", "45 m²", "60 m²", "80 m²"],
    price: 800000,
    priceRange: Object.freeze({ min: 800000, max: 1500000 }),
    rating: 4.0, // Valor completamente fijo
    image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Mini bodegas perfectas para emprendedores.",
    features: Object.freeze(["Sin escaleras", "Acceso en primer piso"]),
    warehouseCount: 20
  }),
  Object.freeze({
    id: 5,
    name: "Barranquilla Puerto",
    location: "Norte",
    city: "Barranquilla",
    sizes: ["80 m²", "120 m²", "150 m²", "250 m²"],
    price: 1100000,
    priceRange: Object.freeze({ min: 1100000, max: 2800000 }),
    rating: 4.6, // Valor completamente fijo
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Bodegas estratégicamente ubicadas cerca del puerto.",
    features: Object.freeze(["Directo en vehiculo", "Ascensor"]),
    warehouseCount: 10
  })
])

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

  // Aplicar filtros - usar deep clone para evitar mutaciones
  useEffect(() => {
    // Crear una copia profunda para asegurar inmutabilidad
    const filtered = WAREHOUSES_DATA.filter(warehouse => {
      // Filtrar por ciudad
      if (ciudadSeleccionada) {
        if (warehouse.city.toLowerCase() !== ciudadSeleccionada.toLowerCase()) {
          return false
        }
      }

      // Filtrar por ubicación dentro de la ciudad
      if (filters.location) {
        if (warehouse.location.toLowerCase() !== filters.location.toLowerCase()) {
          return false
        }
      }

      // Filtrar por precio
      if (filters.priceRange && filters.priceRange[1] < 3500000) {
        if (warehouse.price > filters.priceRange[1]) {
          return false
        }
      }

      // Filtrar por tamaño
      if (filters.size) {
        const sizeNumber = parseInt(warehouse.sizes[0])
        switch (filters.size) {
          case '1-5 m²':
            if (!(sizeNumber >= 1 && sizeNumber <= 5)) return false
            break
          case '5-15 m²':
            if (!(sizeNumber > 5 && sizeNumber <= 15)) return false
            break
          case '15-40 m²':
            if (!(sizeNumber > 15 && sizeNumber <= 40)) return false
            break
          case '+40 m²':
            if (!(sizeNumber > 40)) return false
            break
        }
      }

      // Filtrar por características
      if (filters.features && filters.features.length > 0) {
        const hasFeature = filters.features.some(feature => 
          warehouse.features.includes(feature)
        )
        if (!hasFeature) return false
      }

      return true
    })

    setFilteredWarehouses(filtered)
  }, [ciudadSeleccionada, filters])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Título de búsqueda */}
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
        {/* Sidebar */}
        <div className="md:col-span-1">
          <FilterSidebar 
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            ciudadSeleccionada={ciudadSeleccionada}
          />
        </div>

        {/* Grid de bodegas */}
        <div className="md:col-span-3">
          <WarehouseGrid warehouses={filteredWarehouses} />
        </div>
      </div>            
    </div>
  )
}