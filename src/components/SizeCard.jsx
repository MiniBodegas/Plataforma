import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Search } from 'lucide-react';

export function SizeGuideSection() {
  const navigate = useNavigate();
  
  // ✅ NUEVOS ESTADOS PARA EL POPUP
  const [showCityPopup, setShowCityPopup] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  
  // ✅ LISTA DE CIUDADES DISPONIBLES
  const availableCities = [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
    "Manizales",
    "Armenia",
    "Neiva",
    "Villavicencio",
    "Ibagué",
    "Pasto"
  ];
  
  // ✅ FILTRAR CIUDADES BASADO EN BÚSQUEDA
  useEffect(() => {
    if (citySearch.trim() === '') {
      setFilteredCities(availableCities);
    } else {
      const normalized = citySearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = availableCities.filter(city => 
        city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalized)
      );
      setFilteredCities(filtered);
    }
  }, [citySearch]);
  
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
      maxMetraje: null, // sin límite superior
      description: [
        "Importaciones",
        "Inventario",
        "Mobiliario oficina",
        "Estantería/Estibas",
        "Materiales y equipos"
      ],
      image: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ]

  // ✅ MODIFICADO: Mostrar popup en lugar de navegar directamente
  const handleVerBodegas = (guide) => {
    console.log('🔍 Abriendo popup para:', guide.title);
    setSelectedGuide(guide);
    setShowCityPopup(true);
    setCitySearch('');
    setFilteredCities(availableCities);
  };

  // ✅ NUEVA FUNCIÓN: Navegar después de seleccionar ciudad
  const handleCitySelect = (city) => {
    if (!selectedGuide) return;
    
    console.log('🔍 Ciudad seleccionada:', city);
    console.log('🔍 Guía seleccionada:', selectedGuide);
    
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
    
    // Navegar a la página de búsqueda con los filtros
    navigate(`/bodegas?${searchParams.toString()}`);
  };

  return (
    <>
      {/* ✅ NUEVO: POPUP DE SELECCIÓN DE CIUDAD */}
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
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Selecciona la ciudad donde quieres buscar mini bodegas{' '}
                <span className="font-medium">{selectedGuide?.title}</span>
              </p>
              
              {/* Campo de búsqueda */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ciudad..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              
              {/* Lista de ciudades */}
              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
                {filteredCities.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron ciudades
                  </div>
                ) : (
                  filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{city}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setShowCityPopup(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
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
