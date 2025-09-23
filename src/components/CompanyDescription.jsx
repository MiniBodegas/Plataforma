import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

export function CompanyDescription({ 
  warehouse = {},
  name = "Empresa sin nombre",
  description = "Sin descripción disponible",
  address = "Dirección no disponible", 
  features = [],
  rating = 0,
  reviewCount = 0
}) {
  // Extraer datos del warehouse o usar props directas
  const companyName = warehouse?.name || name;
  const companyDescription = warehouse?.description || description;
  const companyAddress = warehouse?.address || address;
  const companyFeatures = warehouse?.features || features;
  const companyRating = warehouse?.rating || rating;
  const companyReviewCount = warehouse?.reviewCount || reviewCount;
  
  // Obtener ubicación para mostrar
  const location = warehouse?.city && warehouse?.zone 
    ? `${warehouse.zone} - ${warehouse.city}`
    : companyAddress;

  // Imagen principal - usar la primera del carrusel o una por defecto
  const mainImage = warehouse?.images?.[0] 
    || warehouse?.miniBodegas?.[0]?.image
    || "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop";

  // Características por defecto si no hay ninguna
  const defaultFeatures = [
    "Vigilancia 24/7 con cámaras de seguridad",
    "Acceso mediante código personalizado", 
    "Iluminación LED eficiente y segura",
    "Fácil acceso en vehículo o a pie"
  ];

  const displayFeatures = companyFeatures.length > 0 ? companyFeatures : defaultFeatures;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <Link 
          to={`/perfil-bodegas/${warehouse?.id}`}
          className="text-3xl font-bold text-gray-800 hover:text-[#2C3A61] transition-colors duration-200 cursor-pointer inline-block underline decoration-2 underline-offset-4 hover:decoration-[#2C3A61]"
        >
          {companyName}
        </Link>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <p className="text-lg text-gray-600">{location}</p>
        </div>

        {/* Rating */}
        {companyRating > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${
                    i < Math.floor(companyRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {companyRating.toFixed(1)} ({companyReviewCount} reseñas)
            </span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className="bg-[#4B799B] text-white rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2">Descripción</h3>
        <p className="leading-relaxed">
          {companyDescription}
        </p>
      </div>

      {/* Imagen + Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Imagen */}
        <div>
          <img
            src={mainImage}
            alt={`Imagen de ${companyName}`}
            className="rounded-2xl shadow-md w-full object-cover h-64 md:h-80"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop";
            }}
          />
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl shadow p-6 h-full">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Características</h3>
          
          {displayFeatures.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {displayFeatures.map((feature, index) => (
                <li key={index} className="leading-relaxed">
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No hay características específicas disponibles para esta empresa.
            </p>
          )}

          {/* Información adicional */}
          {warehouse?.availableSizes && warehouse.availableSizes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Tamaños disponibles:</h4>
              <div className="flex flex-wrap gap-2">
                {warehouse.availableSizes.slice(0, 4).map((size, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-[#4B799B] text-white text-sm rounded-full"
                  >
                    {size.size}
                  </span>
                ))}
                {warehouse.availableSizes.length > 4 && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                    +{warehouse.availableSizes.length - 4} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información de contacto si existe */}
      {warehouse?.empresa && (
        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Información de la empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Empresa:</span> {warehouse.empresa.nombre}
            </div>
            {warehouse.empresa.created_at && (
              <div>
                <span className="font-medium">Miembro desde:</span>{' '}
                {new Date(warehouse.empresa.created_at).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long'
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}