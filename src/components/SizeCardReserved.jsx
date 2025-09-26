import { useNavigate } from 'react-router-dom';

export function SizeCardReserved({ 
  warehouse = {}, 
  availableSizes = [],
  companyName = "Empresa sin nombre" 
}) {
  const navigate = useNavigate();

  // ✅ DEBUG PARA VER QUÉ LLEGA
  console.log('🔍 SizeCardReserved - Datos recibidos:', {
    warehouse: warehouse.name,
    miniBodegas: warehouse.miniBodegas?.length || 0,
    ciudadesDeLasBodegas: warehouse.miniBodegas?.map(b => b.ciudad),
    miniBodegasCompletas: warehouse.miniBodegas?.map(b => ({
      id: b.id,
      ciudad: b.ciudad,
      zona: b.zona,
      metraje: b.metraje,
      precio: b.precio_mensual
    }))
  });

  // ✅ USAR DIRECTAMENTE LAS MINI BODEGAS YA FILTRADAS
  const miniBodegasFiltradas = warehouse.miniBodegas || [];

  console.log('✅ Mini bodegas a usar para cards:', miniBodegasFiltradas.length);

  // ✅ CREAR CARDS SOLO CON LAS BODEGAS FILTRADAS (NO usar datos estáticos)
  const sizeGuides = miniBodegasFiltradas.map(bodega => ({
    id: bodega.id,
    title: `${bodega.metraje}m³`,
    description: bodega.descripcion || `Mini bodega de ${bodega.metraje}m³ en ${bodega.ciudad}${bodega.zona ? ` - ${bodega.zona}` : ''}`,
    image: bodega.imagen_url || "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop",
    precio: parseFloat(bodega.precio_mensual) || 0,
    tamaño: `${bodega.metraje}m³`,
    address: bodega.direccion || 'Dirección disponible al reservar',
    city: bodega.ciudad,
    zone: bodega.zona,
    content: bodega.contenido_permitido || 'Almacenamiento general',
    available: bodega.disponible !== false,
    // Datos adicionales
    empresaId: bodega.empresa_id,
    dimensiones: bodega.dimensiones,
    seguridad: bodega.seguridad,
    acceso: bodega.acceso,
    caracteristicas: bodega.caracteristicas
  }));

  console.log('✅ SizeGuides generadas:', {
    total: sizeGuides.length,
    cards: sizeGuides.map(s => ({
      title: s.title,
      precio: s.precio,
      ciudad: s.city,
      disponible: s.available
    }))
  });

  const handleReservar = (guia) => {
    console.log('🔗 Reservando bodega:', guia);
    
    navigate('/reservas', {
      state: {
        bodegaSeleccionada: {
          // Datos de la empresa
          name: warehouse?.name || companyName,
          location: warehouse?.location || `${warehouse?.city || 'Ciudad'}, ${warehouse?.zone || 'Zona'}`,
          city: warehouse?.city || guia.city || 'Ciudad no disponible',
          zone: warehouse?.zone || guia.zone || 'Zona no disponible',
          
          // Datos específicos de la mini bodega
          id: guia.id || null,
          tamaño: guia.tamaño,
          precio: guia.precio,
          description: guia.description,
          image: guia.image,
          address: guia.address || warehouse?.address,
          content: guia.content || 'Contenido general',
          available: guia.available !== undefined ? guia.available : true,
          
          // Datos adicionales de la empresa
          features: warehouse?.features || [],
          rating: warehouse?.rating || 0,
          reviewCount: warehouse?.reviewCount || 0,
          empresaId: warehouse?.id,
          
          // Datos específicos de la mini bodega real
          dimensiones: guia.dimensiones,
          seguridad: guia.seguridad,
          acceso: guia.acceso,
          caracteristicas: guia.caracteristicas
        }
      }
    });
  };

  // Datos seguros para mostrar
  const displayName = warehouse?.name || companyName;
  const displayLocation = warehouse?.location || 
                          `${warehouse?.city || 'Ciudad'}, ${warehouse?.zone || 'Zona'}`;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#2C3A61" }}>
            Elige el tamaño perfecto para ti
          </h2>
          <p className="text-lg text-gray-600">
            En {displayName} - {displayLocation}
          </p>
          
          {/* ✅ MOSTRAR INFO DE FILTRADO */}
          <p className="text-sm text-blue-600 mt-2">
            📍 Mostrando {sizeGuides.length} bodega{sizeGuides.length !== 1 ? 's' : ''} disponible{sizeGuides.length !== 1 ? 's' : ''} en esta ubicación
          </p>
        </div>
        
        {/* ✅ SI NO HAY BODEGAS FILTRADAS, MOSTRAR MENSAJE */}
        {sizeGuides.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-700 text-lg mb-2">
                ⚠️ No hay bodegas disponibles en esta ubicación
              </p>
              <p className="text-sm text-yellow-600">
                Esta empresa no tiene mini bodegas registradas en la ciudad buscada.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sizeGuides.map((guide, index) => (
              <div
                key={guide.id || index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
                      {guide.title}
                    </h3>
                    {/* ✅ BADGE DE DISPONIBILIDAD */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      guide.available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {guide.available ? 'Disponible' : 'Ocupada'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {guide.description}
                  </p>
                  
                  {/* ✅ INFORMACIÓN ADICIONAL DE LA BODEGA REAL */}
                  {guide.address && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">📍 Ubicación:</span> {guide.address}
                      </p>
                    </div>
                  )}
                  
                  {guide.city && guide.zone && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">🏙️ Ciudad:</span> {guide.city} - {guide.zone}
                      </p>
                    </div>
                  )}
                  
                  {guide.content && guide.content !== 'Contenido general' && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">📦 Permitido:</span> {guide.content}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold" style={{ color: "#2C3A61" }}>
                      ${guide.precio.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">por mes</span>
                  </div>
                  
                  <button 
                    onClick={() => handleReservar(guide)}
                    disabled={!guide.available}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      !guide.available 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-[#4B799B] hover:bg-[#3b5f7a] text-white'
                    }`}
                  >
                    {guide.available ? 'Reservar ahora' : 'No disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* ✅ MENSAJE CUANDO TODAS ESTÁN OCUPADAS */}
        {sizeGuides.length > 0 && sizeGuides.every(g => !g.available) && (
          <div className="text-center mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">
              ⚠️ Todas las bodegas en esta ubicación están actualmente ocupadas.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Te recomendamos contactar directamente para conocer próximas disponibilidades.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}