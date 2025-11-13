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

  // ✅ CONSOLE.LOG DETALLADO PARA DEBUG
  console.log('🔍 ===== DEBUG COMPLETO SEDE =====');
  console.log('📦 Warehouse completo:', warehouse);
  console.log('🏢 empresa_id:', empresaIdToFetch);
  console.log('🔗 URL Params:', {
    sedeId: sedeIdFromParams,
    ciudad: ciudadFromParams,
    ciudadFiltro,
    zonaFiltro
  });
  console.log('🏛️ Sedes del hook (todas):', sedesHook);
  console.log('📊 Total sedes encontradas:', sedesHook.length);

  // Construir candidatas y elegir sedeFinal (igual que en CompanyDescription, pero solo con useSedes)
  const rawCandidates = Array.isArray(sedesHook) ? [...sedesHook] : []

  console.log('🎯 Candidatas para selección:', rawCandidates);

  let sedeFinal = null
  if (sedeIdFromParams) {
    sedeFinal = rawCandidates.find(s => String(s?.id) === String(sedeIdFromParams)) || null
    console.log('1️⃣ Búsqueda por sedeId:', sedeIdFromParams, '→', sedeFinal ? `✅ Encontrada: ${sedeFinal.ciudad}` : '❌ No encontrada');
  }
  if (!sedeFinal && ciudadFromParams) {
    console.log('2️⃣ Intentando buscar por ciudad:', ciudadFromParams);
    
    const porDireccion = rawCandidates.find(s => s?.direccion && String(s.ciudad).toLowerCase() === String(ciudadFromParams).toLowerCase());
    const porCiudad = rawCandidates.find(s => String(s.ciudad).toLowerCase() === String(ciudadFromParams).toLowerCase());
    
    console.log('  - Por dirección:', porDireccion ? `✅ ${porDireccion.ciudad}` : '❌');
    console.log('  - Por ciudad:', porCiudad ? `✅ ${porCiudad.ciudad}` : '❌');
    
    sedeFinal = porDireccion || porCiudad || null;
    console.log('  - Resultado:', sedeFinal ? `✅ ${sedeFinal.ciudad}` : '❌');
  }
  if (!sedeFinal) {
    console.log('3️⃣ Fallback a primera sede disponible');
    
    const conDireccion = rawCandidates.find(s => s?.direccion);
    const principal = rawCandidates.find(s => s?.principal);
    const primera = rawCandidates[0];
    
    console.log('  - Con dirección:', conDireccion ? `✅ ${conDireccion.ciudad}` : '❌');
    console.log('  - Principal:', principal ? `✅ ${principal.ciudad}` : '❌');
    console.log('  - Primera:', primera ? `✅ ${primera.ciudad}` : '❌');
    
    sedeFinal = conDireccion || principal || primera || null;
  }

  console.log('🎯 SEDE FINAL SELECCIONADA:', sedeFinal);
  console.log('📍 Datos de la sede:', {
    id: sedeFinal?.id,
    ciudad: sedeFinal?.ciudad,
    zona: sedeFinal?.zona,
    direccion: sedeFinal?.direccion,
    principal: sedeFinal?.principal
  });

  // ✅ FILTRAR BODEGAS POR LA SEDE SELECCIONADA
  console.log('🏗️ Filtrando mini bodegas...');
  let bodegasFiltradas = warehouse?.miniBodegas || []

  console.log('📦 Total bodegas antes de filtrar:', bodegasFiltradas.length);
  console.log('📦 Todas las bodegas:', bodegasFiltradas.map(b => ({
    id: b.id,
    ciudad: b.ciudad,
    sede_id: b.sede_id,
    metraje: b.metraje
  })));

  // ✅ PRIMERO FILTRAR POR SEDE
  if (sedeFinal?.id) {
    const bodegasAntes = bodegasFiltradas.length;
    bodegasFiltradas = bodegasFiltradas.filter(bodega => 
      String(bodega.sede_id) === String(sedeFinal.id)
    );
    console.log(`🏛️ Filtrado por sede (${sedeFinal.ciudad}):`, {
      antes: bodegasAntes,
      despues: bodegasFiltradas.length,
      sede_id: sedeFinal.id
    });
  }

  // Filtrar por ciudad si viene en la URL (adicional al filtro de sede)
  if (ciudadFiltro) {
    const bodegasAntes = bodegasFiltradas.length;
    bodegasFiltradas = bodegasFiltradas.filter(bodega => 
      bodega.ciudad && bodega.ciudad.toLowerCase() === ciudadFiltro.toLowerCase()
    );
    console.log(`🏙️ Filtrado por ciudad (${ciudadFiltro}):`, {
      antes: bodegasAntes,
      despues: bodegasFiltradas.length
    });
  }

  // Filtrar por zona si viene en la URL
  if (zonaFiltro) {
    const bodegasAntes = bodegasFiltradas.length;
    bodegasFiltradas = bodegasFiltradas.filter(bodega => 
      bodega.zona && bodega.zona.toLowerCase() === zonaFiltro.toLowerCase()
    );
    console.log(`📍 Filtrado por zona (${zonaFiltro}):`, {
      antes: bodegasAntes,
      despues: bodegasFiltradas.length
    });
  }

  console.log('✅ BODEGAS FINALES FILTRADAS:', bodegasFiltradas.length);
  console.log('📦 Bodegas filtradas:', bodegasFiltradas.map(b => ({
    id: b.id,
    ciudad: b.ciudad,
    sede_id: b.sede_id,
    metraje: b.metraje
  })));

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

  // IMÁGENES DE LA SEDE
  let sedeImages = [];
  if (sedeFinal?.imagen_url) {
    if (typeof sedeFinal.imagen_url === "string" && sedeFinal.imagen_url.startsWith("[")) {
      try {
        const arr = JSON.parse(sedeFinal.imagen_url);
        if (Array.isArray(arr)) sedeImages = arr;
      } catch (e) {
        sedeImages = [sedeFinal.imagen_url];
      }
    } else {
      sedeImages = [sedeFinal.imagen_url];
    }
  }

  console.log('🔍 ===========================');

  // ============================================
  // ✅ AHORA SÍ LOS RETURNS CONDICIONALES
  // ============================================

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

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================

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
        images={sedeImages}
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

      {/* ✅ MAPA CON SEDE CORRECTA */}
      <MapaBodegas 
        city={sedeFinal?.ciudad || warehouse.city || ciudadFiltro}
        zone={sedeFinal?.zona || warehouse.zone || zonaFiltro}
        address={sedeFinal?.direccion || warehouse.address}
        bodegas={bodegasFiltradas}
        sede={sedeFinal}
        className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="300px"
      />

      <TestimonialsSection />
    </div>
  )
}
