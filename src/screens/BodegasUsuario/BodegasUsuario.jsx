import { useState } from "react";
import { ReservaCard, NavBarProveedores } from "../../components";

export function BodegasUsuario() {
  const [reservas, setReservas] = useState([
    {
      id: 1,
      titulo: "Mini bodega de 10 m³",
      sede: "Sede Yumbo",
      estado: "activa",
      imagen: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400",
    },
    {
      id: 2,
      titulo: "Bodega de 25 m³",
      sede: "Sede Palmira",
      estado: "procesando",
      imagen: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400",
    },
    {
      id: 3,
      titulo: "Mini bodega de 15 m³",
      sede: "Sede Yumbo",
      estado: "rechazada",
      imagen: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?w=400",
    },
  ]);

  const reservasActivas = reservas.filter((r) => r.estado === "activa");
  const reservasProcesando = reservas.filter((r) => r.estado === "procesando");
  const reservasRechazadas = reservas.filter((r) => r.estado === "rechazada");

  const renderSeccion = (titulo, reservasArray) => (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-center text-[#2C3A61] mb-4">
        {titulo}
      </h3>
      <div className="space-y-4">
        {reservasArray.length > 0 ? (
          reservasArray.map((reserva) => (
            <ReservaCard key={reserva.id} reserva={reserva} />
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

        {/* Nombre usuario */}
        <h2 className="text-2xl md:text-3xl font-bold text-[#2C3A61] text-center my-8">
          Juan Esteban Ramirez Perdomo
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
