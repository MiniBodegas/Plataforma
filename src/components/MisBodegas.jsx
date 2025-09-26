import { useState } from 'react';
import { useBodegasByEmpresa } from '../hooks/useBodegasByEmpresa';
import { useAuth } from '../contexts/AuthContext';

export function MisBodegas() {
  const {
    bodegas,
    loading,
    error,
    refetch,
    actualizarEstadoBodega
  } = useBodegasByEmpresa();

  // ✅ CAMBIAR A user PARA CONSISTENCIA
  const { user, loading: authLoading } = useAuth();
  
  console.log('🏠 MisBodegas - Auth state:', {
    user: user,
    authLoading: authLoading,
    userId: user?.id,
    userKeys: user ? Object.keys(user) : 'no user'
  });

  console.log('🏠 MisBodegas - Hook state:', {
    bodegas: bodegas,
    loading: loading,
    error: error,
    bodegasLength: bodegas?.length
  });

  const [filtroSede, setFiltroSede] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busquedaDireccion, setBusquedaDireccion] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Obtener sedes únicas
  const sedesUnicas = [...new Set(bodegas.map(bodega => bodega.sede).filter(Boolean))];

  // Filtrar bodegas
  const bodegasFiltradas = bodegas.filter(bodega => {
    const cumpleSede = filtroSede === 'todas' || bodega.sede === filtroSede;
    const cumpleEstado = filtroEstado === 'todos' || bodega.estado === filtroEstado;
    const cumpleDireccion = bodega.direccion.toLowerCase().includes(busquedaDireccion.toLowerCase());
    
    return cumpleSede && cumpleEstado && cumpleDireccion;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ocupada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'Disponible';
      case 'ocupada':
        return 'Ocupada';
      case 'mantenimiento':
        return 'Mantenimiento';
      default:
        return 'Sin estado';
    }
  };

  const handleCambiarEstado = async (bodegaId, nuevoEstado) => {
    setProcesando(true);
    const resultado = await actualizarEstadoBodega(bodegaId, nuevoEstado);
    
    if (!resultado.success) {
      alert(`Error al cambiar el estado: ${resultado.error}`);
    }
    setProcesando(false);
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
            Mis Mini Bodegas
          </h2>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3A61] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando bodegas...</p>
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
            Mis Mini Bodegas
          </h2>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              ❌ Error cargando bodegas
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
            Mis Mini Bodegas
          </h2>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-700">{bodegas.length}</div>
              <div className="text-blue-600 text-sm">Total Bodegas</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-700">
                {bodegas.filter(b => b.estado === 'disponible').length}
              </div>
              <div className="text-green-600 text-sm">Disponibles</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {bodegas.filter(b => b.estado === 'ocupada').length}
              </div>
              <div className="text-blue-600 text-sm">Ocupadas</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {bodegas.reduce((total, b) => total + (b.reservasActivas || 0), 0)}
              </div>
              <div className="text-yellow-600 text-sm">Reservas Activas</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Filtro por sede */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por ubicación
                </label>
                <select
                  value={filtroSede}
                  onChange={(e) => setFiltroSede(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
                >
                  <option value="todas">Todas las ubicaciones</option>
                  {sedesUnicas.map(sede => (
                    <option key={sede} value={sede}>{sede}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>

              {/* Búsqueda por dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por dirección
                </label>
                <input
                  type="text"
                  placeholder="Ingresa dirección..."
                  value={busquedaDireccion}
                  onChange={(e) => setBusquedaDireccion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
                />
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {bodegasFiltradas.length} de {bodegas.length} bodegas
            </div>
          </div>

          {/* Mensaje si no hay mini bodegas */}
          {bodegas.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-8">
              <div className="text-blue-600 text-4xl mb-3">🏢</div>
              <h3 className="text-blue-800 text-lg font-semibold mb-2">
                No tienes mini bodegas registradas
              </h3>
              <p className="text-blue-600">
                Para empezar a recibir reservas, crea tu perfil de empresa y agrega mini bodegas.
              </p>
            </div>
          )}

          {/* Grid de bodegas */}
          <div className="space-y-4">
            {bodegasFiltradas.length > 0 ? (
              bodegasFiltradas.map(bodega => (
                <div 
                  key={bodega.id}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    {/* Imagen */}
                    <div className="w-24 h-24 bg-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={bodega.imagen} 
                        alt={bodega.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400";
                        }}
                      />
                    </div>

                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-[#2C3A61]">{bodega.titulo}</h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getEstadoColor(bodega.estado)}`}>
                          {getEstadoTexto(bodega.estado)}
                        </span>
                        {bodega.reservasActivas > 0 && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium border border-orange-200">
                            {bodega.reservasActivas} reserva{bodega.reservasActivas > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <p><span className="font-medium">📍 Dirección:</span> {bodega.direccion}</p>
                        <p><span className="font-medium">🗺️ Ubicación:</span> {bodega.sede}</p>
                        <p><span className="font-medium">💰 Precio:</span> ${bodega.precio?.toLocaleString()}/mes</p>
                        <p><span className="font-medium">📅 Creada:</span> {bodega.fechaCreacion}</p>
                        {bodega.contenido && (
                          <p className="col-span-2"><span className="font-medium">📦 Contenido:</span> {bodega.contenido}</p>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">{bodega.descripcion}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button 
                        className="bg-[#2C3A61] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1e2a4a] transition-colors"
                        onClick={() => {
                          // Aquí puedes agregar navegación al editor de bodegas
                          console.log('Editar bodega:', bodega.id);
                        }}
                      >
                        Editar
                      </button>
                      
                      <button 
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                        onClick={() => {
                          // Aquí puedes agregar lógica para ver estadísticas
                          console.log('Ver stats de bodega:', bodega.id);
                        }}
                      >
                        Ver stats
                      </button>
                      
                      {/* ✅ BOTONES ACTUALIZADOS - Solo mostrar si no está ocupada */}
                      {bodega.estado !== 'ocupada' && (
                        <>
                          {bodega.disponibilidad === true ? (
                            <button 
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
                              disabled={procesando}
                              onClick={() => handleCambiarEstado(bodega.id, 'mantenimiento')}
                              title="Pausar bodega (no recibirá nuevas reservas)"
                            >
                              Pausar
                            </button>
                          ) : (
                            <button 
                              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                              disabled={procesando}
                              onClick={() => handleCambiarEstado(bodega.id, 'disponible')}
                              title="Activar bodega (podrá recibir reservas)"
                            >
                              Activar
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* ✅ MOSTRAR INFORMACIÓN ADICIONAL si está ocupada */}
                      {bodega.estado === 'ocupada' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                          <div className="text-blue-800 text-xs font-medium">
                            Ocupada ({bodega.reservasActivas} reserva{bodega.reservasActivas > 1 ? 's' : ''})
                          </div>
                          <div className="text-blue-600 text-xs mt-1">
                            No se puede pausar mientras tenga reservas activas
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No se encontraron bodegas
                </h3>
                <p className="text-gray-500 mb-4">
                  {bodegas.length === 0 
                    ? 'Aún no has creado ninguna mini bodega'
                    : 'Intenta ajustar los filtros para ver más resultados'
                  }
                </p>
                <button 
                  onClick={() => {
                    setFiltroSede('todas');
                    setFiltroEstado('todos');
                    setBusquedaDireccion('');
                  }}
                  className="bg-[#2C3A61] text-white px-4 py-2 rounded-lg hover:bg-[#1e2a4a] transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Botón agregar nueva bodega */}
          <div className="fixed bottom-6 right-6">
            <button 
              className="bg-[#2C3A61] text-white p-4 rounded-full shadow-lg hover:bg-[#1e2a4a] transition-colors hover:scale-105"
              onClick={() => {
                // Aquí puedes agregar navegación al editor de bodegas
                console.log('Agregar nueva bodega');
              }}
              title="Agregar nueva bodega"
            >
              <span className="text-2xl">+</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}