export function ReservaCard({ reserva, onAceptar, onRechazar }) {
  // Verificar si reserva existe y tiene los datos necesarios
  if (!reserva) {
    return (
      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200 mb-4">
        <p className="text-gray-500 text-center">No hay datos de reserva disponibles</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-gray-50 border-gray-200';
      case 'aceptada':
        return 'bg-gray-50 border-green-200';
      case 'rechazada':
        return 'bg-gray-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return { text: 'Pendiente', color: 'text-yellow-600' };
      case 'aceptada':
        return { text: 'Aceptada', color: 'text-green-600' };
      case 'rechazada':
        return { text: 'Rechazada', color: 'text-red-600' };
      default:
        return { text: 'Sin estado', color: 'text-gray-600' };
    }
  };

  // Valores por defecto en caso de que falten propiedades
  const {
    id = 0,
    titulo = 'Sin título',
    sede = 'Sin sede',
    cliente = 'Sin cliente',
    fechaInicio = 'Sin fecha',
    precio = 0,
    estado = 'pendiente',
    imagen = null
  } = reserva;

  const statusInfo = getStatusText(estado);

  return (
    <div className={`w-full rounded-xl p-6 flex items-center gap-6 shadow-sm border-2 ${getStatusColor(estado)} hover:shadow-md transition-shadow`}>
      {/* Imagen */}
      <div className="w-24 h-24 bg-gray-300 rounded-lg overflow-hidden flex-shrink-0">
        {imagen ? (
          <img 
            src={imagen} 
            alt={titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 text-[#2C3A61]">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold text-lg">{titulo}</h4>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusInfo.color} bg-white border`}>
            {statusInfo.text}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Sede:</span> {sede}</p>
          <p><span className="font-medium">Cliente:</span> {cliente}</p>
          <p><span className="font-medium">Fecha inicio:</span> {fechaInicio}</p>
          <p className="font-semibold text-base"><span className="font-medium">Precio:</span> ${precio?.toLocaleString()}/mes</p>
        </div>
      </div>

      {/* Botones según estado - Solo para pendientes */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        {estado === 'pendiente' && (
          <>
            <button 
              onClick={() => onAceptar && onAceptar(id)}
              className="bg-[#2C3A61] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e2a4a] transition-colors min-w-[120px]"
            >
              Aceptar
            </button>
            <button 
              onClick={() => onRechazar && onRechazar(id)}
              className="bg-white text-[#2C3A61] border-2 border-[#2C3A61] px-6 py-2 rounded-lg font-medium hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-colors min-w-[120px]"
            >
              Rechazar
            </button>
          </>
        )}
        {estado === 'aceptada' && (
          <span className="text-green-600 text-sm font-medium">✓ Confirmada</span>
        )}
        {estado === 'rechazada' && (
          <span className="text-red-600 text-sm font-medium">✗ Rechazada</span>
        )}
      </div>
    </div>
  );
}