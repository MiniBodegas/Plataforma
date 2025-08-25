import { useParams } from "react-router-dom"
import { Carrousel, MapaBodegas, CompanyDescription, SizeCardReserved, TestimonialsSection } from "../../components/index"
import { WAREHOUSES_DATA } from "../../data/warehouse"

export function BodegasDisponibles() {
  const { id } = useParams()
  const bodega = WAREHOUSES_DATA.find(b => b.id === Number(id))

  if (!bodega) {
    return <p className="text-center text-gray-600">Bodega no encontrada</p>
  }

  return (
    <div className="min-h-screen bg-white">
      <Carrousel />
      <CompanyDescription />
      <SizeCardReserved bodega={bodega} />

      <MapaBodegas 
        city={bodega.city} 
        bodegas={[bodega]} 
        className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
        height="600px"
      />

      <TestimonialsSection />
    </div>
  )
}
