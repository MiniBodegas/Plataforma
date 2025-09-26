import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroSection, FilterSidebar, WarehouseGrid,WarehouseCard } from '../../components/index'
import { useWarehouses } from '../../hooks/useWarehouses'

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
  const zonaSeleccionada = searchParams.get('zona') || ''
  const empresaSeleccionada = searchParams.get('empresa') || ''
  
  const { warehouses, loading, error, refetch } = useWarehouses()

  // ✅ DEBUG: Ver datos que llegan
  console.log('🔍 BodegaScreen - Datos recibidos:', {
    totalWarehouses: warehouses.length,
    ciudadBuscada: ciudadSeleccionada,
    zonaBuscada: zonaSeleccionada,
    empresaBuscada: empresaSeleccionada,
    warehouses: warehouses.map(w => ({
      name: w.name,
      cities: w.cities,
      zones: w.zones,
      location: w.location,
      totalBodegas: w.totalBodegas
    }))
  })

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ FILTRADO CORREGIDO - Buscar en los datos reales de mini_bodegas
  useEffect(() => {
    if (!warehouses.length) {
      setFilteredWarehouses([])
      return
    }

    console.log('🔍 Aplicando filtros específicos por ciudad...')

    const filtered = warehouses.map(warehouse => {
      // ✅ CREAR COPIA DEL WAREHOUSE FILTRADO POR CIUDAD
      let filteredWarehouse = { ...warehouse }
      let bodegasFiltradas = [...warehouse.miniBodegas]

      // ✅ FILTRAR MINI BODEGAS POR CIUDAD
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

      // ✅ FILTRAR POR ZONA
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

      // Aplicar otros filtros...
      return filteredWarehouse
      
    }).filter(Boolean) // Remover nulls

    console.log('🎯 Warehouses filtrados específicamente:', filtered.length)
    setFilteredWarehouses(filtered)
    
  }, [warehouses, ciudadSeleccionada, zonaSeleccionada, empresaSeleccionada, filters])

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

  // ✅ GENERAR TÍTULO DINÁMICO
  const generarTitulo = () => {
    const partes = []
    if (empresaSeleccionada) partes.push(empresaSeleccionada)
    if (zonaSeleccionada) partes.push(zonaSeleccionada)  
    if (ciudadSeleccionada) partes.push(ciudadSeleccionada)
    
    if (partes.length > 0) {
      return `Bodegas ${partes.join(' - ')} (${filteredWarehouses.length} resultados)`
    }
    return `Bodegas disponibles (${filteredWarehouses.length} resultados)`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* ✅ TÍTULO DINÁMICO MEJORADO */}
      {(ciudadSeleccionada || zonaSeleccionada || empresaSeleccionada) && (
        <div className="bg-white border-b px-6 py-4">
          <div className="max-w-[1500px] mx-auto">
            <h2 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
              {generarTitulo()}
            </h2>
            
            {/* ✅ DEBUG INFO EN DESARROLLO */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                <strong>Debug:</strong> Total DB: {warehouses.length} | 
                Filtrados: {filteredWarehouses.length} | 
                Buscando ciudad: "{ciudadSeleccionada}" | 
                Zona: "{zonaSeleccionada}" | 
                Empresa: "{empresaSeleccionada}"
              </div>
            )}
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
          />
        </div>
        <div className="md:col-span-3">
          {filteredWarehouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <WarehouseCard 
                  key={warehouse.id} 
                  warehouse={warehouse}
                  // ✅ AGREGAR ESTA LÍNEA CON EL FILTRO ACTIVO
                  filtroActivo={{
                    ciudad: ciudadSeleccionada,
                    zona: zonaSeleccionada, 
                    empresa: empresaSeleccionada
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
                onClick={() => {
                  setCiudadSeleccionada('')
                  setZonaSeleccionada('')
                  setEmpresaSeleccionada('')
                  setFilters({
                    minPrice: '',
                    maxPrice: '',
                    minSize: '',
                    maxSize: ''
                  })
                }}
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
