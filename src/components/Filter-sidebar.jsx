import { useState } from 'react'
import { Filter, X } from 'lucide-react'

export function FilterSidebar({ isOpen, onClose, filters = {}, onFiltersChange }) {
  // Valores por defecto para evitar errores
  const defaultFilters = {
    location: '',
    priceRange: [0, 1000],
    size: '',
    features: [],
    ...filters // Combina con los filtros recibidos
  }

  const [localFilters, setLocalFilters] = useState(defaultFilters)

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
      priceRange: [0, 1000],
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
        w-80 bg-white shadow-lg lg:shadow-none
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          

        {/* Rango de precio */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Precio por mes</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>${localFilters.priceRange?.[0] || 0}</span>
                <span>${localFilters.priceRange?.[1] || 1000}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={localFilters.priceRange?.[1] || 1000}
                onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#ffffffff" }}>Ubicación</h3>
            <select
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: "#2C3A61" }}
            >
              <option value="">Ubicaciones</option>
              <option value="bogota">Norte</option>
              <option value="medellin">Sur</option>
              <option value="cali">Este</option>
              <option value="cartagena">Oeste</option>
            </select>
          </div>

          {/* Tamaño */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Tamaño</h3>
            <div className="space-y-2">
              {['1-5 m²', '5-15 m²', '15-40 m²', '+40 m²'].map((size) => (
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
            <h3 className="font-medium mb-3" style={{ color: "#2C3A61" }}>Tipos de ingreso</h3>
            <div className="space-y-2">
              {['Directo en vehiculo', 'Acceso en primer piso', 'Sin escaleras', 'Acceso con montacarga','Ascensor'].map((feature) => (
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
        <div className="p-6 border-t">
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

export default FilterSidebar