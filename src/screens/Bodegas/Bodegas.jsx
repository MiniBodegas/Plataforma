import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroSection, FilterSidebar, WarehouseGrid, WarehouseCard } from '../../components/index'
import { useWarehouses } from '../../hooks/useWarehouses'

export function BodegaScreen() {
  const [searchParams] = useSearchParams()
  const [filteredWarehouses, setFilteredWarehouses] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  
  // ✅ ESTADO DE FILTROS ACTUALIZADO
  const [filters, setFilters] = useState({
    locations: [],
    priceRange: [0, 3500000],
    size: '',
    features: [],
    rating: 0
  })
  
  const ciudadSeleccionada = searchParams.get('ciudad') || ''
  const zonaSeleccionada = searchParams.get('zona') || ''
  const empresaSeleccionada = searchParams.get('empresa') || ''
  
  // ✅ OBTENER PARÁMETROS DE METRAJE DE LA URL
  const minMetrajeParam = searchParams.get('minMetraje')
  const maxMetrajeParam = searchParams.get('maxMetraje')
  
  const { warehouses, loading, error, refetch } = useWarehouses()

  // ✅ APLICAR FILTROS DE URL AL SIDEBAR
  useEffect(() => {
    // Inicializar nuevos filtros basados en los actuales
    const newFilters = { ...filters };
    
    // Procesar parámetros de metraje y actualizar el filtro size
    if (minMetrajeParam || maxMetrajeParam) {
      const min = parseInt(minMetrajeParam);
      const max = parseInt(maxMetrajeParam);
      
      // Convertir los parámetros numéricos a opciones de filtro de tamaño
      if (!isNaN(min) && !isNaN(max)) {
        // Caso: tenemos min y max
        if (min === 1 && max === 15) {
          newFilters.size = '1-15 m³';
        } else if (min === 15 && max === 40) {
          newFilters.size = '15-40 m³';
        }
      } else if (!isNaN(min) && min >= 42) {
        // Caso: solo min = 42+
        newFilters.size = '+42 m³';
      }
      
      console.log('🔍 Aplicando filtro de tamaño:', newFilters.size);
      
      // Actualizar el estado de filtros
      setFilters(newFilters);
    }
  }, [minMetrajeParam, maxMetrajeParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ FUNCIÓN PARA APLICAR FILTROS
  const aplicarFiltros = (warehouse) => {
    // Filtro por zonas (locations)
    if (filters.locations && filters.locations.length > 0) {
      const tieneZonaSeleccionada = warehouse.miniBodegas.some(bodega => 
        filters.locations.some(zona => 
          bodega.zona?.toLowerCase().includes(zona.toLowerCase())
        )
      )
      if (!tieneZonaSeleccionada) return false
    }

    // Filtro por precio
    if (filters.priceRange) {
      const precios = warehouse.miniBodegas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
      if (precios.length > 0) {
        const precioMin = Math.min(...precios)
        const precioMax = Math.max(...precios)
        
        // Si el rango de precios del warehouse no intersecta con el filtro
        if (precioMax < filters.priceRange[0] || precioMin > filters.priceRange[1]) {
          return false
        }
      }
    }

    // ✅ FILTRO POR TAMAÑO MEJORADO - USAR TAMBIÉN minMetrajeParam Y maxMetrajeParam
    if (filters.size || minMetrajeParam || maxMetrajeParam) {
      const tieneMetraje = warehouse.miniBodegas.some(bodega => {
        const metraje = parseFloat(bodega.metraje);
        if (isNaN(metraje)) return false;
        
        // Primero verificar parámetros directos de URL
        if (minMetrajeParam && maxMetrajeParam) {
          const min = parseInt(minMetrajeParam);
          const max = parseInt(maxMetrajeParam);
          if (!isNaN(min) && !isNaN(max)) {
            return metraje >= min && metraje <= max;
          }
        } else if (minMetrajeParam) {
          const min = parseInt(minMetrajeParam);
          if (!isNaN(min)) {
            return metraje >= min;
          }
        } else if (maxMetrajeParam) {
          const max = parseInt(maxMetrajeParam);
          if (!isNaN(max)) {
            return metraje <= max;
          }
        }
        
        // Luego verificar filters.size (que también puede estar establecido por los params de URL)
        switch (filters.size) {
          case '1-15 m³':
            return metraje >= 1 && metraje <= 15;
          case '15-40 m³':
            return metraje > 15 && metraje <= 40;
          case '+42 m³':
            return metraje >= 42;
          default:
            return true;
        }
      });
      
      if (!tieneMetraje) return false;
    }

    // Filtro por características/features
    if (filters.features && filters.features.length > 0) {
      const tieneCaracteristicas = filters.features.every(feature => 
        warehouse.features?.some(wFeature => 
          wFeature.toLowerCase().includes(feature.toLowerCase())
        ) || 
        warehouse.miniBodegas.some(bodega => 
          bodega.caracteristicas?.toLowerCase().includes(feature.toLowerCase())
        )
      )
      if (!tieneCaracteristicas) return false
    }

    // Filtro por calificación
    if (filters.rating > 0) {
      const rating = parseFloat(warehouse.rating) || 0
      if (rating < filters.rating) return false
    }

    return true
  }

  // ✅ FILTRADO CORREGIDO - Aplicar filtros de URL y del sidebar
  useEffect(() => {
    if (!warehouses.length) {
      setFilteredWarehouses([])
      return
    }

    let filtered = warehouses.map(warehouse => {
      // ✅ CREAR COPIA DEL WAREHOUSE FILTRADO POR CIUDAD
      let filteredWarehouse = { ...warehouse }
      let bodegasFiltradas = [...warehouse.miniBodegas]

      // ✅ FILTRAR MINI BODEGAS POR CIUDAD (URL params)
      if (ciudadSeleccionada) {
        bodegasFiltradas = bodegasFiltradas.filter(bodega => 
          bodega.ciudad?.toLowerCase().includes(ciudadSeleccionada.toLowerCase())
        )
        
        if (bodegasFiltradas.length === 0) {
          return null // Esta empresa no tiene bodegas en la ciudad buscada
        }

        // Actualizar datos del warehouse con solo las bodegas de la ciudad
        const precios = bodegasFiltradas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
        const metrajes = bodegasFiltradas.map(b => parseFloat(b.metraje)).filter(m => !isNaN(m))
        
        filteredWarehouse.miniBodegas = bodegasFiltradas
        filteredWarehouse.totalBodegas = bodegasFiltradas.length
        filteredWarehouse.cities = [...new Set(bodegasFiltradas.map(b => b.ciudad))]
        filteredWarehouse.zones = [...new Set(bodegasFiltradas.map(b => b.zona).filter(Boolean))]
        filteredWarehouse.priceRange = precios.length > 0 ? {
          min: Math.min(...precios),
          max: Math.max(...precios)
        } : { min: 0, max: 0 }
        filteredWarehouse.sizes = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : []
        
        // Actualizar location si hay zona específica
        const zonasUnicas = [...new Set(bodegasFiltradas.map(b => b.zona).filter(Boolean))]
        if (zonasUnicas.length > 0) {
          filteredWarehouse.location = `${zonasUnicas[0]} - ${ciudadSeleccionada}`
          filteredWarehouse.name = `${warehouse.name} - ${zonasUnicas[0]}`
        }
      }

      // ✅ FILTRAR POR ZONA (URL params)
      if (zonaSeleccionada) {
        bodegasFiltradas = bodegasFiltradas.filter(bodega => 
          bodega.zona?.toLowerCase().includes(zonaSeleccionada.toLowerCase())
        )
        
        if (bodegasFiltradas.length === 0) {
          return null
        }

        filteredWarehouse.miniBodegas = bodegasFiltradas
        filteredWarehouse.totalBodegas = bodegasFiltradas.length
      }

      // ✅ FILTRAR POR EMPRESA (URL params)
      if (empresaSeleccionada) {
        if (!warehouse.name.toLowerCase().includes(empresaSeleccionada.toLowerCase())) {
          return null
        }
      }

      return filteredWarehouse
      
    }).filter(Boolean) // Remover nulls

    // ✅ APLICAR FILTROS DEL SIDEBAR
    filtered = filtered.filter(aplicarFiltros)

    setFilteredWarehouses(filtered)
    
  }, [warehouses, ciudadSeleccionada, zonaSeleccionada, empresaSeleccionada, filters])

  // ✅ FUNCIÓN PARA LIMPIAR TODOS LOS FILTROS
  const limpiarTodosLosFiltros = () => {
    // Limpiar filtros del sidebar
    setFilters({
      locations: [],
      priceRange: [0, 3500000],
      size: '',
      features: [],
      rating: 0
    })
    
    // Redireccionar sin parámetros de filtro
    window.location.href = `/bodegas${ciudadSeleccionada ? `?ciudad=${ciudadSeleccionada}` : ''}`
  }

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
              onClick={() => refetch && refetch()} 
              className="mt-4 px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ GENERAR TÍTULO DINÁMICO MEJORADO
  const generarTitulo = () => {
    const partes = []
    if (empresaSeleccionada) partes.push(empresaSeleccionada)
    if (zonaSeleccionada) partes.push(zonaSeleccionada)  
    if (ciudadSeleccionada) partes.push(ciudadSeleccionada)
    
    let tamaño = '';
    // Añadir información de tamaño al título
    if (filters.size) {
      tamaño = filters.size;
    } else if (minMetrajeParam && maxMetrajeParam) {
      tamaño = `${minMetrajeParam}-${maxMetrajeParam} m³`;
    } else if (minMetrajeParam) {
      tamaño = `+${minMetrajeParam} m³`;
    } else if (maxMetrajeParam) {
      tamaño = `hasta ${maxMetrajeParam} m³`;
    }
    
    if (tamaño) partes.push(tamaño);
    
    if (partes.length > 0) {
      return `Bodegas ${partes.join(' - ')} (${filteredWarehouses.length} resultados)`
    }
    return `Bodegas disponibles (${filteredWarehouses.length} resultados)`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* ✅ TÍTULO DINÁMICO MEJORADO */}
      {(ciudadSeleccionada || zonaSeleccionada || empresaSeleccionada || 
        minMetrajeParam || maxMetrajeParam ||
        filters.locations.length > 0 || filters.size || filters.features.length > 0 || filters.rating > 0) && (
        <div className="bg-white border-b px-6 py-4">
          <div className="max-w-[1500px] mx-auto">
            <h2 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
              {generarTitulo()}
            </h2>
            {/* ✅ MOSTRAR FILTROS ACTIVOS MEJORADO */}
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
              {ciudadSeleccionada && (
                <span className="bg-green-100 px-2 py-1 rounded">
                  Ciudad: {ciudadSeleccionada}
                </span>
              )}
              {filters.locations.length > 0 && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Zonas: {filters.locations.join(', ')}
                </span>
              )}
              {(filters.size || minMetrajeParam || maxMetrajeParam) && (
                <span className="bg-yellow-100 px-2 py-1 rounded">
                  Tamaño: {
                    filters.size || 
                    (minMetrajeParam && maxMetrajeParam ? `${minMetrajeParam}-${maxMetrajeParam} m³` :
                     minMetrajeParam ? `+${minMetrajeParam} m³` : 
                     maxMetrajeParam ? `hasta ${maxMetrajeParam} m³` : '')
                  }
                </span>
              )}
              {filters.rating > 0 && (
                <span className="bg-yellow-100 px-2 py-1 rounded">
                  ⭐ {filters.rating}+
                </span>
              )}
              {filters.features.length > 0 && (
                <span className="bg-purple-100 px-2 py-1 rounded">
                  +{filters.features.length} características
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden flex justify-end px-4 py-2">
        <button
          className="bg-[#4B799B] text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-[#3b5f7a] transition-colors"
          onClick={() => setShowFilters(true)}
        >
          Filtros ({filteredWarehouses.length})
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
            // ✅ PASAR PARÁMETROS DE URL AL SIDEBAR
            urlParams={{
              minMetraje: minMetrajeParam,
              maxMetraje: maxMetrajeParam
            }}
          />
        </div>
        <div className="md:col-span-3">
          {filteredWarehouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <WarehouseCard 
                  key={warehouse.id} 
                  warehouse={warehouse}
                  filtroActivo={{
                    ciudad: ciudadSeleccionada,
                    zona: zonaSeleccionada, 
                    empresa: empresaSeleccionada,
                    minMetraje: minMetrajeParam,
                    maxMetraje: maxMetrajeParam
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No se encontraron bodegas que coincidan con tu búsqueda
              </p>
              <button
                onClick={limpiarTodosLosFiltros}
                className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-6 py-2 rounded-md"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>            
    </div>
  )
}
