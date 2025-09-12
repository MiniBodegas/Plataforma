import { useState, useEffect } from "react"
import { Search, BarChart3, FileText, CreditCard } from "lucide-react"

export function FeaturesCards() {
  const features = [
    {
      order: 0,
      icon: Search,
      title: "Busca",
      description: "Encuentra bodegas y espacios disponibles en tu ciudad",
    },
    {
      order: 1,
      icon: BarChart3,
      title: "Compara",
      description: "Compara precios, ubicaciones y servicios disponibles en tiempo real",
    },
    {
      order: 3,
      icon: CreditCard,
      title: "Reserva y paga",
      description: "Reserva tu bodega y paga de forma segura en línea",
    },
    {
      order: 2,
      icon: FileText,
      title: "Contrata",
      description: "Agenda tu visita y contrata el servicio que más te convenga",
    },
    
  ]

  const [activeOrder, setActiveOrder] = useState(0)
  const [supportsTransitions, setSupportsTransitions] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrder((prev) => (prev + 1) % features.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [features.length])

  useEffect(() => {
    // Detectar soporte para transiciones
    const testEl = document.createElement('div')
    const supportsCSS = testEl.style.transition !== undefined
    setSupportsTransitions(supportsCSS)
  }, [])

  return (
    <section className="py-8 sm:py-12 lg:py-16 flex justify-center bg-white px-4">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 rounded-[12px] sm:rounded-[16px] lg:rounded-[20px] shadow-lg bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center p-6 sm:p-8 lg:p-12">
          {/* Texto principal */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight" style={{ color: "#2C3A61" }}>
              La forma más simple
              <br />
              de liberar espacio
            </h2>
            <p className="text-sm sm:text-base lg:text-lg" style={{ color: "#2C3A61" }}>
              Reserva tu mini bodega en 4 pasos
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature) => {
              const isActive = feature.order === activeOrder
              return (
                <div
                  key={feature.order}
                  className={`p-4 sm:p-5 lg:p-6 rounded-lg shadow-md ${
                    supportsTransitions ? 'transition-all duration-700' : ''
                  } ${isActive ? "bg-blue-50 scale-105" : "bg-white"}`}
                  style={{ color: "#2C3A61" }}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-700 ${
                      isActive ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <feature.icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-700 ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base lg:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base leading-relaxed">
                    {feature.description}
                  </p>
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