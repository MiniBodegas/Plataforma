import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Icono personalizado para las bodegas
const bodegaIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
})

export function MapaBodegas({ city, bodegas, height = "500px", width = "100%", className = "", style = {} }) {
  const bodegasFiltradas = bodegas.filter(b => b.city === city)

  const ciudadesCoords = {
    Cali: [3.4516, -76.5320],
    Bogotá: [4.7110, -74.0721],
    Medellín: [6.2442, -75.5812],
  }

  return (
    <MapContainer
      center={ciudadesCoords[city] || [4.7110, -74.0721]}
      zoom={12}
      className={className}
      style={{ height, width, ...style }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

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
