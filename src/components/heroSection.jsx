import { MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [availableCities, setAvailableCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const navigate = useNavigate()

  // ✅ CARGAR CIUDADES DINÁMICAMENTE desde la DB
  useEffect(() => {
    fetchAvailableCities()
  }, [])

  const fetchAvailableCities = async () => {
    try {
      setLoadingCities(true)
      console.log('🔍 Consultando ciudades disponibles desde la DB...')

      // Consultar todas las ciudades únicas de mini_bodegas
      const { data: miniBodegas, error } = await supabase
        .from('mini_bodegas')
        .select('ciudad')
        .not('ciudad', 'is', null)
        .not('ciudad', 'eq', '')

      if (error) {
        console.error('❌ Error consultando ciudades:', error)
        // Fallback a ciudades por defecto si hay error
        setAvailableCities([
          "Bogotá", "Medellín", "Cali", "Cartagena", 
          "Barranquilla", "Bucaramanga", "Pereira", "Manizales"
        ])
        return
      }

      // Extraer ciudades únicas y ordenarlas
      const ciudadesUnicas = [...new Set(miniBodegas.map(b => b.ciudad))]
        .filter(ciudad => ciudad && ciudad.trim()) // Filtrar valores vacíos
        .sort() // Ordenar alfabéticamente

      console.log('✅ Ciudades encontradas en DB:', ciudadesUnicas)

      if (ciudadesUnicas.length > 0) {
        setAvailableCities(ciudadesUnicas)
      } else {
        // Si no hay ciudades en la DB, usar fallback
        console.log('⚠️ No se encontraron ciudades en la DB, usando fallback')
        setAvailableCities([
          "Bogotá", "Medellín", "Cali", "Cartagena", 
          "Barranquilla", "Bucaramanga", "Pereira", "Manizales"
        ])
      }

    } catch (error) {
      console.error('❌ Error fetching cities:', error)
      // Fallback en caso de error
      setAvailableCities([
        "Bogotá", "Medellín", "Cali", "Cartagena", 
        "Barranquilla", "Bucaramanga", "Pereira", "Manizales"
      ])
    } finally {
      setLoadingCities(false)
    }
  }

  // Filtrar ciudades basado en la búsqueda
  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCitySelect = (city) => {
    setSearchQuery(city)
    setShowSuggestions(false)
    handleSearch(city)
  }

  const handleSearch = async (customQuery) => {
    const query = customQuery || searchQuery
    if (!query.trim()) {
      alert("Por favor ingresa una ciudad para buscar.")
      return
    }

    setLoading(true)
    
    try {
      console.log('🔍 Buscando bodegas en:', query)

      // ✅ VERIFICAR SI HAY BODEGAS EN ESA CIUDAD
      const { data: bodegasEnCiudad, error } = await supabase
        .from('mini_bodegas')
        .select('id, ciudad, empresa_id')
        .ilike('ciudad', `%${query}%`) // Búsqueda case-insensitive
        .limit(1) // Solo necesitamos saber si existe al menos una

      if (error) {
        console.error('❌ Error verificando ciudad:', error)
        alert("Error al verificar la ciudad. Intenta de nuevo.")
        return
      }

      console.log('📊 Bodegas encontradas:', bodegasEnCiudad?.length || 0)

      if (!bodegasEnCiudad || bodegasEnCiudad.length === 0) {
        alert(`No se encontraron bodegas disponibles en "${query}". Intenta con otra ciudad.`)
        return
      }

      // ✅ HAY BODEGAS, PROCEDER CON LA NAVEGACIÓN
      setShowOverlay(true)
      setShowSuggestions(false)
      setSearchQuery(query)
      
      setTimeout(() => {
        setShowOverlay(false)
        navigate(`/bodegas?ciudad=${encodeURIComponent(query)}`)
      }, 1000)

    } catch (error) {
      console.error('❌ Error en búsqueda:', error)
      alert("Error al realizar la búsqueda. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // ✅ MANEJAR CLICK FUERA PARA CERRAR SUGERENCIAS
  const handleInputBlur = (e) => {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <span className="text-[#2C3A61] text-xl font-semibold mb-4">Buscando bodegas...</span>
          <svg className="animate-spin h-8 w-8 text-[#2C3A61]" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#2C3A61" strokeWidth="4" fill="none" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="#4B799B" strokeWidth="4" fill="none" />
          </svg>
          <p className="text-sm text-gray-600 mt-2">
            Buscando en {searchQuery}...
          </p>
        </div>
      )}
      
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-md p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Columna de textos */}
              <div className="text-left">
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight" style={{ color: "#2C3A61" }}>
                  La solución a tu medida,
                  <br />
                  para lo que necesites
                  <br />
                  guardar
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8" style={{ color: "#2C3A61" }}>
                  Busca y alquila tu mini bodega
                </p>

                <div className="flex flex-col sm:flex-row gap-2 relative">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={loadingCities ? "Cargando ciudades..." : "Ingresa tu ciudad"}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={handleInputBlur}
                      onKeyPress={handleKeyPress}
                      className="pl-10 py-2 border rounded-[10px] w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || showOverlay || loadingCities}
                    />
                    
                    {/* Lista de sugerencias */}
                    {showSuggestions && searchQuery && !loading && !showOverlay && !loadingCities && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city, index) => (
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
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-sm">
                            No se encontraron ciudades que coincidan
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Loading para sugerencias */}
                    {loadingCities && showSuggestions && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 z-10">
                        <div className="px-4 py-2 text-gray-500 text-sm flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                          Cargando ciudades...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleSearch}
                    className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded-[10px] transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || showOverlay || loadingCities}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Buscando...
                      </div>
                    ) : (
                      'Buscar'
                    )}
                  </button>
                </div>

                {/* ✅ MOSTRAR CIUDADES DISPONIBLES */}
                {!loadingCities && availableCities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Ciudades disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableCities.slice(0, 6).map((city, index) => (
                        <button
                          key={index}
                          onClick={() => handleCitySelect(city)}
                          className="text-xs bg-white border border-gray-200 hover:border-[#4B799B] hover:text-[#4B799B] text-gray-600 px-3 py-1 rounded-full transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                      {availableCities.length > 6 && (
                        <span className="text-xs text-gray-500 px-3 py-1">
                          +{availableCities.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Columna de imagen */}
              <div className="relative hidden lg:block">
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