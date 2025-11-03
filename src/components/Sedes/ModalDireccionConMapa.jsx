import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DireccionInput } from "./DireccionInput";

// Icono personalizado arrastrable
const marcadorIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Componente para mover el mapa
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.5
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

// ✅ Componente de marcador arrastrable
function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onPositionChange(newPos);
          console.log('📍 Nueva posición:', newPos);
        }
      },
    }),
    [onPositionChange],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={marcadorIcon}
    >
    </Marker>
  );
}

// ✅ Componente para hacer click en el mapa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export function ModalDireccionConMapa({
  isOpen,
  onClose,
  onConfirmar,
  ciudadInicial = "",
  direccionInicial = ""
}) {
  const [ciudad, setCiudad] = useState(ciudadInicial);
  const [direccion, setDireccion] = useState(direccionInicial);
  const [coordenadas, setCoordenadas] = useState(null);
  const [mapCenter, setMapCenter] = useState([4.7110, -74.0721]);
  const [mapZoom, setMapZoom] = useState(12);
  const [coordenadasAjustadas, setCoordenadasAjustadas] = useState(false);

  const ciudadesCoords = {
    Cali: [3.4516, -76.5320],
    Bogotá: [4.7110, -74.0721],
    Medellín: [6.2442, -75.5812],
    Barranquilla: [10.9685, -74.7813],
    Cartagena: [10.3910, -75.4794],
    Bucaramanga: [7.1193, -73.1227],
    Pereira: [4.8133, -75.6961],
    Yumbo: [3.5833, -76.4833],
    Bogota: [4.7110, -74.0721],
  };

  // Actualizar mapa cuando cambian las coordenadas
  useEffect(() => {
    if (coordenadas) {
      setMapCenter([coordenadas.lat, coordenadas.lng]);
      setMapZoom(18); // Zoom muy cercano
    } else if (ciudad && ciudadesCoords[ciudad]) {
      setMapCenter(ciudadesCoords[ciudad]);
      setMapZoom(12);
    }
  }, [coordenadas, ciudad]);

  useEffect(() => {
    if (isOpen) {
      setCiudad(ciudadInicial);
      setDireccion(direccionInicial);
      setCoordenadas(null);
      setCoordenadasAjustadas(false);
      
      if (ciudadInicial && ciudadesCoords[ciudadInicial]) {
        setMapCenter(ciudadesCoords[ciudadInicial]);
        setMapZoom(12);
      }
    }
  }, [isOpen, ciudadInicial, direccionInicial]);

  // ✅ Manejar cambio de coordenadas desde DireccionInput
  const handleCoordenadaChange = (coords) => {
    setCoordenadas(coords);
    setCoordenadasAjustadas(false);
  };

  // ✅ Manejar arrastre del marcador
  const handleMarkerDrag = (newPos) => {
    const coords = {
      lat: newPos.lat,
      lng: newPos.lng
    };
    setCoordenadas(coords);
    setCoordenadasAjustadas(true);
    console.log('✅ Marcador arrastrado a:', coords);
  };

  // ✅ Manejar click en el mapa
  const handleMapClick = (latlng) => {
    const coords = {
      lat: latlng.lat,
      lng: latlng.lng
    };
    setCoordenadas(coords);
    setCoordenadasAjustadas(true);
    console.log('✅ Click en mapa:', coords);
  };

  const handleConfirmar = () => {
    if (!ciudad || !direccion) {
      alert("Por favor completa ciudad y dirección");
      return;
    }
    
    if (!coordenadas) {
      alert("Por favor busca y confirma la ubicación en el mapa");
      return;
    }
    
    onConfirmar({
      ciudad,
      direccion,
      coordenadas
    });
    
    onClose();
  };

  const handleCancelar = () => {
    setCiudad("");
    setDireccion("");
    setCoordenadas(null);
    setCoordenadasAjustadas(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancelar}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C3A61] to-[#4B799B] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold">Agregar Dirección</h2>
              <p className="text-sm text-blue-100 mt-1">
                Busca la dirección y ajusta el marcador arrastrándolo o haciendo clic en el mapa
              </p>
            </div>
            <button
              onClick={handleCancelar}
              className="text-white hover:bg-white/20 rounded-full p-2 transition ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel izquierdo: Formulario */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base w-full"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej: Cali, Bogotá, Medellín"
                />
              </div>

              <DireccionInput
                ciudad={ciudad}
                direccion={direccion}
                onDireccionChange={setDireccion}
                onCoordenadaChange={handleCoordenadaChange}
                required
              />

              {/* Información de coordenadas */}
              {coordenadas && (
                <div className={`border rounded-xl p-4 ${coordenadasAjustadas ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-sm font-semibold mb-2 ${coordenadasAjustadas ? 'text-blue-800' : 'text-green-800'}`}>
                    {coordenadasAjustadas ? '🎯 Ubicación ajustada manualmente' : '✓ Ubicación encontrada'}
                  </p>
                  <div className={`text-xs space-y-1 ${coordenadasAjustadas ? 'text-blue-700' : 'text-green-700'}`}>
                    <p>📍 Latitud: {coordenadas.lat.toFixed(7)}</p>
                    <p>📍 Longitud: {coordenadas.lng.toFixed(7)}</p>
                  </div>
                </div>
              )}

              {/* Instrucciones mejoradas */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Instrucciones
                </p>
                <ul className="text-xs text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">1️⃣</span>
                    <span>Ingresa la ciudad y dirección</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">2️⃣</span>
                    <span>Haz clic en "Buscar" para ubicarla</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">3️⃣</span>
                    <span><strong>Arrastra el marcador</strong> o <strong>haz clic en el mapa</strong> para ajustar la ubicación exacta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">4️⃣</span>
                    <span>Confirma cuando esté en la posición correcta</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Panel derecho: Mapa (más grande) */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <div className="bg-gray-100 border-2 border-gray-300 rounded-xl overflow-hidden h-[500px] lg:h-full relative">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="h-full w-full"
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  
                  <MapController center={mapCenter} zoom={mapZoom} />
                  
                  {/* ✅ Click handler para el mapa */}
                  <MapClickHandler onMapClick={handleMapClick} />

                  {/* ✅ Marcador arrastrable */}
                  {coordenadas && (
                    <DraggableMarker 
                      position={[coordenadas.lat, coordenadas.lng]}
                      onPositionChange={handleMarkerDrag}
                    />
                  )}
                </MapContainer>

                {/* Indicador de estado */}
                <div className="absolute top-4 left-4 right-4 flex gap-2 z-[1000]">
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex-1">
                    {coordenadas ? (
                      <span className="text-sm font-semibold text-green-600 flex items-center gap-2">
                        <span>✓</span>
                        {coordenadasAjustadas ? 'Ubicación ajustada' : 'Dirección ubicada'}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <span>📍</span>
                        {ciudad ? `Vista de ${ciudad}` : 'Esperando dirección...'}
                      </span>
                    )}
                  </div>
                  {coordenadas && (
                    <div className="bg-purple-500/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>🖱️</span>
                        Arrástralo o haz clic
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-600">
            {coordenadas 
              ? coordenadasAjustadas 
                ? "🎯 Ubicación ajustada manualmente - Lista para confirmar" 
                : "✓ Ubicación encontrada - Puedes ajustarla arrastrando el marcador"
              : "⚠️ Completa la dirección y búscala en el mapa"}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancelar}
              className="px-6 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={!ciudad || !direccion || !coordenadas}
              className="px-6 py-2 bg-[#2C3A61] text-white rounded-xl font-semibold shadow hover:bg-[#1d2742] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Dirección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}