import { Star, MapPin, Ruler, Shield } from 'lucide-react'

export function WarehouseCard({ warehouse = {} }) {
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
    reviewCount = 0 // Agregar reviewCount a los datos
  } = warehouse

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-[500px] h-[550px]">

      {/* Imagen */}
      <div className="relative h-56">
        <img
          src={image || "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
          alt={name}
          className="w-full h-full object-cover"
        />  
      </div>
    
      {/* Contenido */} 
      <div className="p-5 flex flex-col flex-grow">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-[#2C3A61]">{name}</h3>
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

        {/* Resto del componente igual... */}
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
          <button
            className="w-full bg-[#4B799B] hover:bg-[#3b5f7a] text-white py-2.5 px-4 rounded-md text-sm transition-colors font-medium"
            onClick={() => console.log(`Ver bodegas en ${name}`)}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarehouseCard