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
  const [suggestions, setSuggestions] = useState([])
  const [lastSearchedCity, setLastSearchedCity] = useState("")
  const navigate = useNavigate()

  // Función para normalizar texto (quitar acentos, convertir a minúsculas)
  const normalizarTexto = (texto) => {
    if (!texto) return ''
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

  // Función para calcular similaridad entre strings
  const calcularSimilaridad = (str1, str2) => {
    const s1 = normalizarTexto(str1)
    const s2 = normalizarTexto(str2)
    
    if (!s1 || !s2) return 0
    
    if (s1 === s2) return 100
    if (s2.includes(s1)) return 80
    if (s1.includes(s2)) return 70
    
    let matches = 0
    const minLength = Math.min(s1.length, s2.length)
    
    for (let i = 0; i < minLength; i++) {
      if (s1[i] === s2[i]) matches++
    }
    
    return (matches / Math.max(s1.length, s2.length)) * 60
  }

  useEffect(() => {
    fetchAvailableCities()
  }, [])

  const fetchAvailableCities = async () => {
    try {
      setLoadingCities(true)

      const { data: miniBodegas, error } = await supabase
        .from('mini_bodegas')
        .select('ciudad')
        .eq('disponible', true)
        .not('ciudad', 'is', null)
        .not('ciudad', 'eq', '')

      if (error) {
        setAvailableCities([])
        return
      }

      if (!miniBodegas || miniBodegas.length === 0) {
        setAvailableCities([])
        return
      }

      const ciudadesMap = new Map()
      
      miniBodegas.forEach(bodega => {
        const ciudadOriginal = bodega.ciudad?.trim()
        if (!ciudadOriginal) return

        const ciudadNormalizada = normalizarTexto(ciudadOriginal)
        
        const ciudadFormateada = ciudadOriginal
          .toLowerCase()
          .split(' ')
          .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
          .join(' ')

        if (!ciudadesMap.has(ciudadNormalizada)) {
          ciudadesMap.set(ciudadNormalizada, {
            original: ciudadOriginal,
            normalizada: ciudadNormalizada,
            formateada: ciudadFormateada,
            displayName: ciudadFormateada
          })
        }
      })

      const ciudadesUnicas = Array.from(ciudadesMap.values())
        .map(ciudad => ciudad.formateada)
        .sort()
      
      setAvailableCities(ciudadesUnicas)

    } catch (error) {
      setAvailableCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const generarSugerencias = (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    if (availableCities.length === 0) {
      setSuggestions([])
      return
    }

    const sugerenciasConScore = availableCities
      .map(ciudad => ({
        ciudad: ciudad,
        ciudadNormalizada: normalizarTexto(ciudad),
        score: calcularSimilaridad(query, ciudad),
        displayName: ciudad
      }))
      .filter(item => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    setSuggestions(sugerenciasConScore)
  }

  const handleInputChange = (e) => {
    const valor = e.target.value
    setSearchQuery(valor)
    
    // ✅ NO LIMPIAR lastSearchedCity cuando el usuario esté escribiendo
    // Solo generar sugerencias
    
    if (valor.length >= 2) {
      setShowSuggestions(true)
      generarSugerencias(valor)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleSuggestionSelect = (sugerencia) => {
    const ciudadSeleccionada = sugerencia.displayName
    setSearchQuery(ciudadSeleccionada)
    setShowSuggestions(false)
    setSuggestions([])
    handleSearch(ciudadSeleccionada)
  }

  const handleSearch = async (customQuery) => {
    const query = customQuery || searchQuery
    if (!query.trim()) {
      alert("Por favor ingresa una ciudad para buscar.")
      return
    }

    setLoading(true)
    setShowSuggestions(false)
    
    try {
      const queryNormalizado = normalizarTexto(query)

      const ciudadEncontrada = availableCities.find(ciudad => {
        const ciudadNormalizada = normalizarTexto(ciudad)
        const similitud = calcularSimilaridad(queryNormalizado, ciudadNormalizada)
        return similitud > 70
      })

      if (!ciudadEncontrada) {
        const ciudadMasCercana = availableCities
          .map(ciudad => ({
            ciudad,
            score: calcularSimilaridad(queryNormalizado, normalizarTexto(ciudad))
          }))
          .sort((a, b) => b.score - a.score)[0]

        if (ciudadMasCercana && ciudadMasCercana.score > 30) {
          const confirmar = window.confirm(
            `Buscaste "${query}" pero no encontramos bodegas exactas.\n\n¿Quieres buscar en "${ciudadMasCercana.ciudad}" en su lugar?`
          )
          
          if (confirmar) {
            // ✅ ACTUALIZAR CIUDAD BUSCADA
            setLastSearchedCity(ciudadMasCercana.ciudad)
            setSearchQuery(ciudadMasCercana.ciudad)
            handleSearch(ciudadMasCercana.ciudad)
            return
          }
        } else {
          alert(`Buscaste "${query}" pero no se encontraron bodegas disponibles en esa ciudad.\n\nIntenta con otra ciudad.`)
        }
        return
      }

      // ✅ GUARDAR LA CIUDAD QUE SE ESTÁ BUSCANDO
      setLastSearchedCity(ciudadEncontrada)
      setSearchQuery(ciudadEncontrada)
      setShowOverlay(true)
      
      setTimeout(() => {
        setShowOverlay(false)
        navigate(`/bodegas?ciudad=${encodeURIComponent(ciudadEncontrada)}`)
      }, 1500)

    } catch (error) {
      alert("Error al realizar la búsqueda. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0])
      } else {
        handleSearch()
      }
    }
  }

  const handleInputBlur = (e) => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <span className="text-[#2C3A61] text-xl font-semibold mb-4">
            Buscando bodegas...
          </span>
          <svg className="animate-spin h-8 w-8 text-[#2C3A61] mb-4" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#2C3A61" strokeWidth="4" fill="none" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="#4B799B" strokeWidth="4" fill="none" />
          </svg>
          <p className="text-lg text-gray-700 font-medium mb-2">
            Buscaste: "<span className="text-[#4B799B] font-bold">{lastSearchedCity}</span>"
          </p>
          <p className="text-sm text-gray-600">
            Encontrando las mejores opciones para ti...
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

                {/* ✅ MOSTRAR BÚSQUEDA ANTERIOR - SIEMPRE QUE EXISTA */}
                {lastSearchedCity && !showOverlay && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-base text-gray-700 mb-2">
                      <span className="font-medium">Última búsqueda:</span>"<span className="font-semibold" style={{ color: "#2C3A61" }}>{lastSearchedCity}</span>"
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 relative">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={loadingCities ? "Cargando..." : "¿En qué ciudad buscas?"}
                      value={searchQuery}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (searchQuery.length >= 2) {
                          setShowSuggestions(true)
                        }
                      }}
                      onBlur={handleInputBlur}
                      onKeyPress={handleKeyPress}
                      className="pl-10 py-2 border rounded-[10px] w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || showOverlay || loadingCities}
                    />
                    
                    {/* Sugerencias inteligentes */}
                    {showSuggestions && suggestions.length > 0 && !loading && !showOverlay && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {suggestions.map((sugerencia, index) => (
                          <div
                            key={index}
                            onClick={() => handleSuggestionSelect(sugerencia)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span style={{ color: "#2C3A61" }}>
                                  {sugerencia.displayName}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mensaje cuando no hay sugerencias */}
                    {showSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && !loading && !loadingCities && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 z-10">
                        <div className="px-4 py-3 text-gray-500 text-sm text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span>🔍</span>
                            <span>No encontramos esa ciudad</span>
                          </div>
                          <p className="text-xs">Intenta con otra ciudad o presiona Enter para buscar de todas formas</p>
                        </div>
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
                    onClick={() => handleSearch()}
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

// En useBodegasDisponibles.js o donde hagas la consulta de bodegas filtradas

const fetchBodegasDisponibles = async () => {
  try {
    setLoading(true)
    setError(null)

    console.log('🔍 Obteniendo bodegas disponibles con filtros:', filtros)

    // Construir query base - SOLO BODEGAS DISPONIBLES
    let query = supabase
      .from('mini_bodegas')
      .select(`
        *,
        empresas!inner(
          id,
          nombre,
          ciudad as empresa_ciudad,
          descripcion as empresa_descripcion
        )
      `)
      .eq('disponible', true)

    // ✅ APLICAR FILTRO DE CIUDAD CON NORMALIZACIÓN
    if (filtros.ciudad) {
      const ciudadNormalizada = normalizarTexto(filtros.ciudad)
      
      // Obtener todas las bodegas primero y filtrar en el cliente
      // para manejar las diferentes variantes de escritura
      const { data: todasLasBodegas, error: bodegasError } = await query

      if (bodegasError) {
        throw bodegasError
      }

      // Filtrar por ciudad con normalización
      const bodegasFiltradas = todasLasBodegas?.filter(bodega => {
        const ciudadBodega = normalizarTexto(bodega.ciudad || '')
        return calcularSimilaridad(ciudadNormalizada, ciudadBodega) > 80
      }) || []

      // Procesar las bodegas filtradas...
      const bodegasConEstado = await Promise.all(
        bodegasFiltradas.map(async (bodega) => {
          // ... resto de la lógica de procesamiento
        })
      )

      setBodegas(bodegasConEstado.filter(bodega => bodega.available))
      
    } else {
      // Si no hay filtro de ciudad, proceder normalmente
      const { data: bodegasData, error: bodegasError } = await query

      // ... resto de la lógica normal
    }

  } catch (err) {
    console.error('❌ Error en useBodegasDisponibles:', err)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// Función auxiliar para normalizar
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

// Función auxiliar para calcular similaridad
const calcularSimilaridad = (str1, str2) => {
  const s1 = str1
  const s2 = str2
  
  if (s1 === s2) return 100
  if (s2.includes(s1)) return 80
  if (s1.includes(s2)) return 70
  
  let matches = 0
  const minLength = Math.min(s1.length, s2.length)
  
  for (let i = 0; i < minLength; i++) {
    if (s1[i] === s2[i]) matches++
  }
  
  return (matches / Math.max(s1.length, s2.length)) * 60
}