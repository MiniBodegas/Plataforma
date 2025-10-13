import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { CompanyRating } from './CompanyRating';
import { useCompanyReviews } from '../hooks/useCompanyReview';
import { useAuth } from '../contexts/AuthContext';

export function CompanyDescriptionContainer({ warehouseId, user }) {
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWarehouse() {
      setLoading(true);
      const data = await ProfileService.getEmpresaById(warehouseId);
      setWarehouse(data);
      setLoading(false);
    }
    fetchWarehouse();
  }, [warehouseId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <CompanyDescription
      warehouse={warehouse}
      // onRate={...} // Si quieres manejar el rating interactivo
    />
  );
}

export function CompanyDescription({ 
  warehouse = {},
  onRate, // 👈 Puedes pasar un handler si quieres guardar el rating
  user // 👈 Pasa el usuario autenticado si lo tienes
}) {
  const empresaId = warehouse?.id;
  const { user: authUser } = useAuth();
  const { average, count, addReview, yaCalifico } = useCompanyReviews(empresaId);

  // Obtener ubicación para mostrar
  const location = warehouse?.city && warehouse?.zone 
    ? `${warehouse.city} - ${warehouse.zone} `
    : warehouse?.address || "Dirección no disponible";

  const mainImage = warehouse?.companyImage || 
    "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop";

  const displayFeatures = warehouse?.features?.length > 0
    ? warehouse.features
    : [
        "Vigilancia 24/7 con cámaras de seguridad",
        "Acceso mediante código personalizado", 
        "Iluminación LED eficiente y segura",
        "Fácil acceso en vehículo o a pie"
      ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <Link 
          to={`/perfil-bodegas/${warehouse?.id}`}
          className="text-3xl font-bold text-gray-800 hover:text-[#2C3A61] transition-colors duration-200 cursor-pointer inline-block underline decoration-2 underline-offset-4 hover:decoration-[#2C3A61]"
        >
          {warehouse?.name || "Empresa sin nombre"}
        </Link>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <p className="text-lg text-gray-600">{location}</p>
        </div>

        {/* ⭐️ SISTEMA DE ESTRELLAS DE CALIFICACIÓN */}
        <CompanyRating
          value={average}
          reviewCount={count}
          user={authUser}
          onRate={async (val, comentario) => {
            const { error } = await addReview(val, comentario);
            if (error) {
              alert(error);
            } else {
              alert('¡Gracias por tu calificación!');
            }
          }}
        />
        {user && yaCalifico && 
          <div className="text-xs text-green-600 mt-2">
            Ya calificaste esta empresa.
          </div>
        }
      </div>

      {/* Descripción */}
      <div className="bg-[#4B799B] text-white rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2">Descripción</h3>
        <p className="leading-relaxed">
          {warehouse?.description && warehouse?.description !== 'Sin descripción disponible' 
            ? warehouse.description 
            : 'Esta empresa aún no ha proporcionado una descripción detallada de sus servicios.'}
        </p>
      </div>

      {/* Imagen + Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Imagen */}
        <div>
          <img
            src={mainImage}
            alt={`Imagen corporativa de ${warehouse?.name || "Empresa sin nombre"}`}
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
        </div>
      </div>
    </section>
  );
}