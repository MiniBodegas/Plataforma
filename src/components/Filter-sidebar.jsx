import { useState, useEffect } from 'react'
import { Filter, X, Star } from 'lucide-react'
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
    locations: [],
    priceRange: [0, 3500000],
    size: '',
    features: [],
    rating: 0,
    ...filters
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
      locations: [],
      priceRange: [0, 3500000],
      size: '',
      features: [],
      rating: 0
    }
    setLocalFilters(clearedFilters)
    if (onFiltersChange) {
      onFiltersChange(clearedFilters)
    }
  }

  // ✅ COMPONENTE DE ESTRELLAS PARA CALIFICACIÓN
  const StarRating = ({ rating, onRatingChange, interactive = true }) => {
    const [hoverRating, setHoverRating] = useState(0)

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRatingChange(star)}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-[#2C3A61]">
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white">
          {/* Mapa */}
          {!hideMapOnMobile || (hideMapOnMobile && window.innerWidth >= 768) ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3 text-[#2C3A61]">Ubicación en mapa</h3>
              <MapaBodegas city={ciudadSeleccionada || "Cali"} bodegas={bodegas} />
            </div>
          ) : null}

          {/* ✅ ZONAS DE LA CIUDAD CON TAILWIND FORZADO */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-[#2C3A61]">Zonas de la ciudad</h3>
            <div className="space-y-2">
              {['Norte', 'Sur', 'Este', 'Oeste', 'Centro'].map((location) => (
                <label key={location} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={location}
                    checked={localFilters.locations?.includes(location) || false}
                    onChange={(e) => {
                      const currentLocations = localFilters.locations || []
                      const locations = e.target.checked
                        ? [...currentLocations, location]
                        : currentLocations.filter(l => l !== location)
                      handleFilterChange('locations', locations)
                    }}
                    className="
                      w-4 h-4 
                      bg-white 
                      border-2 border-gray-300 
                      rounded 
                      checked:bg-[#4B799B] 
                      checked:border-[#4B799B] 
                      focus:ring-2 focus:ring-[#4B799B] focus:ring-opacity-50
                      text-white
                      cursor-pointer
                      appearance-none
                      relative
                      checked:after:content-['✓']
                      checked:after:absolute
                      checked:after:top-0
                      checked:after:left-0.5
                      checked:after:text-white
                      checked:after:text-xs
                      checked:after:font-bold
                    "
                  />
                  <span className="text-sm text-[#2C3A61] select-none">{location}</span>
                </label>
              ))}
            </div>
            {/* Contador de zonas seleccionadas */}
            {localFilters.locations && localFilters.locations.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 bg-white">
                {localFilters.locations.length} zona{localFilters.locations.length !== 1 ? 's' : ''} seleccionada{localFilters.locations.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* ✅ TAMAÑO CON TAILWIND FORZADO */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-[#2C3A61]">Tamaño</h3>
            <div className="space-y-2">
              {['1-15 m³', '15-40 m³', '+42 m³'].map((size) => (
                <label key={size} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={size}
                    checked={localFilters.size === size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="
                      w-4 h-4 
                      bg-white 
                      border-2 border-gray-300 
                      rounded-full 
                      checked:bg-[#4B799B] 
                      checked:border-[#4B799B] 
                      focus:ring-2 focus:ring-[#4B799B] focus:ring-opacity-50
                      cursor-pointer
                      appearance-none
                      relative
                      checked:after:content-['']
                      checked:after:absolute
                      checked:after:top-1/2
                      checked:after:left-1/2
                      checked:after:transform
                      checked:after:-translate-x-1/2
                      checked:after:-translate-y-1/2
                      checked:after:w-1.5
                      checked:after:h-1.5
                      checked:after:bg-white
                      checked:after:rounded-full
                    "
                  />
                  <span className="text-sm text-[#2C3A61] select-none">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rango de precio */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-[#2C3A61]">Precio por mes</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#2C3A61]">
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
                className="
                  w-full h-2 
                  bg-gray-200 
                  rounded-lg 
                  appearance-none 
                  cursor-pointer
                  slider:bg-[#4B799B]
                  slider:h-2
                  slider:rounded-lg
                  slider:border-0
                  thumb:appearance-none
                  thumb:h-4
                  thumb:w-4
                  thumb:rounded-full
                  thumb:bg-[#4B799B]
                  thumb:cursor-pointer
                "
              />
            </div>
          </div>

          {/* ✅ TIPOS DE ACCESO CON TAILWIND FORZADO */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-[#2C3A61]">Tipos de acceso</h3>
            <div className="space-y-2">
              {['Directo en vehiculo', 'Acceso en primer piso', 'Sin escaleras', 'Acceso con montacarga', 'Ascensor'].map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
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
                    className="
                      w-4 h-4 
                      bg-white 
                      border-2 border-gray-300 
                      rounded 
                      checked:bg-[#4B799B] 
                      checked:border-[#4B799B] 
                      focus:ring-2 focus:ring-[#4B799B] focus:ring-opacity-50
                      text-white
                      cursor-pointer
                      appearance-none
                      relative
                      checked:after:content-['✓']
                      checked:after:absolute
                      checked:after:top-0
                      checked:after:left-0.5
                      checked:after:text-white
                      checked:after:text-xs
                      checked:after:font-bold
                    "
                  />
                  <span className="text-sm text-[#2C3A61] select-none">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ✅ CALIFICACIÓN MÍNIMA - AL FINAL */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-[#2C3A61]">Calificación mínima</h3>
            <div className="space-y-3">
              <StarRating 
                rating={localFilters.rating || 0}
                onRatingChange={(rating) => {
                  const newRating = localFilters.rating === rating ? 0 : rating
                  handleFilterChange('rating', newRating)
                }}
              />
              <div className="text-xs text-gray-500 bg-white">
                Haz clic en una estrella para filtrar por calificación mínima
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-white">
          <button
            onClick={clearFilters}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-[#2C3A61] font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </>
  )
}

