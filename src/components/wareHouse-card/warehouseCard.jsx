import { Link, useNavigate } from "react-router-dom"
import { Star, MapPin, Ruler, Shield } from "lucide-react"

export function WarehouseCard({ warehouse = {}, filtroActivo = null }) {
  const navigate = useNavigate()

  const {
    id,
    name = "Empresa sin nombre",
    location = "Ubicación no disponible",
    sizes = [],
    priceRange = { min: 0, max: 0 },
    image,
    features = [],
    rating = 0,
    description,
    reviewCount = 0
  } = warehouse

  const canNavigate = typeof id === "number" || typeof id === "string"

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // ✅ FUNCIÓN PARA GENERAR URL CON FILTROS
  const generateUrlWithFilters = (basePath) => {
    let url = basePath
    
    if (filtroActivo && (filtroActivo.ciudad || filtroActivo.zona || filtroActivo.empresa)) {
      const params = new URLSearchParams()
      
      if (filtroActivo.ciudad) {
        params.append('ciudad', filtroActivo.ciudad)     
      }
      if (filtroActivo.zona) {
        params.append('zona', filtroActivo.zona)     
      }
      if (filtroActivo.empresa) {
        params.append('empresa', filtroActivo.empresa)     
      }    
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }
    return url
  }

  // ✅ BOTÓN RESERVAR - VA A /bodegas/${id} (para reservar)
  const handleReserve = (e) => {
    e.stopPropagation()
    if (!canNavigate) return
    
    const urlWithFilters = generateUrlWithFilters(`/bodegas/${id}`)
    navigate(urlWithFilters, { state: { warehouse } })
  }

  // ✅ CLICK EN CARD - VA A /perfil-bodegas/${id} (para ver perfil)
  const handleCardClick = () => {
    if (!canNavigate) return
    
    const urlWithFilters = generateUrlWithFilters(`/bodegas/${id}`)
    navigate(urlWithFilters, { state: { warehouse } })
  }

  const handleLinkClick = (e) => {
    e.stopPropagation()
  }

  // ✅ GENERAR URL PARA EL LINK DEL PERFIL
  const perfilUrl = generateUrlWithFilters(`/perfil-bodegas/${id}`)

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full max-w-[500px] h-[550px] flex flex-col cursor-pointer"
      onClick={handleCardClick} // ✅ CLICK EN CARD = PERFIL
    >
      {/* Imagen */}
      <div className="relative h-40 sm:h-56">
        <img
          src={image || "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {priceRange.min > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <div className="text-xs font-semibold text-[#2C3A61]">
              {priceRange.min === priceRange.max 
                ? formatPrice(priceRange.min)
                : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`
              }
            </div>
            <div className="text-xs text-gray-600">COP /mes</div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            {/* ✅ LINK DEL NOMBRE - VA AL PERFIL */}
            <Link
              to={perfilUrl}
              className="font-semibold text-base sm:text-lg text-[#2C3A61] line-clamp-1 underline decoration-2 underline-offset-4 hover:text-[#4B799B] transition-colors"
              title="Ir al perfil de la compañía"
              onClick={handleLinkClick}
            >
              {name}
            </Link>
          </div>

          {rating > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-xs sm:text-sm text-[#2C3A61] font-medium">{Number(rating).toFixed(1)}</span>
                <span className="text-xs text-gray-500">({reviewCount || 25} reseñas)</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mb-2 sm:mb-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-xs sm:text-sm text-[#2C3A61]">{location}</span>
        </div>

        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1 mb-1 sm:mb-2">
            <Ruler className="h-4 w-4 text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-[#2C3A61]">Tamaños disponibles:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sizes.length > 0 ? sizes.map((size, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-[#2C3A61]"
              >
                {size}
              </span>
            )) : (
              <span className="text-xs text-gray-500">Consultar tamaños disponibles</span>
            )}
          </div>
        </div>

        {description && (
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-[#2C3A61] line-clamp-3">{description}</p>
        )}

        {features.length > 0 && (
          <div className="mb-2">
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
          <button
            type="button"
            aria-label={`Reservar ${name}`}
            disabled={!canNavigate}
            onClick={handleReserve}
            className={`w-full py-2 sm:py-2.5 px-4 rounded-md text-xs sm:text-sm font-medium transition-colors
              ${canNavigate ? "bg-[#4B799B] hover:bg-[#3b5f7a] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
          >
            Reservar ahora
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarehouseCard
