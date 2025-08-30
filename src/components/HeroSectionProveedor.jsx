
import { Link } from "react-router-dom"

export function HeroSectionProveedor() {

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gray-50 rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Columna de textos */}
            <div className="text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-6" style={{ color: "#2C3A61" }}>
                La solución a tu medida,
                <br />
                para lo que necesites
                <br />
                guardar
              </h2>
              <p className="text-gray-600 mb-8" style={{ color: "#2C3A61" }}>
                Busca y alquila tu mini bodega
              </p>

              <div className="flex gap-2 relative">
                <button 
                  className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded-[10px] transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Columna de imagen */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
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