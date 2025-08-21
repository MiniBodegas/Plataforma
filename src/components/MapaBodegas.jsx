import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Icono personalizado para las bodegas
const bodegaIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
})

export function MapaBodegas({ city, bodegas }) {
  // Filtramos las bodegas según la ciudad recibida como prop
  const bodegasFiltradas = bodegas.filter(b => b.city === city)

  // Coordenadas de las ciudades (para centrar el mapa)
  const ciudadesCoords = {
    Cali: [3.4516, -76.5320],
    Bogotá: [4.7110, -74.0721],
    Medellín: [6.2442, -75.5812],
  }

  return (
    <MapContainer
      center={ciudadesCoords[city] || [4.7110, -74.0721]} // Si no existe ciudad, Bogotá por defecto
      zoom={12}
      style={{ height: "500px", width: "100%" }}
    >
      {/* Capa base */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Marcadores de bodegas */}
      {bodegasFiltradas.map((bodega) => (
        <Marker key={bodega.id} position={bodega.coords} icon={bodegaIcon}>
          <Popup>
            <strong>{bodega.name}</strong>
            <br />
            📍 {bodega.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapaBodegas