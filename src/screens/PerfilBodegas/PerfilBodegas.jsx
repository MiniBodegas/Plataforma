import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Carrousel, PerfilCard, MapaBodegas, TestimonialsSection, CompanyDescripcionPerfil } from "../../components";
import { useWarehouseDetail } from "../../hooks/useWarehouseDetail";

export function PerfilBodegas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { warehouse, loading, error } = useWarehouseDetail(id);

  const handleBack = () => {
    navigate(-1);
  };

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
    );
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
            <p className="text-gray-600">Cargando perfil de la bodega...</p>
          </div>
        </div>
      </div>
    );
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
            <p className="text-lg mb-4">Error al cargar el perfil: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
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
          <p className="text-center text-gray-600 text-lg">Perfil de bodega no encontrado</p>
        </div>
      </div>
    );
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
    companyImage: warehouse.companyImage || '',
    ...warehouse // Mantener otras propiedades
  }

  // Debug
  console.log('🏢 PerfilBodegas renderizando con:', {
    id,
    warehouse: safeWarehouse,
    hasImages: safeWarehouse.images.length,
    hasMiniBodegas: safeWarehouse.miniBodegas.length
  })

  // Debug extendido
  console.log('🏢 PerfilBodegas - Datos completos:', {
    id,
    warehouse,
    safeWarehouse,
    hasDescription: !!safeWarehouse.description,
    hasFeatures: safeWarehouse.features.length > 0,
    hasCompanyImage: !!safeWarehouse.companyImage,
    empresaDescripcion: warehouse?.empresaDescripcion
  })

  return (
    <div className="bg-white">
      {/* Header con flecha de regreso */}
      <div className="p-4">
        <button
          onClick={handleBack}
          className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Carrusel con datos reales */}
      <Carrousel 
        images={safeWarehouse.images}
        title={safeWarehouse.name}
      />
      
      {/* Descripción del perfil con datos reales */}
      <CompanyDescripcionPerfil 
        warehouse={safeWarehouse}
        name={safeWarehouse.name}
        description={safeWarehouse.description}
        address={safeWarehouse.address}
        features={safeWarehouse.features}
        rating={safeWarehouse.rating}
        reviewCount={safeWarehouse.reviewCount}
        companyImage={safeWarehouse.companyImage}
      />
      
      {/* Tarjetas de perfil con datos reales */}
      <PerfilCard 
        warehouse={safeWarehouse}
        availableSizes={safeWarehouse.availableSizes}
        miniBodegas={safeWarehouse.miniBodegas}
      />
      
      {/* Mapa con ubicaciones reales */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#2C3A61" }}>
            Nuestras Ubicaciones - {safeWarehouse.name}
          </h2>
          <MapaBodegas 
            city={safeWarehouse.city}
            zone={safeWarehouse.zone}
            address={safeWarehouse.address}
            bodegas={safeWarehouse.miniBodegas}
            className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
            height="500px"
          />
          
          {/* Información adicional de ubicación */}
          {safeWarehouse.miniBodegas.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                <span className="font-medium">{safeWarehouse.miniBodegas.length}</span> mini bodegas disponibles en{' '}
                <span className="font-medium">{safeWarehouse.city}</span>
              </p>
            </div>
          )}
        </div>
      </section>
      
      <TestimonialsSection />
    </div>
  );
}