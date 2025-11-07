import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import useSedes from "../hooks/useSedes"
import { useMemo } from "react"

// Icono personalizado para las bodegas
const bodegaIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
})

export function MapaBodegas({ bodegas, empresaId, height = "500px", width = "100%", className = "", style = {} }) {
  // Obtener sedes de la empresa
  const { sedes, loading } = useSedes({ empresaId, includeMinis: false });

  // Mapear bodegas con sus sedes para obtener lat/lng y dirección
  const bodegasConSede = useMemo(() => {
    if (!sedes.length || !bodegas.length) return [];

    return bodegas.map(bodega => {
      const sede = sedes.find(s => s.id === bodega.sede_id);
      return {
        ...bodega,
        sede: sede || null
      };
    }).filter(b => b.sede && b.sede.lat && b.sede.lng);
  }, [bodegas, sedes]);

  // Centra el mapa en la primera bodega con sede, o Bogotá por defecto
  const center = bodegasConSede.length > 0
    ? [bodegasConSede[0].sede.lat, bodegasConSede[0].sede.lng]
    : [4.7110, -74.0721];

  if (loading) {
    return <div className="flex items-center justify-center" style={{ height }}>Cargando mapa...</div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      className={className}
      style={{ height, width, ...style }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {bodegasConSede.map((bodega) => (
        <Marker
          key={bodega.id}
          position={[bodega.sede.lat, bodega.sede.lng]}
          icon={bodegaIcon}
        >
          <Popup>
            <strong>{bodega.nombre_personalizado || bodega.descripcion}</strong>
            <br />
            📍 {bodega.sede.ciudad}
            <br />
            📌 {bodega.sede.direccion}
            <br />
            💰 ${Number(bodega.precio_mensual).toLocaleString('es-CO')}/mes
            <br />
            📦 {bodega.metraje} m²
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapaBodegas
