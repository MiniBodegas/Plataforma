import { Carrousel, MapaBodegas, CompanyDescription, SizeCardReserved, TestimonialsSection } from "../../components/index"

export function BodegasDisponibles() {
  // 📌 Aquí define las bodegas
  const bodegas = [
    { id: 1, name: "Bodega Norte", city: "Cali", coords: [3.45, -76.53] },
    { id: 2, name: "Bodega Centro", city: "Bogotá", coords: [4.71, -74.07] },
    { id: 3, name: "Bodega Sur", city: "Medellín", coords: [6.24, -75.58] },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Carrousel />
      <CompanyDescription />
      <SizeCardReserved />
      {/* Ahora sí existe la variable bodegas */}
      <MapaBodegas 
        city="Cali" 
        bodegas={bodegas} 
        className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="600px"
      />

      <TestimonialsSection />
    </div>
  )
}
