import { useState, useEffect } from "react"
import { Search, BarChart3, FileText, CreditCard } from "lucide-react"

export function FeaturesCardsProveedores() {
  const features = [
    {
      order: 0,
      icon: Search,
      title: "Verificación de instalaciones",
      description: "Que genera confianza al usuario.",
    },
    {
      order: 1,
      icon: BarChart3,
      title: "Pagos seguros",
      description: "Comisión única del 15-20% sobre la primera mensualidad; el resto va directo a tu cuenta.",
    },
    {
      order: 3,
      icon: FileText,
      title: "Visibilidad",
      description: "Ante cientos de usuarios que buscan espacios por zona y características.",
    },
    {
      order: 2,
      icon: CreditCard,
      title: "Reserva y Métricas y reportes",
      description: "Descargables para controlar ocupación, ingresos y reservas.",
    },
    {
      order: 2,
      icon: CreditCard,
      title: "Costo variable",
      description: "Solo pagas si concretas una reserva; si no alquilas, no incurres en ningún gasto.",
    },
    {
      order: 2,
      icon: CreditCard,
      title: "Calculadora de espacios ",
      description: "Estimamos rápidamente los metros cúbicos que cada cliente necesita.",
    },
    {
      order: 2,
      icon: CreditCard,
      title: "Marketing incluido",
      description: "Nosotros promocionamos tus bodegas con campañas digitales, SEO y redes sociales.",
    },
  ]

  const [activeOrder, setActiveOrder] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrder((prev) => (prev + 1) % features.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [features.length])

  return (
    <section className="py-16 flex justify-center bg-white">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 rounded-[20px] shadow-lg bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto principal */}
          <div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: "#2C3A61" }}>
              La forma más simple
              <br />
              de liberar espacio
            </h2>
            <p style={{ color: "#2C3A61" }}>Reserva tu mini bodega en 4 pasos</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-6 p-8">
            {features.map((feature) => {
              const isActive = feature.order === activeOrder
              return (
                <div
                  key={feature.order}
                  className={`p-6 rounded-lg transition-all duration-700 shadow-md ${
                    isActive ? "bg-blue-50 scale-105" : "bg-white"
                  }`}
                  style={{ color: "#2C3A61" }}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-700 ${
                      isActive ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <feature.icon
                      className={`h-6 w-6 transition-colors duration-700 ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesCards