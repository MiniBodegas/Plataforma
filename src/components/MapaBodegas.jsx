import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import useSedes from "../hooks/useSedes"
import { useMemo } from "react"

const bodegaIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
})

export function MapaBodegas({ 
  bodegas, 
  sedes, 
  empresaId, 
  height = "500px", 
  width = "100%", 
  className = "", 
  style = {} 
}) {
  // Solo traer sedes si no se pasaron directamente y hay bodegas
  const { sedes: sedesHook, loading } = useSedes({ 
    empresaId, 
    includeMinis: false 
  });

  // Usar sedes pasadas por prop o las del hook, con valor por defecto []
  const sedesFinales = sedes && sedes.length > 0 ? sedes : (sedesHook || []);
  const bodegasFinales = bodegas || [];

  // Mapear bodegas con sus sedes para obtener lat/lng y dirección
  const bodegasConSede = useMemo(() => {
    if (!sedesFinales.length || !bodegasFinales.length) return [];

    return bodegasFinales.map(bodega => {
      const sede = sedesFinales.find(s => s.id === bodega.sede_id);
      return {
        ...bodega,
        sede: sede || null
      };
    }).filter(b => b.sede && b.sede.lat && b.sede.lng);
  }, [bodegasFinales, sedesFinales]);

  // Si solo hay sedes (sin bodegas), mostrarlas directamente
  const markersData = bodegasConSede.length > 0 
    ? bodegasConSede 
    : sedesFinales.filter(s => s.lat && s.lng).map(s => ({ sede: s }));

  // Centra el mapa
  const center = markersData.length > 0
    ? [markersData[0].sede.lat, markersData[0].sede.lng]
    : [4.7110, -74.0721];

  if (loading && (!sedes || sedes.length === 0)) {
    return <div className="flex items-center justify-center" style={{ height }}>Cargando mapa...</div>;
  }

  if (markersData.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        No hay ubicaciones para mostrar
      </div>
    );
  }

  return (
    <MapContainer
      key={`${center[0]}-${center[1]}-${markersData.length}`}
      center={center}
      zoom={12}
      className={className}
      style={{ height, width, ...style }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {markersData.map((item, index) => (
        <Marker
          key={item.id || item.sede?.id || index}
          position={[item.sede.lat, item.sede.lng]}
          icon={bodegaIcon}
        >
          <Popup>
            <strong>{item.nombre_personalizado || item.descripcion || item.sede.nombre}</strong>
            <br />
            📍 {item.sede.ciudad}
            <br />
            📌 {item.sede.direccion}
            {item.precio_mensual && (
              <>
                <br />
                💰 ${Number(item.precio_mensual).toLocaleString('es-CO')}/mes
              </>
            )}
            {item.metraje && (
              <>
                <br />
                📦 {item.metraje} m²
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapaBodegas
