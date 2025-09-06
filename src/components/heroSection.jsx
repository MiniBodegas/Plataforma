import { MapPin } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const navigate = useNavigate()
  
  // Lista de ciudades disponibles
  const availableCities = [
    "Bogotá",
    "Medellín", 
    "Cali",
    "Cartagena",
    "Barranquilla",
    "Bucaramanga",
    "Pereira",
    "Manizales"
  ]

  // Filtrar ciudades basado en la búsqueda
  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCitySelect = (city) => {
    setSearchQuery(city)
    setShowSuggestions(false)
    handleSearch(city)
  }

  const handleSearch = (customQuery) => {
    const query = customQuery || searchQuery
    if (query.trim()) {
      // Verificar si la ciudad existe en la lista
      const cityExists = availableCities.some(city => 
        city.toLowerCase() === query.toLowerCase()
      )
      
      if (cityExists) {
        setShowOverlay(true)
        setShowSuggestions(false)
        setSearchQuery(query) // Mantener el valor buscado en el input
        setTimeout(() => {
          setShowOverlay(false)
          navigate(`/bodegas?ciudad=${encodeURIComponent(query)}`)
          window.location.reload() // Recargar la página después de navegar
        }, 1000)
      } else {
        alert("Ciudad no disponible. Por favor selecciona una ciudad de la lista.")
      }
    }
  }

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <span className="text-[#2C3A61] text-xl font-semibold mb-4">Buscando...</span>
          <svg className="animate-spin h-8 w-8 text-[#2C3A61]" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#2C3A61" strokeWidth="4" fill="none" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="#4B799B" strokeWidth="4" fill="none" />
          </svg>
        </div>
      )}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Columna de textos */}
              <div className="text-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-6" style={{ color: "#2C3A61" }}>
                  La solución a tu medida,
                  <br />
                  para lo que necesites
                  <br />
                  guardar
                </h2>
                <p className="text-gray-600 mb-8" style={{ color: "#2C3A61" }}>
                  Busca y alquila tu mini bodega
                </p>

                <div className="flex gap-2 relative">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Ingresa tu ciudad"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 py-2 border rounded-[10px] w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || showOverlay}
                    />
                    
                    {/* Lista de sugerencias */}
                    {showSuggestions && searchQuery && filteredCities.length > 0 && !loading && !showOverlay && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <div
                            key={index}
                            onClick={() => handleCitySelect(city)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                            style={{ color: "#2C3A61" }}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {city}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleSearch}
                    className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded-[10px] transition-colors"
                    disabled={loading || showOverlay}
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Columna de imagen */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                  alt="Persona relajándose"
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}