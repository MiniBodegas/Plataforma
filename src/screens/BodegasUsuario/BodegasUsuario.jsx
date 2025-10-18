import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ReservaCardUsuario } from "../../components";
import { useReservasUsuario } from "../../hooks/useReservasUsuario";

export function BodegasUsuario() {
  const navigate = useNavigate();
  const { reservas, miniBodegas, loading } = useReservasUsuario();

  const reservasActivas = reservas.filter((r) => r.estado === "aceptada");
  const reservasProcesando = reservas.filter((r) => r.estado === "pendiente");
  const reservasRechazadas = reservas.filter((r) => r.estado === "rechazada");

  const handleBack = () => {
    navigate(-1);
  };

  const renderSeccion = (titulo, reservasArray) => (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-center text-[#2C3A61] mb-4">
        {titulo}
      </h3>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Cargando...</div>
        ) : reservasArray.length > 0 ? (
          reservasArray.map((reserva) => (
            <ReservaCardUsuario
              key={reserva.id}
              reserva={{
                ...reserva,
                miniBodegaNombre: miniBodegas[reserva.mini_bodega_id]?.nombre || "Mini bodega",
                miniBodegaMetraje: miniBodegas[reserva.mini_bodega_id]?.metraje || "",
                miniBodegaCiudad: miniBodegas[reserva.mini_bodega_id]?.ciudad || "",
                miniBodegaZona: miniBodegas[reserva.mini_bodega_id]?.zona || "",
                miniBodegaDireccion: miniBodegas[reserva.mini_bodega_id]?.direccion || "",
              }}
            />
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
            <p className="text-gray-500">No hay reservas {titulo.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Flecha de regreso */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Nombre usuario */}
        <h2 className="text-2xl md:text-3xl font-bold text-[#2C3A61] text-center my-8">
          {/* Puedes traer el nombre real del usuario si lo tienes */}
          Mi perfil
        </h2>

        {/* Título principal */}
        <h2 className="text-2xl font-bold text-center text-[#2C3A61] mb-8">
          Mis reservas
        </h2>

        {/* Secciones */}
        {renderSeccion("Activas", reservasActivas)}
        {renderSeccion("Procesando", reservasProcesando)}
        {renderSeccion("Rechazada", reservasRechazadas)}
      </div>
    </div>
  );
}
