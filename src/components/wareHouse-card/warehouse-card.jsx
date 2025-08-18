import { Star, MapPin, Ruler, Shield } from 'lucide-react'

export function WarehouseCard({ warehouse = {} }) {
  const {
    id,
    name = "Bodega sin nombre",
    location = "Ubicación no disponible",
    size = "N/A",
    price = 0,
    image,
    features = [],
    rating = 0,
    description
  } = warehouse

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen */}
      <div className="relative h-48">
        <img
          src={image || "https://via.placeholder.com/300x200"}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow">
          <span className="text-sm font-semibold text-[#2C3A61]">
            ${price}/mes
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-[#2C3A61]">{name}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-[#2C3A61]">{rating}</span>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-[#2C3A61]">{location}</span>
        </div>

        {/* Tamaño */}
        <div className="flex items-center gap-1 mb-3">
          <Ruler className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-[#2C3A61]">{size}</span>
        </div>

        {/* Descripción */}
        {description && (
          <p className="text-sm mb-3 text-[#2C3A61]">{description}</p>
        )}

        {/* Características */}
        {features.length > 0 && (
          <div className="mb-4">
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

        {/* Botones */}
        <div className="flex gap-2">
          <button
            className="flex-1 bg-[#4B799B] hover:bg-[#3b5f7a] text-white py-2 px-4 rounded-md text-sm transition-colors"
            onClick={() => console.log(`Ver detalles de ${name}`)}
          >
            Ver detalles
          </button>
          <button
            className="flex-1 border border-[#4B799B] text-[#4B799B] hover:bg-[#4B799B] hover:text-white py-2 px-4 rounded-md text-sm transition-colors"
            onClick={() => console.log(`Reservar ${name}`)}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarehouseCard
