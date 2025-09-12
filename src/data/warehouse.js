export const WAREHOUSES_DATA = Object.freeze([
  Object.freeze({
    id: 1,
    name: "BogotáBox",
    location: "Norte",
    city: "Bogotá",
    sizes: ["50 m³", "80 m³", "120 m³", "200 m³"],
    price: 1200000,
    priceRange: Object.freeze({ min: 1200000, max: 2500000 }),
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Múltiples bodegas disponibles en la zona norte de Bogotá.",
    features: Object.freeze(["Directo en vehiculo", "Acceso en primer piso", "Sin escaleras"]),
    warehouseCount: 15,
    coords: [4.71, -74.07]
  }),
  Object.freeze({
    id: 2,
    name: "MedellínBox",
    location: "Sur",
    city: "Medellín",
    sizes: ["45 m³", "70 m³", "90 m³", "150 m³"],
    price: 900000,
    priceRange: Object.freeze({ min: 900000, max: 1800000 }),
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Bodegas en el corazón de Medellín.",
    features: Object.freeze(["Acceso con montacarga", "Ascensor"]),
    warehouseCount: 12,
    coords: [6.24, -75.58]
  }),

  Object.freeze({
    id: 3,
    name: "Rentabox",
    location: "Norte",
    city: "Cali",
    sizes: ["10 m³", "20 m³", "40 m³", "80 m³"],
    price: 900000,
    priceRange: Object.freeze({ min: 900000, max: 1800000 }),
    rating: 4.2,
    image: "https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg",
    description: "Bodegas en el corazón de Medellín.",
    features: Object.freeze(["Acceso con montacarga", "Ascensor"]),
    warehouseCount: 12,
    coords: [6.24, -75.58]
  }),
  Object.freeze({
    id: 4,
    name: "CartagenabOX",
    location: "Sur",
    city: "Cartagena",
    sizes: ["45 m³", "70 m³", "90 m³", "150 m³"],
    price: 900000,
    priceRange: Object.freeze({ min: 900000, max: 1800000 }),
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Bodegas en el corazón de Medellín.",
    features: Object.freeze(["Acceso con montacarga", "Ascensor"]),
    warehouseCount: 12,
    coords: [6.24, -75.58]
  }),
 
])
