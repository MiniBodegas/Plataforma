import { useState } from 'react';

export function ReservaCard({ reserva, onAceptar, onRechazar, disabled }) {
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aceptada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  const handleRechazar = () => {
    onRechazar(reserva.id, motivoRechazo);
    setMostrarModalRechazo(false);
    setMotivoRechazo('');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          
          {/* Información principal */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="font-semibold text-lg text-[#2C3A61]">
                {reserva.infoBodega.titulo}
              </h4>
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getEstadoColor(reserva.estado)}`}>
                {getEstadoTexto(reserva.estado)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <span className="font-medium">📍 Ubicación:</span>
                <p className="text-gray-600">{reserva.infoBodega.ubicacion}</p>
              </div>
              <div>
                <span className="font-medium">📅 Fecha inicio:</span>
                <p className="text-gray-600">{reserva.fechaInicioFormateada}</p>
              </div>
              <div>
                <span className="font-medium">👤 Cliente:</span>
                <p className="text-gray-600">{reserva.usuarioEmail}</p>
              </div>
              <div>
                <span className="font-medium">📞 Celular:</span>
                <p className="text-gray-600">{reserva.numero_celular}</p>
              </div>
              <div>
                <span className="font-medium">🆔 Documento:</span>
                <p className="text-gray-600">{reserva.tipo_documento} {reserva.numero_documento}</p>
              </div>
              <div>
                <span className="font-medium">💰 Total:</span>
                <p className="text-gray-600 font-semibold">${reserva.precio_total?.toLocaleString()}</p>
              </div>
            </div>

            {/* Servicios adicionales */}
            {reserva.servicios_adicionales && reserva.servicios_adicionales.length > 0 && (
              <div className="mt-3">
                <span className="font-medium text-sm text-gray-700">🔧 Servicios adicionales:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {reserva.servicios_adicionales.map((servicio, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Motivo de rechazo si existe */}
            {reserva.estado === 'rechazada' && reserva.motivo_rechazo && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="font-medium text-sm text-red-700">Motivo del rechazo:</span>
                <p className="text-red-600 text-sm mt-1">{reserva.motivo_rechazo}</p>
              </div>
            )}
          </div>

          {/* Acciones */}
          {reserva.estado === 'pendiente' && (
            <div className="flex flex-col gap-3 lg:flex-shrink-0">
              <button
                onClick={() => onAceptar(reserva.id)}
                disabled={disabled}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ✅ Aceptar
              </button>
              
              <button
                onClick={() => setMostrarModalRechazo(true)}
                disabled={disabled}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ❌ Rechazar
              </button>
            </div>
          )}

          {/* Información de fecha para reservas no pendientes */}
          {reserva.estado !== 'pendiente' && (
            <div className="lg:flex-shrink-0 text-right">
              <div className="text-sm text-gray-500">
                {reserva.estado === 'aceptada' && reserva.fecha_aceptacion && (
                  <p>Aceptada: {new Date(reserva.fecha_aceptacion).toLocaleDateString('es-ES')}</p>
                )}
                {reserva.estado === 'rechazada' && reserva.fecha_rechazo && (
                  <p>Rechazada: {new Date(reserva.fecha_rechazo).toLocaleDateString('es-ES')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Información adicional expandible */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Solicitud creada: {reserva.fechaCreacionFormateada}</span>
            <span>ID: #{reserva.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Modal para motivo de rechazo */}
      {mostrarModalRechazo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">
              Rechazar Reserva
            </h3>
            
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres rechazar esta reserva? Opcionalmente puedes agregar un motivo:
            </p>

            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Motivo del rechazo (opcional)..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4 focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMostrarModalRechazo(false);
                  setMotivoRechazo('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={disabled}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}