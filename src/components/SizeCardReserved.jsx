import { useNavigate } from 'react-router-dom';

export function SizeCardReserved({ bodega }) {
  const navigate = useNavigate();

  const sizeGuides = [
    {
      title: "Desde 1 m² hasta 15 m²",
      description: "Ideales para objetos de uso casual, grandes, de temporada o con finalidad de almacenamiento.",
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      precio: 50000,
      tamaño: "1-15 m²"
    },
    {
      title: "Desde 15 m² hasta 40 m²", 
      description: "Ideales para el contenido de una habitación completa o una casa pequeña.",
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      precio: 120000,
      tamaño: "15-40 m²"
    },
    {
      title: "Más de 42 m²",
      description: "Ideales para el contenido de una casa completa o una gran oficina.",
      image: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      precio: 250000,
      tamaño: "42+ m²"
    },
  ];

  const handleReservar = (guia) => {
    navigate('/reservas', {
      state: {
        bodegaSeleccionada: {
          name: bodega.name,
          location: bodega.location,
          city: bodega.city,
          tamaño: guia.tamaño,
          precio: guia.precio,
          description: guia.description,
          image: guia.image,
          // Datos adicionales de la bodega
          features: bodega.features,
          rating: bodega.rating,
          reviewCount: bodega.reviewCount
        }
      }
    });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#2C3A61" }}>
            Elige el tamaño perfecto para ti
          </h2>
          <p className="text-lg text-gray-600">
            En {bodega.name} - {bodega.location}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sizeGuides.map((guide, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={guide.image}
                alt={guide.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: "#2C3A61" }}>
                  {guide.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {guide.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold" style={{ color: "#2C3A61" }}>
                    ${guide.precio.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">por mes</span>
                </div>
                <button 
                  onClick={() => handleReservar(guide)}
                  className="w-full bg-[#4B799B] hover:bg-[#3b5f7a] text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Reservar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}