import { HeroSection, FilterSidebar, WarehouseGrid } from '../../components/index';

export function BodegaScreen() {
  const warehouses = [
    {
      id: 1,
      name: "Bogotá Norte",
      location: "Bogotá - Zona Norte",
      sizes: ["50 m²", "80 m²", "120 m²", "200 m²"],
      priceRange: { min: 1200000, max: 2500000 },
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Múltiples bodegas disponibles en la zona norte de Bogotá. Excelente conectividad y acceso a principales vías.",
      features: ["Seguridad 24/7", "Parqueadero", "CCTV"],
      warehouseCount: 15
    },
    {
      id: 2,
      name: "Medellín Centro",
      location: "Medellín - Laureles",
      sizes: ["45 m²", "70 m²", "90 m²", "150 m²"],
      priceRange: { min: 900000, max: 1800000 },
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Bodegas en el corazón de Medellín con diferentes tamaños para todas las necesidades comerciales.",
      features: ["Cerca al metro", "Oficina incluida", "Wifi"],
      warehouseCount: 12
    },
    {
      id: 3,
      name: "Cali Industrial",
      location: "Cali - Yumbo",
      sizes: ["100 m²", "150 m²", "200 m²", "300 m²"],
      priceRange: { min: 1500000, max: 3200000 },
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1566844157-8267b80d7e5a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Zona industrial con bodegas de gran capacidad. Ideal para operaciones logísticas y manufactureras.",
      features: ["Montacargas", "Rampa de carga", "Área de oficinas"],
      warehouseCount: 8
    },
    {
      id: 4,
      name: "Bogotá Chapinero",
      location: "Bogotá - Chapinero",
      sizes: ["30 m²", "45 m²", "60 m²", "80 m²"],
      priceRange: { min: 800000, max: 1500000 },
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Mini bodegas perfectas para emprendedores y pequeñas empresas en zona comercial premium.",
      features: ["Acceso 24/7", "Clima controlado"],
      warehouseCount: 20
    },
    {
      id: 5,
      name: "Barranquilla Puerto",
      location: "Barranquilla - Soledad",
      sizes: ["80 m²", "120 m²", "150 m²", "250 m²"],
      priceRange: { min: 1100000, max: 2800000 },
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Bodegas estratégicamente ubicadas cerca del puerto y aeropuerto para operaciones de importación/exportación.",
      features: ["Zona franca", "Muelle de carga", "Seguridad", "Oficinas"],
      warehouseCount: 10
    },
    {
      id: 6,
      name: "Bogotá Zona Rosa",
      location: "Bogotá - Zona Rosa",
      sizes: ["40 m²", "60 m²", "80 m²", "100 m²"],
      priceRange: { min: 1400000, max: 2200000 },
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Bodegas tecnológicas en zona premium, equipadas con sistemas modernos para productos sensibles.",
      features: ["Temperatura controlada", "Sistema de monitoreo", "Acceso biométrico"],
      warehouseCount: 7
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <FilterSidebar />
        </div>

        {/* Grid de bodegas */}
        <div className="md:col-span-4">
          <WarehouseGrid warehouses={warehouses} />
        </div>
      </div>
    </div>
  )
}
