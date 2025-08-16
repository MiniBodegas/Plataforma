import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              La solución a tu medida,
              <br />
              para lo que necesites
              <br />
              guardar
            </h2>
            <p className="text-gray-600 mb-8">Busca y alquila tu mini bodega</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input placeholder="Ingresa tu ciudad" className="pl-10" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Buscar</Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg?height=400&width=400"
              alt="Persona relajándose"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
