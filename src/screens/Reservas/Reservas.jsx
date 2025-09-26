import { useState } from 'react';
import { ReservaCard, NavBarProveedores } from "../../components";
import { useReservasByEmpresa } from '../../hooks/useReservasByEmpresa';

export function Reservas() {
  const { 
    reservas, 
    loading, 
    error, 
    actualizarEstadoReserva 
  } = useReservasByEmpresa();

  const [procesando, setProcesando] = useState(false);

  const handleAceptar = async (id) => {
    setProcesando(true);
    const resultado = await actualizarEstadoReserva(id, 'aceptada');
    
    if (!resultado.success) {
      alert(`Error al aceptar la reserva: ${resultado.error}`);
    }
    setProcesando(false);
  };

  const handleRechazar = async (id) => {
    setProcesando(true);
    const resultado = await actualizarEstadoReserva(id, 'rechazada');
    
    if (!resultado.success) {
      alert(`Error al rechazar la reserva: ${resultado.error}`);
    }
    setProcesando(false);
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
            Mis mini bodegas
          </h2>
          <NavBarProveedores />
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3A61] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reservas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
            Mis mini bodegas
          </h2>
          <NavBarProveedores />
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              ❌ Error cargando reservas
            </div>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar reservas por estado
  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasAceptadas = reservas.filter(r => r.estado === 'aceptada');
  const reservasRechazadas = reservas.filter(r => r.estado === 'rechazada');

  // Componente para renderizar cada sección
  const renderSeccion = (titulo, reservasArray, colorTitulo, icono, colorFondo) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icono}</span>
        <h3 className={`text-xl font-semibold ${colorTitulo}`}>
          {titulo}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorFondo}`}>
          {reservasArray.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {reservasArray.length > 0 ? (
          reservasArray.map(reserva => (
            <ReservaCard 
              key={reserva.id}
              reserva={reserva}
              onAceptar={handleAceptar}
              onRechazar={handleRechazar}
              disabled={procesando}
            />
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">
              No hay reservas {titulo.toLowerCase()}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {titulo === 'Pendientes' && 'Las nuevas solicitudes de reserva aparecerán aquí'}
              {titulo === 'Aceptadas' && 'Las reservas que aceptes se mostrarán en esta sección'}
              {titulo === 'Rechazadas' && 'Las reservas que rechaces aparecerán aquí'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
          Mis mini bodegas
        </h2>
        <NavBarProveedores />

        {/* Resumen simplificado */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200 text-center">
            <div className="text-xl font-bold text-yellow-700">{reservasPendientes.length}</div>
            <div className="text-yellow-600 text-sm">Pendientes</div>
          </div>
          <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200 text-center">
            <div className="text-xl font-bold text-green-700">{reservasAceptadas.length}</div>
            <div className="text-green-600 text-sm">Aceptadas</div>
          </div>
          <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-200 text-center">
            <div className="text-xl font-bold text-red-700">{reservasRechazadas.length}</div>
            <div className="text-red-600 text-sm">Rechazadas</div>
          </div>
        </div>

        {/* Mensaje si no hay mini bodegas */}
        {reservas.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-8">
            <div className="text-blue-600 text-4xl mb-3">🏢</div>
            <h3 className="text-blue-800 text-lg font-semibold mb-2">
              No tienes mini bodegas registradas
            </h3>
            <p className="text-blue-600">
              Para recibir reservas, primero necesitas crear tu perfil de empresa y agregar mini bodegas.
            </p>
          </div>
        )}

        {/* Secciones de reservas */}
        <div className="space-y-10">
          {renderSeccion(
            'Pendientes', 
            reservasPendientes, 
            'text-yellow-600', 
            '⏳',
            'bg-yellow-100 text-yellow-800'
          )}
          
          {renderSeccion(
            'Aceptadas', 
            reservasAceptadas, 
            'text-green-600', 
            '✅',
            'bg-green-100 text-green-800'
          )}
          
          {renderSeccion(
            'Rechazadas', 
            reservasRechazadas, 
            'text-red-600', 
            '❌',
            'bg-red-100 text-red-800'
          )}
        </div>
      </div>
    </div>
  );
}