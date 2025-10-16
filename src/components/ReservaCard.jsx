import { useState } from 'react';
import { format } from 'date-fns';
// ✅ AGREGAR ESTAS IMPORTACIONES QUE FALTAN
import { User, MapPin, Calendar, Check, X } from 'lucide-react';

export function ReservaCard({ reserva, onAceptar, onRechazar, disabled }) {
  // ✅ USAR CAMPOS REALES DE LA ESTRUCTURA
  const cliente = {
    documento: reserva.numero_documento,
    celular: reserva.numero_celular,
    tipoDocumento: reserva.tipo_documento
  };

  const bodega = reserva.mini_bodegas || {};
  const fechaInicio = reserva.fecha_inicio;
  const fechaFin = reserva.fecha_fin;
  const servicios = reserva.servicios_adicionales || [];
  const precioTotal = reserva.precio_total;

  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // ✅ AGREGAR FUNCIÓN getIcon QUE FALTABA
  const getIcon = () => {
    switch (reserva.estado) {
      case 'pendiente':
        return '⏳';
      case 'aceptada':
        return '✅';
      case 'rechazada':
        return '❌';
      case 'cancelada':
        return '🚫';
      default:
        return '📋';
    }
  };

  // ✅ AGREGAR FUNCIÓN getBadgeColor QUE FALTABA
  const getBadgeColor = () => {
    switch (reserva.estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aceptada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'border-yellow-200';
      case 'aceptada':
        return 'border-green-200';
      case 'rechazada':
        return 'border-red-200';
      case 'cancelada':
        return 'border-gray-200';
      default:
        return 'border-gray-200';
    }
  };

  // ✅ AGREGAR FUNCIÓN getEstadoTexto QUE FALTABA
  const getEstadoTexto = () => {
    switch (reserva.estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'cancelada': return 'Cancelada';
      default: return reserva.estado;
    }
  };

  const handleRechazar = () => {
    onRechazar(reserva.id, motivoRechazo);
    setMostrarModalRechazo(false);
    setMotivoRechazo('');
  };

  // Solo mostrar datos personales si la reserva está aceptada
  const mostrarDatosPersonales = reserva.estado === 'aceptada';

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${getEstadoColor(reserva.estado)} p-6 transition-all duration-300`}>
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getIcon()}</span>
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              Reserva #{reserva.id.slice(0, 8)}
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor()}`}>
              {getEstadoTexto()}
            </span>
          </div>
        </div>
        
        {/* Fechas importantes */}
        <div className="text-right text-sm text-gray-500">
          <p>Creada: {format(new Date(reserva.created_at), 'dd/MM/yyyy')}</p>
          {reserva.fecha_aceptacion && (
            <p className="text-green-600">Aceptada: {format(new Date(reserva.fecha_aceptacion), 'dd/MM/yyyy')}</p>
          )}
          {reserva.fecha_rechazo && (
            <p className="text-red-600">Rechazada: {format(new Date(reserva.fecha_rechazo), 'dd/MM/yyyy')}</p>
          )}
        </div>
      </div>

      {/* Info del cliente SOLO si la reserva está aceptada */}
      {mostrarDatosPersonales && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Información del Cliente
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p><span className="font-medium">Documento:</span> {cliente.tipoDocumento} {cliente.documento}</p>
            <p><span className="font-medium">Celular:</span> {cliente.celular}</p>
          </div>
        </div>
      )}

      {/* Info de la bodega (siempre visible) */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Detalles de la Mini Bodega
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Tamaño:</span> {bodega.metraje || 'N/A'}m³</p>
          <p><span className="font-medium">Ubicación:</span> {bodega.ciudad || 'N/A'} - {bodega.zona || 'N/A'}</p>
          <p><span className="font-medium">Precio:</span> ${Number(bodega.precio_mensual || 0).toLocaleString()}/mes</p>
          <p><span className="font-medium">Total:</span> ${Number(precioTotal || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Período de reserva (siempre visible) */}
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Período de Reserva
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Inicio:</span> {fechaInicio}</p>
          <p><span className="font-medium">Fin:</span> {fechaFin}</p>
        </div>
      </div>

      {/* Servicios adicionales (siempre visible) */}
      {servicios && servicios.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Servicios Adicionales</h4>
          <div className="flex flex-wrap gap-2">
            {servicios.map((servicio, index) => (
              <span 
                key={index}
                className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm"
              >
                {servicio}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción para reservas pendientes */}
      {reserva.estado === 'pendiente' && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => onAceptar(reserva.id)}
            disabled={disabled}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {disabled ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Aceptar Reserva
              </>
            )}
          </button>
          
          <button
            onClick={() => setMostrarModalRechazo(true)}
            disabled={disabled}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {disabled ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Rechazar Reserva
              </>
            )}
          </button>
        </div>
      )}

      {/* Mostrar motivo de rechazo si existe */}
      {reserva.estado === 'rechazada' && reserva.motivo_rechazo && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <span className="font-medium">Motivo de rechazo:</span> {reserva.motivo_rechazo}
          </p>
        </div>
      )}

      {/* Mostrar notas de la empresa si existen */}
      {reserva.notas_empresa && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            <span className="font-medium">Notas:</span> {reserva.notas_empresa}
          </p>
        </div>
      )}

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
    </div>
  );
}