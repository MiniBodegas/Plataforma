import { useNavigate } from 'react-router-dom';
import useSedes from '../hooks/useSedes';

export function PerfilCard({ warehouse, availableSizes, miniBodegas }) {
  const navigate = useNavigate();

  // Traer sedes reales de la empresa usando useSedes
  const empresaIdToFetch = warehouse?.id || warehouse?.empresa_id || null;
  const { sedes: sedesHook = [] } = useSedes({ empresaId: empresaIdToFetch, includeMinis: false });

  // Agrupar mini bodegas por sede/ubicación
  const agruparPorSede = (bodegas) => {
    if (!bodegas || bodegas.length === 0) return [];

    const sedesMap = new Map();

    bodegas.forEach(bodega => {
      // Buscar nombre real de la sede si existe en sedesHook
      const sedeObj = sedesHook.find(s => 
        s.ciudad === bodega.ciudad && s.zona === bodega.zona
      );
      const sedeNombre = sedeObj?.nombre || `${bodega.zona} - ${bodega.ciudad}`;
      const sedeKey = `${bodega.ciudad}-${bodega.zona}`;

      if (!sedesMap.has(sedeKey)) {
        sedesMap.set(sedeKey, {
          key: sedeKey,
          title: sedeNombre,
          ciudad: bodega.ciudad,
          zona: bodega.zona,
          bodegas: [],
          totalBodegas: 0,
          rangoMetraje: { min: Infinity, max: 0 },
          image: bodega.imagen_url || "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop"
        });
      }

      const sede = sedesMap.get(sedeKey);
      sede.bodegas.push(bodega);
      sede.totalBodegas++;

      // Calcular rango de metraje
      const metraje = parseFloat(bodega.metraje) || 0;
      if (metraje > 0) {
        sede.rangoMetraje.min = Math.min(sede.rangoMetraje.min, metraje);
        sede.rangoMetraje.max = Math.max(sede.rangoMetraje.max, metraje);
      }
    });

    // Convertir Map a Array y generar descripciones
    return Array.from(sedesMap.values()).map(sede => ({
      ...sede,
      description: `${warehouse?.name || 'Esta empresa'} cuenta con ${sede.totalBodegas} mini bodega${sede.totalBodegas > 1 ? 's' : ''} en esta sede. Tiene disponible desde ${sede.rangoMetraje.min}m³ hasta ${sede.rangoMetraje.max}m³. Presenta las mejores características de la zona.`,
      rangoMetrajeTexto: sede.rangoMetraje.min !== Infinity ? `${sede.rangoMetraje.min}m³ - ${sede.rangoMetraje.max}m³` : 'Metraje por consultar'
    }));
  };

  // Generar sedes desde datos reales o usar datos por defecto
  const sedes = miniBodegas && miniBodegas.length > 0 
    ? agruparPorSede(miniBodegas)
    : (
      sedesHook.length > 0
        ? sedesHook.map(sede => ({
            key: sede.id,
            title: sede.nombre,
            ciudad: sede.ciudad,
            zona: sede.zona,
            bodegas: [],
            totalBodegas: 0,
            image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop",
            description: `${warehouse?.name || 'Esta empresa'} cuenta con múltiples mini bodegas en ${sede.nombre}.`,
            rangoMetrajeTexto: 'Metraje por consultar'
          }))
        : [
            {
              key: "default-1",
              title: `${warehouse?.zone || 'Sede Principal'} - ${warehouse?.city || 'Ciudad'}`,
              ciudad: warehouse?.city || 'Ciudad',
              zona: warehouse?.zone || 'Zona',
              bodegas: [],
              totalBodegas: 0,
              image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop",
              description: `${warehouse?.name || 'Esta empresa'} cuenta con múltiples mini bodegas en esta ubicación. Disponible en varios tamaños para satisfacer tus necesidades de almacenamiento.`,
              rangoMetrajeTexto: 'Metraje por consultar'
            }
          ]
    );

  const handleExplorar = (sede) => {
    navigate(`/bodegas/${warehouse?.id}?ciudad=${encodeURIComponent(sede.ciudad || '')}`);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4" style={{ color: "#2C3A61" }}>
          Nuestras Sedes
        </h2>
        
        <p className="text-center text-gray-600 mb-12">
          {warehouse?.name || 'Esta empresa'} tiene presencia en las siguientes ubicaciones
        </p>
        
        {/* Grid responsivo para las sedes */}
        <div className="flex justify-center">
          <div className={`grid gap-8 max-w-6xl ${
            sedes.length === 1 ? 'grid-cols-1 max-w-md' :
            sedes.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {sedes.map((sede, index) => (
              <div
                key={sede.key || index}
                className="bg-white p-6 rounded-lg shadow-md min-h-[400px] flex flex-col max-w-xs mx-auto hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={sede.image}
                  alt={`Sede ${sede.title}`}
                  className="h-48 w-full object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop";
                  }}
                />
                
                {/* Título con nombre real de la sede */}
                <h3 className="font-semibold text-gray-900 mb-3 text-center text-xl" style={{ color: "#2C3A61" }}>
                  {sede.title}
                </h3>
                
                <p className="text-gray-600 text-sm flex-1 mb-4" style={{ color: "#2C3A61" }}>
                  {sede.description}
                </p>

                {/* Información adicional de la sede */}
                {sede.totalBodegas > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Bodegas disponibles:</span> {sede.totalBodegas}</p>
                      {sede.rangoMetrajeTexto && (
                        <p><span className="font-medium">Tamaños:</span> {sede.rangoMetrajeTexto}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => handleExplorar(sede)}
                  className="w-full text-white py-3 px-4 rounded-md font-medium transition-all duration-200 mt-auto"
                  style={{
                    backgroundColor: "#2C3A61"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#1e2a4a";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#2C3A61";
                  }}
                >
                  Explorar {sede.totalBodegas > 0 ? `${sede.totalBodegas} bodegas` : 'sede'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje si no hay sedes */}
        {sedes.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>No hay sedes disponibles en este momento.</p>
          </div>
        )}

      </div>
    </section>
  )
}
