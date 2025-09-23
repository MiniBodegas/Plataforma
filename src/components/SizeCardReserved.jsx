import { useNavigate } from 'react-router-dom';

// Componente para mostrar las tarjetas de tamaño reservado
export function SizeCardReserved({ 
  warehouse = {}, 
  availableSizes = [],
  companyName = "Empresa sin nombre" 
}) {
  const navigate = useNavigate();

  // Usar datos reales de la base de datos o fallback a datos estáticos
  const realSizes = availableSizes.length > 0 ? availableSizes : null;

  // Datos estáticos como fallback
  const defaultSizeGuides = [
    {
      title: "Desde 10 m³",
      description: "Ideales para objetos de uso casual, grandes, de temporada o con finalidad de almacenamiento.",
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      precio: 50000,
      tamaño: "1-10 m³"
    },
    {
      title: "Desde 20 m³",
      description: "Ideales para el contenido de una habitación completa o una casa pequeña.",
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      precio: 120000,
      tamaño: "19-29 m³"
    },
    {
      title: "Más de 30 m³",
      description: "Ideales para el contenido de una casa completa o una oficina con sus respectivos muebles.",
      image: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      precio: 250000,
      tamaño: "29+ m³"
    },
  ];

  // Usar datos reales si están disponibles, sino usar datos por defecto
  const sizeGuides = realSizes ? realSizes.map(size => ({
    title: size.size,
    description: size.description || `Mini bodega de ${size.size} disponible para alquiler`,
    image: size.image || "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop",
    precio: size.price,
    tamaño: size.size,
    id: size.id,
    address: size.address,
    city: size.city,
    zone: size.zone,
    content: size.content,
    available: size.available
  })) : defaultSizeGuides;

  const handleReservar = (guia) => {
    navigate('/reservas', {
      state: {
        bodegaSeleccionada: {
          // Usar datos seguros del warehouse
          name: warehouse?.name || companyName,
          location: warehouse?.location || `${warehouse?.city || 'Ciudad'}, ${warehouse?.zone || 'Zona'}`,
          city: warehouse?.city || 'Ciudad no disponible',
          zone: warehouse?.zone || 'Zona no disponible',
          tamaño: guia.tamaño,
          precio: guia.precio,
          description: guia.description,
          image: guia.image,
          // Datos adicionales de la bodega
          features: warehouse?.features || [],
          rating: warehouse?.rating || 0,
          reviewCount: warehouse?.reviewCount || 0,
          // Si es un tamaño real de la DB, incluir datos adicionales
          id: guia.id || null,
          address: guia.address || warehouse?.address,
          content: guia.content || 'Contenido general',
          available: guia.available !== undefined ? guia.available : true,
          empresaId: warehouse?.id
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
        </div>
        
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
                <h3 className="text-xl font-semibold mb-3" style={{ color: "#2C3A61" }}>
                  {guide.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {guide.description}
                </p>
                
                {/* Mostrar información adicional si es de la DB */}
                {guide.address && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Ubicación:</span> {guide.address}
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
                  disabled={guide.available === false}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    guide.available === false 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-[#4B799B] hover:bg-[#3b5f7a] text-white'
                  }`}
                >
                  {guide.available === false ? 'No disponible' : 'Reservar ahora'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {realSizes && realSizes.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">
              No hay tamaños específicos disponibles. Mostrando opciones generales.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}