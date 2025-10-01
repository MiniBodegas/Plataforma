import { useState } from 'react';
import { ReservaCard, NavBarProveedores } from "../../components";
import { useReservasByEmpresa } from '../../hooks/useReservasByEmpresa';
import { useProveedorDashboard } from '../../hooks/useProveedorDashboard';
import { Check, X, Edit3, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Reservas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { 
    reservas, 
    loading: loadingReservas, 
    error: errorReservas, 
    actualizarEstadoReserva 
  } = useReservasByEmpresa();

  // ✅ Hook para gestionar disponibilidad de bodegas
  const { 
    bodegas, 
    loading: loadingBodegas, 
    error: errorBodegas, 
    actualizarDisponibilidad,
    empresaId
  } = useProveedorDashboard();

  const [procesando, setProcesando] = useState(false);
  const [vistaActual, setVistaActual] = useState('reservas'); // 'reservas' o 'disponibilidad'

  // ✅ Estados para gestión de disponibilidad
  const [editando, setEditando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [procesandoBodega, setProcesandoBodega] = useState(null);

  const handleAceptar = async (id) => {
    setProcesando(true);
    
    try {
      console.log('✅ Aceptando reserva:', id);
      
      const resultado = await actualizarEstadoReserva(id, 'aceptada');
      
      if (!resultado.success) {
        alert(`Error al aceptar la reserva: ${resultado.error}`);
      } else {
        // ✅ MENSAJE SIMPLIFICADO - SIN MENCIÓN DE CAMBIO DE DISPONIBILIDAD
        alert('✅ Reserva aceptada exitosamente.');
        console.log('✅ Reserva aceptada');
      }
    } catch (error) {
      console.error('❌ Error aceptando reserva:', error);
      alert('Error al procesar la aceptación de reserva');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async (id, motivoRechazo = null) => {
    setProcesando(true);
    
    try {
      console.log('❌ Rechazando reserva:', { id, motivoRechazo });
      
      const resultado = await actualizarEstadoReserva(id, 'rechazada', motivoRechazo);
      
      if (!resultado.success) {
        alert(`Error al rechazar la reserva: ${resultado.error}`);
      } else {
        // ✅ MENSAJE SIMPLIFICADO - SIN MENCIÓN DE CAMBIO DE DISPONIBILIDAD
        alert('❌ Reserva rechazada exitosamente.');
        console.log('✅ Reserva rechazada');
      }
    } catch (error) {
      console.error('❌ Error rechazando reserva:', error);
      alert('Error al procesar el rechazo de reserva');
    } finally {
      setProcesando(false);
    }
  };

  // ✅ Función para cambiar disponibilidad de bodegas MANUALMENTE
  const handleCambiarDisponibilidad = async (bodegaId, nuevoEstado) => {
    try {
      setProcesandoBodega(bodegaId);
      
      const motivoFinal = nuevoEstado ? null : (motivo.trim() || null);
      
      await actualizarDisponibilidad(bodegaId, nuevoEstado, motivoFinal);
      
      setEditando(null);
      setMotivo('');
      
      const accion = nuevoEstado ? 'habilitada' : 'deshabilitada';
      alert(`✅ Bodega ${accion} exitosamente`);
      
      console.log(`✅ Bodega ${bodegaId} ${accion}`);
    } catch (error) {
      alert('Error al actualizar disponibilidad: ' + error.message);
    } finally {
      setProcesandoBodega(null);
    }
  };

  // Estados de loading y error
  const loading = loadingReservas || (vistaActual === 'disponibilidad' && loadingBodegas);
  const error = errorReservas || (vistaActual === 'disponibilidad' && errorBodegas);

  // Mostrar loading de autenticación primero
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3A61] mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando autenticación...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay usuario
  if (!user) {
    return (
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <div className="text-yellow-600 text-4xl mb-3">🔐</div>
            <h3 className="text-yellow-800 text-lg font-semibold mb-2">
              Necesitas iniciar sesión
            </h3>
            <p className="text-yellow-600 mb-4">
              Para acceder al dashboard de proveedores necesitas estar logueado.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#4B799B] text-white px-6 py-2 rounded-lg hover:bg-[#3b5f7a]"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-600">Cargando...</p>
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
              ❌ Error cargando datos
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

  // Componente para renderizar cada sección de reservas
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

        {/* ✅ NAVEGACIÓN ENTRE VISTAS */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setVistaActual('reservas')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'reservas'
                  ? 'bg-[#4B799B] text-white shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Gestión de Reservas
            </button>
            <button
              onClick={() => setVistaActual('disponibilidad')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'disponibilidad'
                  ? 'bg-[#4B799B] text-white shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⚙️ Gestión de Disponibilidad
            </button>
          </div>
        </div>

        {/* ✅ VISTA DE RESERVAS */}
        {vistaActual === 'reservas' && (
          <>
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

            {/* Mensaje si no hay reservas */}
            {reservas.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-8">
                <div className="text-blue-600 text-4xl mb-3">🏢</div>
                <h3 className="text-blue-800 text-lg font-semibold mb-2">
                  No tienes reservas aún
                </h3>
                <p className="text-blue-600">
                  Las solicitudes de reserva de tus mini bodegas aparecerán aquí.
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
          </>
        )}

        {/* ✅ VISTA DE GESTIÓN DE DISPONIBILIDAD - SOLO CAMBIOS MANUALES */}
        {vistaActual === 'disponibilidad' && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6 text-[#2C3A61]">Gestión de Disponibilidad</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>ℹ️ Nota:</strong> Aquí puedes habilitar/deshabilitar manualmente tus bodegas. 
                Los cambios en las reservas NO afectan automáticamente la disponibilidad.
              </p>
            </div>
            
            {/* Estadísticas de disponibilidad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800">Disponibles</h4>
                <p className="text-2xl font-bold text-green-600">
                  {bodegas.filter(b => b.disponible).length}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800">No Disponibles</h4>
                <p className="text-2xl font-bold text-red-600">
                  {bodegas.filter(b => !b.disponible).length}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800">Total</h4>
                <p className="text-2xl font-bold text-blue-600">{bodegas.length}</p>
              </div>
            </div>

            {/* Lista de bodegas - SIEMPRE VISIBLE */}
            <div className="space-y-4">
              {bodegas.map(bodega => (
                <div key={bodega.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="font-semibold text-lg">
                          {bodega.metraje}m³ - {bodega.ciudad}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bodega.disponible 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {bodega.disponible ? 'Disponible' : 'No Disponible'}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <p>📍 {bodega.zona} - {bodega.ciudad}</p>
                        <p>💰 ${Number(bodega.precio_mensual).toLocaleString()}/mes</p>
                        {!bodega.disponible && bodega.motivo_no_disponible && (
                          <p className="text-red-600 mt-1">
                            <AlertCircle className="inline h-4 w-4 mr-1" />
                            {bodega.motivo_no_disponible}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {editando === bodega.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Motivo (opcional)"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="px-2 py-1 border rounded text-sm w-48"
                          />
                          <button
                            onClick={() => handleCambiarDisponibilidad(bodega.id, !bodega.disponible)}
                            disabled={procesandoBodega === bodega.id}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            {procesandoBodega === bodega.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            {bodega.disponible ? 'Deshabilitar' : 'Habilitar'}
                          </button>
                          <button
                            onClick={() => {
                              setEditando(null);
                              setMotivo('');
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditando(bodega.id);
                            setMotivo(bodega.motivo_no_disponible || '');
                          }}
                          className="px-3 py-1 bg-[#4B799B] text-white rounded text-sm hover:bg-[#3b5f7a] flex items-center gap-1"
                        >
                          <Edit3 className="h-4 w-4" />
                          {bodega.disponible ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {bodegas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tienes mini bodegas registradas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}