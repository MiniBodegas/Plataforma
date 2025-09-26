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

  // USAR LA IMAGEN ESPECÍFICA PARA COMPANY DESCRIPTION
  const mainImage = warehouse?.companyImage || 
                   "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop";

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
          {companyDescription && companyDescription !== 'Sin descripción disponible' 
            ? companyDescription 
            : 'Esta empresa aún no ha proporcionado una descripción detallada de sus servicios.'
          }
        </p>
      </div>

      {/* Imagen + Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Imagen ESPECÍFICA para CompanyDescription */}
        <div>
          <img
            src={mainImage}
            alt={`Imagen corporativa de ${companyName}`}
            className="rounded-2xl shadow-md w-full object-cover h-64 md:h-80"
            loading="lazy"
            onError={(e) => {
              console.error('❌ Error cargando imagen de company:', mainImage)
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
        </div>
      </div>
    </section>
  );
}