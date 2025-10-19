import { useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Carrousel, MapaBodegas, CompanyDescription, SizeCardReserved, TestimonialsSection } from "../../components/index"
import { useWarehouseDetail } from "../../hooks/useWarehouseDetail"
import { useEffect, } from "react"
import useSedes from "../../hooks/useSedes"

export function BodegasDisponibles() {
  const { id } = useParams()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [id])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { warehouse, loading, error } = useWarehouseDetail(id)

  // Handler para volver atrás
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  // Hooks SIEMPRE antes de cualquier return
  const ciudadFiltro = searchParams.get('ciudad')
  const zonaFiltro = searchParams.get('zona')

  // Selección de sedeFinal usando solo useSedes (sin fetch manual)
  const empresaIdToFetch = warehouse?.empresa_id || warehouse?.id || null
  const sedeIdFromParams = searchParams.get('sede') || searchParams.get('sedeId') || null
  const ciudadFromParams = searchParams.get('ciudad') || null
  const { sedes: sedesHook = [] } = useSedes({ empresaId: empresaIdToFetch, includeMinis: false })

  // Construir candidatas y elegir sedeFinal (igual que en CompanyDescription, pero solo con useSedes)
  const rawCandidates = Array.isArray(sedesHook) ? [...sedesHook] : []

  let sedeFinal = null
  if (sedeIdFromParams) {
    sedeFinal = rawCandidates.find(s => String(s?.id) === String(sedeIdFromParams)) || null
  }
  if (!sedeFinal && ciudadFromParams) {
    sedeFinal =
      rawCandidates.find(s => s?.direccion && String(s.ciudad).toLowerCase() === String(ciudadFromParams).toLowerCase()) ||
      rawCandidates.find(s => String(s.ciudad).toLowerCase() === String(ciudadFromParams).toLowerCase()) ||
      null
  }
  if (!sedeFinal) {
    sedeFinal = rawCandidates.find(s => s?.direccion) || rawCandidates.find(s => s?.principal) || rawCandidates[0] || null
  }

  // Ahora sí, los returns condicionales
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

  // ✅ APLICAR FILTROS DE CIUDAD Y ZONA A LAS BODEGAS
  let bodegasFiltradas = warehouse.miniBodegas || []

  // Filtrar por ciudad si viene en la URL
  if (ciudadFiltro) {
    bodegasFiltradas = bodegasFiltradas.filter(bodega => 
      bodega.ciudad && bodega.ciudad.toLowerCase() === ciudadFiltro.toLowerCase()
    )
  }

  // Filtrar por zona si viene en la URL
  if (zonaFiltro) {
    bodegasFiltradas = bodegasFiltradas.filter(bodega => 
      bodega.zona && bodega.zona.toLowerCase() === zonaFiltro.toLowerCase()
    )
  }

  console.log('🔍 FILTROS APLICADOS:', {
    ciudadFiltro,
    zonaFiltro,
    totalOriginal: warehouse.miniBodegas?.length || 0,
    totalFiltradas: bodegasFiltradas.length
  })

  // ✅ CALCULAR DATOS PARA LOS COMPONENTES CON BODEGAS FILTRADAS
  const precios = bodegasFiltradas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
  const metrajes = bodegasFiltradas.map(b => parseFloat(b.metraje)).filter(m => !isNaN(m))
  
  const priceRange = precios.length > 0 ? {
    min: Math.min(...precios),
    max: Math.max(...precios)
  } : { min: 0, max: 0 }

  const availableSizes = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : []

  // ✅ WAREHOUSE CON BODEGAS FILTRADAS
  const warehouseConFiltros = {
    ...warehouse,
    miniBodegas: bodegasFiltradas,
    availableSizes,
    priceRange,
    totalBodegas: bodegasFiltradas.length
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

      {/* ✅ COMPONENTES CON DATOS FILTRADOS */}
      <Carrousel 
        images={warehouse.images}
        sede={sedeFinal}
      />
      
      <CompanyDescription 
        warehouse={warehouseConFiltros}
        name={warehouse.name}
        description={warehouse.description}
        address={warehouse.address}
        features={warehouse.features}
        rating={warehouse.rating}
        reviewCount={warehouse.reviewCount}
        sede={sedeFinal}
      />
      
      <SizeCardReserved 
        warehouse={warehouseConFiltros}
        availableSizes={warehouseConFiltros.availableSizes}
        companyName={warehouse.name}
      />

      <MapaBodegas 
        city={warehouse.city}
        zone={warehouse.zone}
        address={warehouse.address}
        bodegas={warehouseConFiltros.miniBodegas}
        className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="500px"
      />

      <TestimonialsSection />
    </div>
  )
}
