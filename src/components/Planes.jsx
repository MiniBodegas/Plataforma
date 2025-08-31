import { Link } from "react-router-dom";

export function Planes() {
  const sizeGuides = [
    {
      title: "Gratuito",
      description: "Pensado para que cualquier operador de mini bodegas pueda empezar sin barreras ni costos fijos. Incluye:",
      features: [
        "Publicación ilimitada de bodegas",
        "Visibilidad en la plataforma para todos los usuarios",
        "Gestión comercial automatizada: la plataforma se encarga de atraer clientes",
        "Reservas confirmadas con pago inicial",
        "Sin necesidad de desarrollar tecnología propia"
      ],
      comision: "Comisión por resultado: Solo se cobra una comisión equivalente al primer mes de arriendo cuando el cliente concreta y paga la reserva a través de la plataforma.",
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ color: "#2C3A61" }}>
          Planes
        </h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-8 max-w-md">
            {sizeGuides.map((guide, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="h-48 w-full object-cover rounded-lg mb-6"
                />
                
                {/* Título del plan */}
                <h3 className="font-bold text-2xl mb-4 text-center" style={{ color: "#2C3A61" }}>
                  {guide.title}
                </h3>
                
                {/* Descripción principal */}
                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  {guide.description}
                </p>
                
                {/* Lista de características */}
                <div className="mb-6">
                  <ul className="space-y-3">
                    {guide.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3" style={{ backgroundColor: "#2C3A61" }}></div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Información de comisión */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: "#2C3A61" }}>
                  <p className="text-sm font-medium" style={{ color: "#2C3A61" }}>
                    {guide.comision}
                  </p>
                </div>
                
                {/* Botón de acción */}
                <Link to="/planes">
                  <button
                    className="w-full mt-6 py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 hover:transform hover:scale-105"
                    style={{ backgroundColor: "#2C3A61" }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#1e2a4a";
                    }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#2C3A61";
                  }}
                >
                  Obtener
                </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}