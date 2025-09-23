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

  if (loading) {
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
        {/* Header con flecha de regreso */}
        <div className="p-4">
          <button
            onClick={handleBack}
            className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors"
          >
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
        {/* Header con flecha de regreso */}
        <div className="p-4">
          <button
            onClick={handleBack}
            className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-center text-gray-600 text-lg">Bodega no encontrada</p>
        </div>
      </div>
    )
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

      {/* Pasar datos reales a los componentes */}
      <Carrousel 
        images={warehouse.images}
        title={warehouse.name}
      />
      
      <CompanyDescription 
        warehouse={warehouse}
        name={warehouse.name}
        description={warehouse.description}
        address={warehouse.address}
        features={warehouse.features}
        rating={warehouse.rating}
        reviewCount={warehouse.reviewCount}
      />
      
      <SizeCardReserved 
        warehouse={warehouse}
        availableSizes={warehouse.availableSizes}
      />

      <MapaBodegas 
        city={warehouse.city}
        zone={warehouse.zone}
        address={warehouse.address}
        bodegas={warehouse.miniBodegas}
        className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="600px"
      />

      <TestimonialsSection />
    </div>
  )
}
