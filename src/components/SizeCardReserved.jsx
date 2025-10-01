import { useNavigate } from 'react-router-dom';

export function SizeCardReserved({ 
  warehouse = {}, 
  availableSizes = [],
  companyName = "Empresa sin nombre" 
}) {
  const navigate = useNavigate();

  // ✅ USAR DIRECTAMENTE LAS MINI BODEGAS YA FILTRADAS
  const miniBodegasFiltradas = warehouse.miniBodegas || [];

  // ✅ OBTENER UBICACIÓN REAL DE LAS BODEGAS FILTRADAS
  const ubicacionesFiltradas = miniBodegasFiltradas.map(b => ({
    ciudad: b.ciudad,
    zona: b.zona
  }));

  // ✅ OBTENER CIUDAD Y ZONA DE LAS BODEGAS FILTRADAS (NO del warehouse general)
  const ciudadesUnicas = [...new Set(ubicacionesFiltradas.map(u => u.ciudad).filter(Boolean))];
  const zonasUnicas = [...new Set(ubicacionesFiltradas.map(u => u.zona).filter(Boolean))];

  // ✅ CREAR UBICACIÓN BASADA EN LAS BODEGAS FILTRADAS
  const ubicacionReal = ciudadesUnicas.length > 0 
    ? `${ciudadesUnicas.join(', ')}${zonasUnicas.length > 0 ? ` - ${zonasUnicas.join(', ')}` : ''}`
    : 'Ubicación no especificada';

  console.log('🔍 SizeCardReserved - Ubicación DEBUG:', {
    bodegasFiltradas: miniBodegasFiltradas.length,
    ciudadesUnicas,
    zonasUnicas,
    ubicacionReal,
    warehouseLocation: warehouse?.location, // Para comparar
    primerasBodegas: miniBodegasFiltradas.slice(0, 3).map(b => ({
      ciudad: b.ciudad,
      zona: b.zona,
      id: b.id,
      disponible: b.disponible
    }))
  });

  // ✅ CREAR CARDS CON TODAS LAS BODEGAS (disponibles y ocupadas)
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
    available: true, // ✅ SIEMPRE TRUE - IGNORAR ESTADO DE DISPONIBILIDAD
    // Datos adicionales
    empresaId: bodega.empresa_id,
    dimensiones: bodega.dimensiones,
    seguridad: bodega.seguridad,
    acceso: bodega.acceso,
    caracteristicas: bodega.caracteristicas
  }));

  const handleReservar = (guia) => {  
    navigate('/reservas', {
      state: {
        bodegaSeleccionada: {
          // Datos de la empresa
          name: warehouse?.name || companyName,
          location: `${guia.city || 'Ciudad'}, ${guia.zone || 'Zona'}`, // ✅ USAR UBICACIÓN DE LA BODEGA ESPECÍFICA
          city: guia.city || 'Ciudad no disponible',
          zone: guia.zone || 'Zona no disponible',
          
          // Datos específicos de la mini bodega
          id: guia.id || null,
          tamaño: guia.tamaño,
          precio: guia.precio,
          description: guia.description,
          image: guia.image,
          address: guia.address || warehouse?.address,
          content: guia.content || 'Contenido general',
          available: true, // ✅ SIEMPRE TRUE
          
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

  // ✅ DATOS SEGUROS PARA MOSTRAR - USAR UBICACIÓN REAL
  const displayName = warehouse?.name || companyName;
  const displayLocation = ubicacionReal; // ✅ USAR UBICACIÓN DE BODEGAS FILTRADAS

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
        </div>
        
        {/* ✅ SI NO HAY BODEGAS FILTRADAS, MOSTRAR MENSAJE */}
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
                  {/* ✅ QUITAR COMPLETAMENTE LA ETIQUETA DE DISPONIBILIDAD */}
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
                      {guide.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {guide.description}
                  </p>
                  
                  {/* ✅ INFORMACIÓN ADICIONAL DE LA BODEGA REAL */}
                  {guide.address && guide.address !== 'Dirección disponible al reservar' && (
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
                  
                  {guide.content && guide.content !== 'Almacenamiento general' && (
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
                  
                  {/* ✅ BOTÓN SIEMPRE ACTIVO - SIN CONDICIONALES */}
                  <button 
                    onClick={() => handleReservar(guide)}
                    className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-[#4B799B] hover:bg-[#3b5f7a] text-white"
                  >
                    Reservar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}