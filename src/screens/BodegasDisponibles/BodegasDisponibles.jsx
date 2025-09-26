import { useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Carrousel, MapaBodegas, CompanyDescription, SizeCardReserved, TestimonialsSection } from "../../components/index"
import { useWarehouseDetail } from "../../hooks/useWarehouseDetail"

export function BodegasDisponibles() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { warehouse, loading, error } = useWarehouseDetail(id)

  // ✅ OBTENER FILTROS DE LA URL CON DEBUG
  const ciudadFiltro = searchParams.get('ciudad')
  const zonaFiltro = searchParams.get('zona')
  const empresaFiltro = searchParams.get('empresa')

  const handleBack = () => {
    navigate(-1)
  }

  // Validar que el ID existe
  if (!id) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <button onClick={handleBack} className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-center text-gray-600 text-lg">ID de bodega no válido</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <button onClick={handleBack} className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#4B799B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de la bodega...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <button onClick={handleBack} className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p className="text-lg mb-4">Error al cargar la bodega: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <button onClick={handleBack} className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-center text-gray-600 text-lg">Bodega no encontrada</p>
        </div>
      </div>
    )
  }

  // ✅ DATOS ORIGINALES ANTES DE FILTRAR
  const miniBodegasOriginales = warehouse.miniBodegas || []

  // ✅ APLICAR FILTRADO PASO A PASO
  let miniBodegasFiltradas = [...miniBodegasOriginales]

  // FILTRAR POR CIUDAD
  if (ciudadFiltro && ciudadFiltro !== 'null') {
    const antesDelFiltro = miniBodegasFiltradas.length
    miniBodegasFiltradas = miniBodegasFiltradas.filter(bodega => {
      const coincide = bodega.ciudad?.toLowerCase().includes(ciudadFiltro.toLowerCase())
      
      return coincide
    })
   
  }

  // FILTRAR POR ZONA
  if (zonaFiltro && zonaFiltro !== 'null') {
    const antesDelFiltro = miniBodegasFiltradas.length
    miniBodegasFiltradas = miniBodegasFiltradas.filter(bodega => {
      const coincide = bodega.zona?.toLowerCase().includes(zonaFiltro.toLowerCase())
      return coincide
    })
  }

  // ✅ SI NO HAY BODEGAS EN LA CIUDAD BUSCADA, MOSTRAR MENSAJE
  if ((ciudadFiltro && ciudadFiltro !== 'null') || (zonaFiltro && zonaFiltro !== 'null')) {
    if (miniBodegasFiltradas.length === 0) {
      return (
        <div className="min-h-screen bg-white">
          <div className="p-4">
            <button onClick={handleBack} className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">
                No hay bodegas disponibles en {ciudadFiltro}
                {zonaFiltro && ` - ${zonaFiltro}`}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Esta empresa no tiene ubicaciones en la ciudad buscada
              </p>
              <button 
                onClick={handleBack}
                className="px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
              >
                Regresar
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // ✅ RECALCULAR DATOS CON SOLO LAS BODEGAS FILTRADAS
  const precios = miniBodegasFiltradas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
  const metrajes = miniBodegasFiltradas.map(b => parseFloat(b.metraje)).filter(m => !isNaN(m))
  
  const priceRangeFiltrado = precios.length > 0 ? {
    min: Math.min(...precios),
    max: Math.max(...precios)
  } : { min: 0, max: 0 }

  const sizesFiltrados = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : []

  // ✅ OBTENER UBICACIÓN ESPECÍFICA DE LAS BODEGAS FILTRADAS
  const ciudadesFiltradas = [...new Set(miniBodegasFiltradas.map(b => b.ciudad).filter(Boolean))]
  const zonasFiltradas = [...new Set(miniBodegasFiltradas.map(b => b.zona).filter(Boolean))]

  // ✅ CREAR WAREHOUSE CON DATOS FILTRADOS
  const safeWarehouse = {
    ...warehouse, // Mantener todas las propiedades originales
    miniBodegas: miniBodegasFiltradas, // ✅ SOLO BODEGAS FILTRADAS
    totalBodegas: miniBodegasFiltradas.length, // ✅ CONTADOR FILTRADO
    availableSizes: sizesFiltrados, // ✅ TAMAÑOS FILTRADOS
    priceRange: priceRangeFiltrado, // ✅ PRECIOS FILTRADOS
    city: ciudadesFiltradas[0] || warehouse.city || 'Ciudad no disponible',
    zone: zonasFiltradas[0] || warehouse.zone || 'Zona no disponible',
  }

  // ✅ GENERAR TÍTULO DINÁMICO CON LA CIUDAD
  let tituloEmpresa = safeWarehouse.name || 'Empresa sin nombre'
  if (ciudadFiltro && ciudadFiltro !== 'null') {
    tituloEmpresa += ` - ${ciudadFiltro}`
  }
  if (zonaFiltro && zonaFiltro !== 'null') {
    tituloEmpresa += ` (${zonaFiltro})`
  }

return (
    <div className="min-h-screen bg-white">
      {/* Header con flecha de regreso */}
      <div className="p-4">
        <button
          onClick={handleBack}
          className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* ✅ PASAR WAREHOUSE CON DATOS FILTRADOS */}
      <Carrousel 
        images={safeWarehouse.images}
        title={tituloEmpresa}
      />
      
      <CompanyDescription 
        warehouse={safeWarehouse}
        name={tituloEmpresa}
        description={safeWarehouse.description}
        address={safeWarehouse.address}
        features={safeWarehouse.features}
        rating={safeWarehouse.rating}
        reviewCount={safeWarehouse.reviewCount}
      />
      
      <SizeCardReserved 
        warehouse={safeWarehouse} // ✅ CONTIENE SOLO MINI BODEGAS FILTRADAS
        availableSizes={safeWarehouse.availableSizes}
        companyName={tituloEmpresa}
      />

      <MapaBodegas 
        city={safeWarehouse.city}
        zone={safeWarehouse.zone}
        address={safeWarehouse.address}
        bodegas={safeWarehouse.miniBodegas} // ✅ SOLO BODEGAS FILTRADAS
        className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="600px"
      />

      <TestimonialsSection />
    </div>
  )
}
