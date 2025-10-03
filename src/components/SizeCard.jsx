import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin } from 'lucide-react';

export function SizeGuideSection() {
  const navigate = useNavigate();
  
  // Estados simplificados
  const [showCityPopup, setShowCityPopup] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState('');
  
  const sizeGuides = [
    {
      title: "Desde 1 m³ hasta 15 m³",
      minMetraje: 1,
      maxMetraje: 15,
      description: [
        "Trasteo de apartaestudio",
        "Cajas y maletas", 
        "Equipo deportivo",
        "Archivo"
      ],
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    },
    {
      title: "Desde 15 m³ hasta 40 m³",
      minMetraje: 15,
      maxMetraje: 40,
      description: [
        "Mudanza 2-3 habitaciones", 
        "Electrodomésticos", 
        "Stock de e-commerce", 
        "Archivo empresarial"
      ],
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Más de 42 m³",
      minMetraje: 42,
      maxMetraje: null,
      description: [
        "Importaciones",
        "Inventario",
        "Mobiliario oficina",
        "Estantería/Estibas",
        "Materiales y equipos"
      ],
      image: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  // Mostrar popup en lugar de navegar directamente
  const handleVerBodegas = (guide) => {
    console.log('🔍 Abriendo popup para:', guide.title);
    setSelectedGuide(guide);
    setShowCityPopup(true);
    setCityInput('');
    setError('');
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cityInput.trim()) {
      setError('Por favor ingresa una ciudad');
      return;
    }
    
    handleSearch(cityInput.trim());
  };

  // Navegar a búsqueda con la ciudad ingresada
  const handleSearch = (city) => {
    if (!selectedGuide) return;
    
    console.log('🔍 Ciudad ingresada:', city);
    
    // Construir URL con los parámetros de búsqueda
    const searchParams = new URLSearchParams();
    searchParams.append('ciudad', city);
    
    // Añadir parámetros de filtro basados en el rango
    if (selectedGuide.minMetraje && selectedGuide.maxMetraje) {
      searchParams.append('minMetraje', selectedGuide.minMetraje);
      searchParams.append('maxMetraje', selectedGuide.maxMetraje);
    } else if (selectedGuide.minMetraje) {
      searchParams.append('minMetraje', selectedGuide.minMetraje);
    } else if (selectedGuide.maxMetraje) {
      searchParams.append('maxMetraje', selectedGuide.maxMetraje);
    }
    
    // Cerrar el popup y resetear estados
    setShowCityPopup(false);
    setSelectedGuide(null);
    setCityInput('');
    
    // Navegar a la página de búsqueda con los filtros
    navigate(`/bodegas?${searchParams.toString()}`);
  };

  return (
    <>
      {/* POPUP DE ENTRADA DE CIUDAD */}
      {showCityPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
                ¿Dónde quieres buscar?
              </h3>
              <button 
                onClick={() => setShowCityPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Contenido */}
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  Ingresa la ciudad donde quieres buscar mini bodegas{' '}
                  <span className="font-medium">{selectedGuide?.title}</span>
                </p>
                
                {/* Campo de entrada */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: Bogotá, Medellín, Cali..."
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    autoFocus
                  />
                </div>
                
                {/* Mensaje de error */}
                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                
                {/* Sugerencias populares */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Ciudades populares:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Bogotá", "Medellín", "Cali"].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setCityInput(city);
                          setError('');
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t p-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowCityPopup(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4B799B] hover:bg-[#3b5f7a] text-white rounded-md transition-colors"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ color: "#2C3A61" }}>
            Guías de tamaños
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            {sizeGuides.map((guide, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md min-h-[500px] flex flex-col max-w-xs mx-auto border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="h-48 w-full object-cover rounded-lg mb-4"
                />
                
                <h3 className="font-semibold text-lg mb-4" style={{ color: "#2C3A61" }}>
                  {guide.title}
                </h3>
                
                <div className="flex-1 mb-6">
                  <p className="text-sm font-medium mb-3" style={{ color: "#2C3A61" }}>
                    Ideal para:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guide.description.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleVerBodegas(guide)}
                  className="w-full py-3 px-4 rounded-md font-medium transition-colors text-white"
                  style={{ 
                    backgroundColor: "#4B799B",
                    border: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#3b5f7a";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#4B799B";
                  }}
                >
                  Buscar minibodega
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
