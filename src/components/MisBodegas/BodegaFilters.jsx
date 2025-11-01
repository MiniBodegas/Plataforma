import { useMemo } from 'react';

export function BodegaFilters({ bodegas, filtros, onChange }) {
  // Obtener sedes únicas
  const sedesUnicas = useMemo(() => {
    return [...new Set(bodegas.map(b => b.sede_id))].filter(Boolean);
  }, [bodegas]);

  // Obtener ciudades únicas
  const ciudadesUnicas = useMemo(() => {
    return [...new Set(bodegas.map(b => b.ciudad))].filter(Boolean);
  }, [bodegas]);

  const handleChange = (field, value) => {
    onChange({
      ...filtros,
      [field]: value
    });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            value={filtros.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="inhabilitada">Inhabilitada</option>
            <option value="ocupada">Ocupada</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        {/* Filtro por ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            value={filtros.ciudad}
            onChange={(e) => handleChange('ciudad', e.target.value)}
          >
            <option value="todas">Todas las ciudades</option>
            {ciudadesUnicas.map((ciudad) => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda por nombre/descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre o descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            value={filtros.busqueda}
            onChange={(e) => handleChange('busqueda', e.target.value)}
          />
        </div>
      </div>

      {/* Chips de filtros activos */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filtros.estado !== 'todos' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#2C3A61] text-white">
            {filtros.estado}
            <button
              className="ml-2 hover:text-gray-200"
              onClick={() => handleChange('estado', 'todos')}
            >
              ×
            </button>
          </span>
        )}
        {filtros.ciudad !== 'todas' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#2C3A61] text-white">
            {filtros.ciudad}
            <button
              className="ml-2 hover:text-gray-200"
              onClick={() => handleChange('ciudad', 'todas')}
            >
              ×
            </button>
          </span>
        )}
        {filtros.busqueda && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#2C3A61] text-white">
            "{filtros.busqueda}"
            <button
              className="ml-2 hover:text-gray-200"
              onClick={() => handleChange('busqueda', '')}
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}