import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { MapaBodegas } from './index'

const bodegas = [
  { id: 1, name: "Bodega Norte", city: "Cali", coords: [3.4706, -76.5290] },
  { id: 2, name: "Bodega Sur", city: "Cali", coords: [3.3895, -76.5310] },
  { id: 3, name: "Bodega Centro", city: "Cali", coords: [3.4516, -76.5320] },
  { id: 4, name: "Bodega Bogotá", city: "Bogotá", coords: [4.7110, -74.0721] },
  { id: 5, name: "Bodega Medellín", city: "Medellín", coords: [6.2442, -75.5812] },
]

export function FilterSidebar({ isOpen, onClose, filters = {}, onFiltersChange, ciudadSeleccionada, hideMapOnMobile }) {
  // Valores por defecto para evitar errores
  const defaultFilters = {
    location: '',
    priceRange: [0, 3500000],
    size: '',
    features: [],
    ...filters // Combina con los filtros recibidos
  }

  const [localFilters, setLocalFilters] = useState(defaultFilters)

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setLocalFilters({ ...defaultFilters, ...filters })
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      priceRange: [0, 3500000],
      size: '',
      features: []
    }
    setLocalFilters(clearedFilters)
    if (onFiltersChange) {
      onFiltersChange(clearedFilters)
    }
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-full max-w-xs sm:max-w-sm lg:w-80 bg-white shadow-lg lg:shadow-none
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold" style={{ color: "#2C3A61" }}>
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Mapa */}
          {!hideMapOnMobile || (hideMapOnMobile && window.innerWidth >= 768) ? (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Ubicación en mapa</h3>
              <MapaBodegas city={ciudadSeleccionada || "Cali"} bodegas={bodegas} />
            </div>
          ) : null}

          {/* Rango de precio */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Precio por mes</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>${(localFilters.priceRange?.[0] || 0).toLocaleString()}</span>
                <span>${(localFilters.priceRange?.[1] || 3500000).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3500000"
                step="100000"
                value={localFilters.priceRange?.[1] || 3500000}
                onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Zona de la ciudad</h3>
            <select
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-[#2C3A61]"
            >
              <option value="">Todas las zonas</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Este">Este</option>
              <option value="Oeste">Oeste</option>
            </select>
          </div>

          {/* Tamaño */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Tamaño</h3>
            <div className="space-y-2">
              {['1-5 m³', '5-15 m³', '15-40 m³', '+40 m³'].map((size) => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="size"
                    value={size}
                    checked={localFilters.size === size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm" style={{ color: "#2C3A61" }}>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Características */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Tipos de acceso</h3>
            <div className="space-y-2">
              {['Directo en vehiculo', 'Acceso en primer piso', 'Sin escaleras', 'Acceso con montacarga', 'Ascensor'].map((feature) => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={feature}
                    checked={localFilters.features?.includes(feature) || false}
                    onChange={(e) => {
                      const currentFeatures = localFilters.features || []
                      const features = e.target.checked
                        ? [...currentFeatures, feature]
                        : currentFeatures.filter(f => f !== feature)
                      handleFilterChange('features', features)
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm" style={{ color: "#2C3A61" }}>{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t">
          <button
            onClick={clearFilters}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            style={{ color: "#2C3A61" }}
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </>
  )
}

