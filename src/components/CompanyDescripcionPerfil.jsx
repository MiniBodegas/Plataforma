import { Link } from 'react-router-dom';

export function CompanyDescriptionPerfil({ 
  warehouse = {},
  name = "Empresa sin nombre",
  description = "Sin descripción disponible",
  address = "Dirección no disponible", 
  features = [],
  rating = 0,
  reviewCount = 0,
  companyImage = ""
}) {
  // DEBUG: Ver qué datos están llegando
  console.log('🏢 CompanyDescriptionPerfil recibió:', {
    warehouse,
    warehouseName: warehouse?.name,
    warehouseDescription: warehouse?.description,
    warehouseCompanyImage: warehouse?.companyImage
  })

  // Extraer datos del warehouse o usar fallbacks
  const companyName = warehouse?.name || name;
  const companyDescription = warehouse?.description || description;
  const companyFeatures = warehouse?.features || features;
  
  // Obtener ubicación para mostrar
  const location = warehouse?.city && warehouse?.zone 
    ? `${warehouse.zone} - ${warehouse.city}`
    : address;

  // Imagen principal - usar imagen específica de company
  const mainImage = warehouse?.companyImage || companyImage ||
                   "https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg";

  // Características por defecto si no hay ninguna
  const defaultFeatures = [
    "Vigilancia 24/7 con cámaras de seguridad.",
    "Control de clima para proteger artículos sensibles.",
    "Acceso mediante código personalizado.",
    "Seguro incluido contra imprevistos.",
    "Estanterías disponibles.",
    "Iluminación LED eficiente y segura.",
    "Fácil acceso en vehículo o a pie."
  ];

  const displayFeatures = companyFeatures.length > 0 ? companyFeatures : defaultFeatures;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8">
      {/* Encabezado y descripción en dos columnas */}
      <div className="flex flex-col md:flex-row justify-between items-stretch mb-8 gap-8">
        {/* Título centrado vertical y horizontalmente a la izquierda, con fondo blanco y más alto */}
        <div className="md:w-1/2 flex flex-col justify-center items-center h-full">
          <div className="bg-white rounded-2xl shadow p-6 w-full h-[240px] flex flex-col justify-center items-center">
            <Link 
              to={`/perfil-bodegas/${warehouse?.id}`}
              className="text-3xl font-bold text-gray-800 hover:text-[#2C3A61] transition-colors duration-200 cursor-pointer inline-block underline decoration-2 underline-offset-4 hover:decoration-[#2C3A61] text-center w-full"
            >
              {companyName}
            </Link>
            <p className="text-lg text-gray-600 mt-2 text-center w-full">{location}</p>
          
          </div>
        </div>
        
        {/* Descripción a la derecha */}
        <div className="bg-[#4B799B] text-white rounded-2xl p-6 md:w-1/2 flex flex-col justify-center h-full min-h-[220px]">
          <h3 className="font-semibold text-lg mb-2 text-center md:text-left">Descripción</h3>
          <p className="leading-relaxed text-center md:text-left">
            {companyDescription && companyDescription !== 'Sin descripción disponible' 
              ? companyDescription 
              : `En ${companyName} ofrecemos espacios seguros, limpios y fácilmente accesibles,
                 ideales para almacenar objetos personales, muebles, inventario empresarial
                 o cualquier artículo que necesite resguardo temporal o prolongado. Nuestra
                 ubicación es estratégica y cuenta con acceso controlado para brindarte 
                 tranquilidad en todo momento.`
            }
          </p>
          
        </div>
      </div>

      {/* Imagen + Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Imagen */}
        <div>
          <img
            src={mainImage}
            alt={`Imagen de ${companyName}`}
            className="rounded-2xl shadow-md w-full object-cover"
            onError={(e) => {
              console.error('❌ Error cargando imagen de company:', mainImage)
              e.target.src = "https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg";
            }}
          />
          
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl shadow p-6 h-full">
          <h3 className="font-semibold text-lg mb-4">Características</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {displayFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
        </div>
      </div>
    </section>
  );
}