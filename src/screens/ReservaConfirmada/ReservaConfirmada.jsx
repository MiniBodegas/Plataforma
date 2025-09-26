import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function ReservaConfirmada() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reserva, message } = location.state || {};

  useEffect(() => {
    if (!reserva) {
      navigate('/');
    }
  }, [reserva, navigate]);

  if (!reserva) {
    return <div>Reserva no encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icono de éxito */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-[#2C3A61] mb-4">
          ¡Reserva Enviada!
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          {message || 'Tu solicitud de reserva ha sido enviada exitosamente.'}
        </p>

        {/* Información de la reserva */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">Detalles de tu reserva:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">ID:</span> #{reserva.id}</p>
            <p><span className="font-medium">Estado:</span> 
              <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                Pendiente de aprobación
              </span>
            </p>
            <p><span className="font-medium">Fecha inicio:</span> {new Date(reserva.fecha_inicio).toLocaleDateString('es-ES')}</p>
            <p><span className="font-medium">Total:</span> ${reserva.precio_total?.toLocaleString()}</p>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-blue-800 mb-2">Próximos pasos:</h4>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>La empresa revisará tu solicitud</li>
            <li>Recibirás una notificación por email</li>
            <li>Si es aprobada, podrás proceder con el pago</li>
            <li>¡Podrás usar tu mini bodega!</li>
          </ol>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/mis-reservas')}
            className="w-full bg-[#2C3A61] text-white py-3 rounded-lg hover:bg-[#1e2a4a] transition-colors"
          >
            Ver mis reservas
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}