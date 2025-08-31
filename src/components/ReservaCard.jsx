export function ReservaCard() {
  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <h2 className="text-2xl font-bold text-center text-[#2C3A61] mb-6">
        Pendientes
      </h2>

      <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-4 shadow-sm">
        {/* Imagen placeholder */}
        <div className="w-20 h-20 bg-gray-300 rounded-md" />

        {/* Información */}
        <div className="flex-1 text-[#2C3A61]">
          <p className="font-medium">Mini bodega de 10 m3</p>
          <p className="text-sm">Sede Yumbo</p>
          <p className="text-sm mt-2">Fecha de inicio el 10 de octubre</p>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button className="bg-[#426A8C] text-white px-4 py-2 rounded-lg font-medium">
            Aceptar Reserva
          </button>
          <button className="bg-[#B3DAF2] text-[#2C3A61] px-4 py-2 rounded-lg font-medium">
            Rechazar reserva
          </button>
        </div>
      </div>
    </div>
  );
}
