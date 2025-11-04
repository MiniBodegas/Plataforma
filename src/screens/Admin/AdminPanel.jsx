import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Package, 
  Calendar, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  LogOut,
  Home
} from 'lucide-react';

export function AdminPanel() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados para datos
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    totalSedes: 0,
    totalMiniBodegas: 0,
    totalReservas: 0,
    reservasPendientes: 0,
    reservasAceptadas: 0,
    totalUsuarios: 0,
    ingresosMensuales: 0
  });

  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reservasRecientes, setReservasRecientes] = useState([]);

  // Verificar si es admin y cargar datos
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        const ok = await checkAdminAccess();
        if (!ok || cancelled) return;

        await loadDashboardData();
      } catch (e) {
        console.error('Error inicializando panel:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!user?.id) {
      navigate('/');
      return;
    }

    init();
    return () => { cancelled = true; };
  }, [user?.id]);

  const checkAdminAccess = async () => {
    try {
      if (!user?.id) {
        console.log('❌ No hay usuario logueado');
        navigate('/');
        return false;
      }

      console.log('🔍 Verificando permisos para user_id:', user.id);

      // ✅ Verificar rol desde la tabla (usando maybeSingle en lugar de single)
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle(); // ✅ Cambiado de .single() a .maybeSingle()

      console.log('📊 Resultado de verificación:', { userRole, error });

      if (error) {
        console.error('❌ Error consultando rol:', error);
        alert('Error verificando permisos: ' + error.message);
        navigate('/');
        return false;
      }

      if (!userRole) {
        console.warn('⚠️ Usuario no tiene rol asignado');
        alert('No tienes un rol asignado en el sistema');
        navigate('/');
        return false;
      }

      if (userRole.role !== 'admin') {
        console.warn('⚠️ Usuario sin permisos de admin, rol actual:', userRole.role);
        alert(`No tienes permisos de administrador.\nTu rol actual es: ${userRole.role}`);
        navigate('/');
        return false;
      }

      console.log('✅ Acceso admin verificado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inesperado verificando acceso:', error);
      alert('Error inesperado: ' + error.message);
      navigate('/');
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      console.log('📊 Cargando datos del dashboard...');

      // Estadísticas principales
      const [
        empresasCountRes,
        sedesCountRes,
        miniBodegasCountRes,
        reservasCountRes,
        reservasPendCountRes,
        reservasAcepCountRes,
      ] = await Promise.all([
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('sedes').select('*', { count: 'exact', head: true }),
        supabase.from('mini_bodegas').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'aceptada'),
      ]);

      const totalEmpresas = empresasCountRes.count ?? 0;
      const totalSedes = sedesCountRes.count ?? 0;
      const totalMiniBodegas = miniBodegasCountRes.count ?? 0;
      const totalReservas = reservasCountRes.count ?? 0;
      const reservasPendientes = reservasPendCountRes.count ?? 0;
      const reservasAceptadas = reservasAcepCountRes.count ?? 0;

      // Empresas recientes
      const { data: empresasRaw, error: empresasErr } = await supabase
        .from('empresas')
        .select(`
          id,
          nombre,
          ciudad,
          created_at,
          sedes ( id ),
          mini_bodegas ( id )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (empresasErr) {
        console.error('Error cargando empresas:', empresasErr);
      }

      const empresasData = (empresasRaw ?? []).map((e) => ({
        ...e,
        _counts: {
          sedes: e.sedes ? e.sedes.length : 0,
          mini_bodegas: e.mini_bodegas ? e.mini_bodegas.length : 0,
        },
      }));

      // Reservas recientes
      const { data: reservasRaw, error: reservasErr } = await supabase
        .from('reservas')
        .select(`
          id,
          created_at,
          estado,
          numero_documento
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reservasErr) {
        console.error('Error cargando reservas recientes:', reservasErr);
      }

      // Usuarios
      let totalUsuarios = 0;
      try {
        const { count: rolesCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });
        totalUsuarios = rolesCount ?? 0;
      } catch {
        totalUsuarios = 0;
      }

      setStats({
        totalEmpresas,
        totalSedes,
        totalMiniBodegas,
        totalReservas,
        reservasPendientes,
        reservasAceptadas,
        totalUsuarios,
        ingresosMensuales: 0
      });

      setEmpresas(empresasData || []);
      setReservasRecientes(reservasRaw || []);

      console.log('✅ Datos del dashboard cargados');
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2C3A61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
          <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-[#2C3A61]" />
              <div>
                <h1 className="text-2xl font-bold text-[#2C3A61]">Panel de Administración</h1>
                <p className="text-sm text-gray-500">Gestión completa de la plataforma</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <Home className="h-4 w-4" />
                Volver al inicio
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<BarChart3 className="h-4 w-4" />}
            label="Dashboard"
          />
          <TabButton
            active={activeTab === 'empresas'}
            onClick={() => setActiveTab('empresas')}
            icon={<Building2 className="h-4 w-4" />}
            label="Empresas"
          />
          <TabButton
            active={activeTab === 'reservas'}
            onClick={() => setActiveTab('reservas')}
            icon={<Calendar className="h-4 w-4" />}
            label="Reservas"
          />
          <TabButton
            active={activeTab === 'usuarios'}
            onClick={() => setActiveTab('usuarios')}
            icon={<Users className="h-4 w-4" />}
            label="Usuarios"
          />
          <TabButton
            active={activeTab === 'configuracion'}
            onClick={() => setActiveTab('configuracion')}
            icon={<Settings className="h-4 w-4" />}
            label="Configuración"
          />
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} empresas={empresas} reservas={reservasRecientes} />
        )}
        {activeTab === 'empresas' && <EmpresasTab empresas={empresas} onRefresh={loadDashboardData} />}
        {activeTab === 'reservas' && <ReservasTab reservas={reservasRecientes} onRefresh={loadDashboardData} />}
        {activeTab === 'usuarios' && <UsuariosTab usuarios={usuarios} />}
        {activeTab === 'configuracion' && <ConfiguracionTab />}
      </div>
    </div>
  );
}

// Componente de botón de tab
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
        active
          ? 'bg-[#2C3A61] text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Tab de Dashboard
function DashboardTab({ stats, empresas, reservas }) {
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

// Componente de tarjeta de estadística
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Tabs adicionales (estructura básica)
function EmpresasTab({ empresas, onRefresh }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Gestión de Empresas</h3>
      <p className="text-gray-600">Contenido de empresas...</p>
    </div>
  );
}

function ReservasTab({ reservas, onRefresh }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Gestión de Reservas</h3>
      <p className="text-gray-600">Contenido de reservas...</p>
    </div>
  );
}

function UsuariosTab({ usuarios }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Gestión de Usuarios</h3>
      <p className="text-gray-600">Contenido de usuarios...</p>
    </div>
  );
}

function ConfiguracionTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Configuración del Sistema</h3>
      <p className="text-gray-600">Configuraciones generales...</p>
    </div>
  );
}
