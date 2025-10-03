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
  const [ciudadBuscada, setCiudadBuscada] = useState("") // <- Solo se actualiza al buscar
  const navigate = useNavigate()

  // Título: SOLO cambia cuando hay búsqueda confirmada
  const tituloCiudad = ciudadBuscada.trim()

  // (Opcional) cargar desde ?ciudad= si vuelves a la landing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get("ciudad")
    if (c) {
      setCiudadBuscada(c)   // <- esto sí cambia el título porque es "resultado" de un flujo de búsqueda previa
      setSearchQuery(c)
    }
  }, [])

  const normalizarTexto = (texto) => {
    if (!texto) return ""
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

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
        .from("mini_bodegas")
        .select("ciudad")
        .eq("disponible", true)
        .not("ciudad", "is", null)
        .not("ciudad", "eq", "")

      if (error || !miniBodegas || miniBodegas.length === 0) {
        setAvailableCities([])
        return
      }

      const ciudadesMap = new Map()
      miniBodegas.forEach((bodega) => {
        const ciudadOriginal = bodega.ciudad?.trim()
        if (!ciudadOriginal) return
        const ciudadNormalizada = normalizarTexto(ciudadOriginal)
        const ciudadFormateada = ciudadOriginal
          .toLowerCase()
          .split(" ")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" ")
        if (!ciudadesMap.has(ciudadNormalizada)) {
          ciudadesMap.set(ciudadNormalizada, {
            formateada: ciudadFormateada,
          })
        }
      })

      const ciudadesUnicas = Array.from(ciudadesMap.values())
        .map((c) => c.formateada)
        .sort()

      setAvailableCities(ciudadesUnicas)
    } catch (error) {
      setAvailableCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const generarSugerencias = (query) => {
    if (!query || query.length < 2 || availableCities.length === 0) {
      setSuggestions([])
      return
    }

    const sugerenciasConScore = availableCities
      .map((ciudad) => ({
        ciudad,
        score: calcularSimilaridad(query, ciudad),
        displayName: ciudad,
      }))
      .filter((item) => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    setSuggestions(sugerenciasConScore)
  }

  const handleInputChange = (e) => {
    const valor = e.target.value
    setSearchQuery(valor)           // <- NO toca ciudadBuscada
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
    setSearchQuery(ciudadSeleccionada) // <- Solo input
    setShowSuggestions(false)
    setSuggestions([])
    handleSearch(ciudadSeleccionada)   // <- Aquí sí se confirmará la búsqueda
  }

  const handleSearch = async (customQuery) => {
    const query = (customQuery || searchQuery).trim()
    if (!query) {
      alert("Por favor ingresa una ciudad para buscar.")
      return
    }

    setLoading(true)
    setShowSuggestions(false)

    try {
      const queryNormalizado = normalizarTexto(query)

      const ciudadEncontrada = availableCities.find((ciudad) => {
        const ciudadNormalizada = normalizarTexto(ciudad)
        const similitud = calcularSimilaridad(queryNormalizado, ciudadNormalizada)
        return similitud > 70
      })

      if (!ciudadEncontrada) {
        const ciudadMasCercana = availableCities
          .map((ciudad) => ({
            ciudad,
            score: calcularSimilaridad(queryNormalizado, normalizarTexto(ciudad)),
          }))
          .sort((a, b) => b.score - a.score)[0]

        if (ciudadMasCercana && ciudadMasCercana.score > 30) {
          const confirmar = window.confirm(
            `Buscaste "${query}" pero no encontramos bodegas exactas.\n\n¿Quieres buscar en "${ciudadMasCercana.ciudad}" en su lugar?`
          )
          if (confirmar) {
            setLoading(false)
            handleSearch(ciudadMasCercana.ciudad)
            return
          }
        } else {
          alert(
            `Buscaste "${query}" pero no se encontraron bodegas disponibles en esa ciudad.\n\nIntenta con otra ciudad.`
          )
        }
        setLoading(false)
        return
      }

      // ✅ SOLO aquí actualizamos el título (búsqueda confirmada)
      setCiudadBuscada(query)

      // Pequeño frame para asegurar render antes de mostrar overlay
      requestAnimationFrame(() => {
        setShowOverlay(true)
        setTimeout(() => {
          setShowOverlay(false)
          setLoading(false)
          navigate(`/bodegas?ciudad=${encodeURIComponent(ciudadEncontrada)}`)
        }, 1500)
      })
    } catch (error) {
      console.error("❌ Error en handleSearch:", error)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0])
      } else {
        handleSearch()
      }
    }
  }

  const handleInputBlur = () => {
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
            Buscaste:{" "}
            "<span className="text-[#4B799B] font-bold">{ciudadBuscada || searchQuery}</span>"
          </p>
          <p className="text-sm text-gray-600">Encontrando las mejores opciones para ti...</p>
        </div>
      )}

      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-md p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Columna de textos */}
              <div className="text-left">
                {tituloCiudad ? (
                  <div className="mb-6 sm:mb-8">
                    <h2
                      className="text-3xl sm:text-5xl font-bold leading-tight mb-4"
                      style={{ color: "#2C3A61" }}
                    >
                      Mini bodegas en <span className="text-[#4B799B]">{tituloCiudad}</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600">
                      Encuentra las mejores opciones disponibles para alquilar
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 sm:mb-8">
                    <h2
                      className="text-3xl sm:text-5xl font-bold leading-tight mb-4"
                      style={{ color: "#2C3A61" }}
                    >
                      Encuentra tu mini bodega ideal
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600">
                      Busca y alquila el espacio perfecto para tus necesidades
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
                        if (searchQuery.length >= 2) setShowSuggestions(true)
                      }}
                      onBlur={handleInputBlur}
                      onKeyDown={handleKeyDown}
                      className="pl-10 py-2 border rounded-[10px] w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || showOverlay || loadingCities}
                    />

                    {/* Sugerencias */}
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
                                <span style={{ color: "#2C3A61" }}>{sugerencia.displayName}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No hay sugerencias */}
                    {showSuggestions &&
                      searchQuery.length >= 2 &&
                      suggestions.length === 0 &&
                      !loading &&
                      !loadingCities && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 z-10">
                          <div className="px-4 py-3 text-gray-500 text-sm text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span>🔍</span>
                              <span>No encontramos esa ciudad</span>
                            </div>
                            <p className="text-xs">
                              Intenta con otra ciudad o presiona Enter para buscar de todas formas
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Loading sugerencias */}
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
                      "Buscar"
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
