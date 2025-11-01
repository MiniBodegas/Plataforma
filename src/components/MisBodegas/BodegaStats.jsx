export function BodegaStats({ bodegas }) {
  const stats = {
    total: bodegas.length,
    activas: bodegas.filter(b => b.estado === 'activa').length,
    inhabilitadas: bodegas.filter(b => b.estado === 'inhabilitada').length,
    ocupadas: bodegas.filter(b => b.estado === 'ocupada').length,
    mantenimiento: bodegas.filter(b => b.estado === 'mantenimiento').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      {/* Total de bodegas */}
      <div className="bg-[#2C3A61] text-white p-4 rounded-xl">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm opacity-90">Total bodegas</div>
      </div>

      {/* Bodegas activas */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
        <div className="text-2xl font-bold text-green-700">{stats.activas}</div>
        <div className="text-sm text-green-600">Activas</div>
      </div>

      {/* Bodegas inhabilitadas */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
        <div className="text-2xl font-bold text-red-700">{stats.inhabilitadas}</div>
        <div className="text-sm text-red-600">Inhabilitadas</div>
      </div>

      {/* Bodegas ocupadas */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
        <div className="text-2xl font-bold text-blue-700">{stats.ocupadas}</div>
        <div className="text-sm text-blue-600">Ocupadas</div>
      </div>

      {/* Bodegas en mantenimiento */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
        <div className="text-2xl font-bold text-yellow-700">{stats.mantenimiento}</div>
        <div className="text-sm text-yellow-600">En mantenimiento</div>
      </div>
    </div>
  );
}