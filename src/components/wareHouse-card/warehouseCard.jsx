import { Link, useNavigate } from "react-router-dom"
import { Star, MapPin, Ruler, Shield } from "lucide-react"

export function WarehouseCard({ warehouse = {} }) {
  const navigate = useNavigate()

  const {
    id,
    name = "Ciudad sin nombre",
    location = "Ubicación no disponible",
    sizes = [],
    priceRange = { min: 0, max: 0 },
    image,
    features = [],
    rating = 0,
    description,
    warehouseCount = 0,
    reviewCount = 0
  } = warehouse

  const canNavigate = typeof id === "number" || typeof id === "string"

  const handleReserve = () => {
    if (!canNavigate) return
    // puedes pasar la data de la bodega al detalle para no re-consultar
    navigate(`/bodegas/${id}`, { state: { warehouse } })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full max-w-[500px] h-[550px]">

      {/* Imagen */}
      <div className="relative h-56">
        <img
          src={image || "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-[#2C3A61] line-clamp-1">{name}</h3>
          </div>

          {rating > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-[#2C3A61] font-medium">{Number(rating).toFixed(1)}</span>
                <span className="text-xs text-gray-500">({reviewCount || 25} reseñas)</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Calificación promedio</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mb-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-[#2C3A61]">{location}</span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <Ruler className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-[#2C3A61]">Tamaños disponibles:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sizes.map((size, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-[#2C3A61]"
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        {description && (
          <p className="text-sm mb-4 text-[#2C3A61] line-clamp-3">{description}</p>
        )}

        {features.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-[#2C3A61]"
                >
                  <Shield className="h-3 w-3" />
                  {feature}
                </span>
              ))}
              {features.length > 2 && (
                <span className="text-xs px-2 py-1 text-[#2C3A61]">
                  +{features.length - 2} más
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto">
          {/* Opción 1: botón con navigate + state */}
          <button
            type="button"
            aria-label={`Reservar ${name}`}
            disabled={!canNavigate}
            onClick={handleReserve}
            className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors
              ${canNavigate ? "bg-[#4B799B] hover:bg-[#3b5f7a] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
          >
            Reservar
          </button>

          {/* Opción 2: Link puro (si prefieres ancla navegable) 
          <Link
            to={canNavigate ? `/bodegas/${id}` : "#"}
            state={canNavigate ? { warehouse } : undefined}
            className={`w-full mt-2 block text-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors
              ${canNavigate ? "bg-[#4B799B] hover:bg-[#3b5f7a] text-white" : "bg-gray-200 text-gray-400 pointer-events-none"}
            `}
            aria-disabled={!canNavigate}
          >
            Reservar
          </Link>
          */}
        </div>
      </div>
    </div>
  )
}

export default WarehouseCard
