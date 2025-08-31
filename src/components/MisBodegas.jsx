import { useState } from 'react';

export function MisBodegas() {
  const [bodegas, setBodegas] = useState([
    {
      id: 1,
      titulo: "Mini bodega de 10 m³",
      direccion: "Calle 15 #34-56, Yumbo",
      sede: "Sede Yumbo",
      precio: 250000,
      estado: "disponible",
      descripcion: "Bodega segura con acceso 24/7",
      imagen: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400",
      fechaCreacion: "2024-01-15"
    },
    {
      id: 2,
      titulo: "Bodega de 25 m³",
      direccion: "Carrera 8 #12-34, Palmira",
      sede: "Sede Palmira",
      precio: 450000,
      estado: "ocupada",
      descripcion: "Bodega amplia para empresas",
      imagen: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400",
      fechaCreacion: "2024-01-20"
    },
    {
      id: 3,
      titulo: "Bodega de 15 m³",
      direccion: "Avenida 5 #78-90, Yumbo",
      sede: "Sede Yumbo",
      precio: 350000,
      estado: "disponible",
      descripcion: "Ideal para almacenamiento personal",
      imagen: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?w=400",
      fechaCreacion: "2024-02-01"
    },
    {
      id: 4,
      titulo: "Mini bodega de 8 m³",
      direccion: "Calle 22 #45-67, Palmira",
      sede: "Sede Palmira",
      precio: 280000,
      estado: "mantenimiento",
      descripcion: "Bodega en proceso de mejoras",
      imagen: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400",
      fechaCreacion: "2024-02-10"
    }
  ]);

  const [filtroSede, setFiltroSede] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busquedaDireccion, setBusquedaDireccion] = useState('');

  // Obtener sedes únicas
  const sedesUnicas = [...new Set(bodegas.map(bodega => bodega.sede))];

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

  return (
    <>
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
            Mis Mini Bodegas
          </h2>

          {/* Filtros */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Filtro por sede */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por sede
                </label>
                <select
                  value={filtroSede}
                  onChange={(e) => setFiltroSede(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
                >
                  <option value="todas">Todas las sedes</option>
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
                      />
                    </div>

                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-[#2C3A61]">{bodega.titulo}</h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getEstadoColor(bodega.estado)}`}>
                          {getEstadoTexto(bodega.estado)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <p><span className="font-medium">📍 Dirección:</span> {bodega.direccion}</p>
                        <p><span className="font-medium">🏢 Sede:</span> {bodega.sede}</p>
                        <p><span className="font-medium">💰 Precio:</span> ${bodega.precio?.toLocaleString()}/mes</p>
                        <p><span className="font-medium">📅 Creada:</span> {bodega.fechaCreacion}</p>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">{bodega.descripcion}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button className="bg-[#2C3A61] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1e2a4a] transition-colors">
                        Editar
                      </button>
                      <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                        Ver stats
                      </button>
                      {bodega.estado === 'disponible' && (
                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors">
                          Pausar
                        </button>
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
                  Intenta ajustar los filtros para ver más resultados
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
            <button className="bg-[#2C3A61] text-white p-4 rounded-full shadow-lg hover:bg-[#1e2a4a] transition-colors hover:scale-105">
              <span className="text-2xl">+</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}