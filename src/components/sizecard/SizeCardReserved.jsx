import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MiniBodegaModal } from './MiniBodegaModal';

export function SizeCardReserved({ 
  warehouse = {}, 
  availableSizes = [],
  companyName = "Empresa sin nombre" 
}) {
  const navigate = useNavigate();
  const [selectedBodega, setSelectedBodega] = useState(null);

  const miniBodegasFiltradas = warehouse.miniBodegas || [];

  // ✅ NOTA: En la DB no existe el campo 'zona', solo 'ciudad'
  const ubicacionesFiltradas = miniBodegasFiltradas.map(b => ({
    ciudad: b.ciudad
  }));

  const ciudadesUnicas = [...new Set(ubicacionesFiltradas.map(u => u.ciudad).filter(Boolean))];

  const ubicacionReal = ciudadesUnicas.length > 0 
    ? ciudadesUnicas.join(', ')
    : 'Ubicación no especificada';

  // ✅ CREAR CARDS PASANDO DATOS REALES DE LA DB
  const sizeGuides = miniBodegasFiltradas.map(bodega => ({
    ...bodega, // ✅ PASAR TODO: disponible, estado, ciudad, metraje, etc.
    
    // Campos adicionales para la UI
    title: `${bodega.metraje}m³`, // ✅ SIEMPRE MOSTRAR m³
    description: bodega.descripcion || `Mini bodega de ${bodega.metraje}m³ en ${bodega.ciudad}`,
    image: bodega.imagen_url || "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop",
    precio: parseFloat(bodega.precio_mensual) || 0,
    tamaño: `${bodega.metraje}m³`,
    
    // ✅ Compatibilidad con código antiguo (estos campos vienen de warehouse/sede, no de mini_bodegas)
    city: bodega.ciudad,
    zone: warehouse.zone || '', // ✅ zona viene de la sede/warehouse, NO de mini_bodegas
    address: warehouse.address || 'Dirección disponible al reservar', // ✅ dirección viene de la sede
  }));

  const handleCardClick = (guia) => {
    setSelectedBodega(guia);
  };

  const handleCloseModal = () => {
    setSelectedBodega(null);
  };

  const displayName = warehouse?.name || companyName;
  const displayLocation = ubicacionReal;

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#2C3A61" }}>
              Elige el tamaño perfecto para ti
            </h2>
            <p className="text-lg text-gray-600">
              En {displayName}
            </p>
          </div>
          
          {sizeGuides.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-yellow-700 text-lg mb-2">
                  ⚠️ No hay bodegas en esta ubicación
                </p>
                <p className="text-sm text-yellow-600">
                  Esta empresa no tiene mini bodegas registradas en la ciudad/zona buscada.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sizeGuides.map((guide, index) => (
                <div
                  key={guide.id || index}
                  onClick={() => handleCardClick(guide)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop";
                    }}
                  />
                  <div className="p-6">
                    {/* ✅ Título: m³ + Badge de disponibilidad */}
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-2xl font-bold" style={{ color: "#2C3A61" }}>
                        {guide.title}
                      </h3>
                      {guide.disponible && guide.estado === 'activa' ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Disponible
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          No disponible
                        </span>
                      )}
                    </div>
                    
                    {/* ✅ Descripción */}
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2 min-h-[40px]">
                      {guide.description}
                    </p>
                    
                    {/* ✅ Ciudad */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <span>📍</span>
                        <span className="font-medium">{guide.city}</span>
                      </p>
                    </div>
                    
                    {/* ✅ Precio */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                      <div>
                        <span className="text-2xl font-bold text-[#2C3A61]">
                          ${guide.precio.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">/ mes</span>
                      </div>
                    </div>
                    
                    {/* Botón */}
                    <div className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-[#4B799B] hover:bg-[#3b5f7a] text-white text-center">
                      Ver detalles
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ Modal */}
      {selectedBodega && (
        <MiniBodegaModal
          bodega={selectedBodega}
          warehouse={warehouse}
          companyName={companyName}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}