import { MapPin } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ✅ fondo gris solo en este bloque */}
        <div className="bg-gray-50 rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Columna de textos */}
            <div className="text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                La solución a tu medida,
                <br />
                para lo que necesites
                <br />
                guardar
              </h2>
              <p className="text-gray-600 mb-8">
                Busca y alquila tu mini bodega
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Ingresa tu ciudad"
                    className="pl-10 py-2 border rounded-[10px] w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded transition-colors">
                  Buscar
                </button>
              </div>
            </div>

            {/* Columna de imagen */}
            <div className="relative">
              <img
                src="https://hips.hearstapps.com/hmg-prod/images/ways-to-relax-1590605206.jpg?crop=0.669xw:1.00xh;0.138xw,0&resize=1200:*"
                alt="Persona relajándose"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
