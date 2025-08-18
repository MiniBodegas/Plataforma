import { HeroSection, FilterSidebar, WarehouseCard } from '../../components/index';

export function BodegaScreen() {
  const warehouses = [
    {
      id: 1,
      name: "Bodega Norte",
      location: "Bogotá - Suba",
      size: "120 m²",
      price: 2500000,
      rating: 4.5,
      image: "https://via.placeholder.com/400x250",
      description: "Bodega amplia y bien ubicada, perfecta para almacenamiento.",
      features: ["Seguridad 24/7", "Parqueadero"]
    },
    {
      id: 2,
      name: "Bodega Centro",
      location: "Medellín - Laureles",
      size: "90 m²",
      price: 1800000,
      rating: 4.2,
      image: "https://via.placeholder.com/400x250",
      description: "Excelente ubicación en el corazón de la ciudad.",
      features: ["Cerca al metro", "Oficina incluida"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <FilterSidebar />
        </div>

        {/* Grid de bodegas */}
        <div className="md:col-span-3">
          <WarehouseCard warehouses={warehouses} />
        </div>
      </div>
    </div>
  )
}
