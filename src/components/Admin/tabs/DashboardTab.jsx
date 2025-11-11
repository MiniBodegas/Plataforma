import { 
  Building2, 
  Home, 
  Package, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { StatCard } from '../StatCard';

export function DashboardTab({ stats, empresas, reservas }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Empresas"
          value={stats.totalEmpresas}
          icon={<Building2 className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Total Sedes"
          value={stats.totalSedes}
          icon={<Home className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Mini Bodegas"
          value={stats.totalMiniBodegas}
          icon={<Package className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Reservas Totales"
          value={stats.totalReservas}
          icon={<Calendar className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pendientes"
          value={stats.reservasPendientes}
          icon={<AlertCircle className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Aceptadas"
          value={stats.reservasAceptadas}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Usuarios"
          value={stats.totalUsuarios}
          icon={<Users className="h-6 w-6" />}
          color="indigo"
        />
        <StatCard
          title="Ingresos"
          value={`$${Number(stats.ingresosMensuales || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="emerald"
        />
      </div>

      {/* Empresas Recientes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Empresas Recientes</h3>
        <div className="space-y-3">
          {empresas.length > 0 ? empresas.map((empresa) => (
            <div key={empresa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{empresa.nombre}</p>
                <p className="text-sm text-gray-500">{empresa.ciudad}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Sedes: {empresa._counts?.sedes ?? 0}</p>
                <p>Bodegas: {empresa._counts?.mini_bodegas ?? 0}</p>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">No hay empresas registradas</p>
          )}
        </div>
      </div>

      {/* Reservas Recientes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Reservas Recientes</h3>
        <div className="space-y-3">
          {reservas.length > 0 ? reservas.map((reserva) => (
            <div key={reserva.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">
                  {reserva.numero_documento || 'Sin documento'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(reserva.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                reserva.estado === 'aceptada' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {reserva.estado}
              </span>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">No hay reservas</p>
          )}
        </div>
      </div>
    </div>
  );
}
