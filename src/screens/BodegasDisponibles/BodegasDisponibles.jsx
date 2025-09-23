import { useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Carrousel, MapaBodegas, CompanyDescription, SizeCardReserved, TestimonialsSection } from "../../components/index"
import { useWarehouseDetail } from "../../hooks/useWarehouseDetail"

export function BodegasDisponibles() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { warehouse, loading, error } = useWarehouseDetail(id)

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

  // Validaciones adicionales para los componentes
  const safeWarehouse = {
    id: warehouse.id,
    name: warehouse.name || 'Empresa sin nombre',
    description: warehouse.description || 'Sin descripción disponible',
    address: warehouse.address || 'Dirección no disponible',
    features: warehouse.features || [],
    rating: warehouse.rating || 0,
    reviewCount: warehouse.reviewCount || 0,
    images: warehouse.images || [],
    availableSizes: warehouse.availableSizes || [],
    city: warehouse.city || 'Ciudad no disponible',
    zone: warehouse.zone || 'Zona no disponible',
    miniBodegas: warehouse.miniBodegas || [],
    ...warehouse // Mantener otras propiedades
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

      {/* Pasar datos seguros a los componentes */}
      <Carrousel 
        images={safeWarehouse.images}
        title={safeWarehouse.name}
      />
      
      <CompanyDescription 
        warehouse={safeWarehouse}
        name={safeWarehouse.name}
        description={safeWarehouse.description}
        address={safeWarehouse.address}
        features={safeWarehouse.features}
        rating={safeWarehouse.rating}
        reviewCount={safeWarehouse.reviewCount}
      />
      
      <SizeCardReserved 
        warehouse={safeWarehouse}
        availableSizes={safeWarehouse.availableSizes}
        companyName={safeWarehouse.name} // Prop específica que necesita SizeCardReserved
      />

      <MapaBodegas 
        city={safeWarehouse.city}
        zone={safeWarehouse.zone}
        address={safeWarehouse.address}
        bodegas={safeWarehouse.miniBodegas}
        className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="600px"
      />

      <TestimonialsSection />
    </div>
  )
}
