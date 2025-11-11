import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Calendar, 
  Settings
} from 'lucide-react';

// Componentes
import { AdminHeader, TabButton, LoadingScreen } from '../../components/index';
import { 
  DashboardTab, 
  EmpresasTab, 
  ReservasTab, 
  UsuariosTab, 
  ConfiguracionTab 
} from '../../components/index';

// Hooks
import { useAdminStats } from '../../hooks/useAdminStats';

export function AdminPanel() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usuarios] = useState([]);
  
  // Hook personalizado para cargar estadísticas
  const { stats, empresas, reservasRecientes, loading, loadData } = useAdminStats();

  // Verificar acceso y cargar datos al montar
  useEffect(() => {
    if (!user?.id) {
      navigate('/');
      return;
    }
    loadData();
  }, [user?.id, navigate, loadData]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader onNavigateHome={handleNavigateHome} onLogout={handleLogout} />

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
        {activeTab === 'empresas' && <EmpresasTab empresas={empresas} onRefresh={loadData} />}
        {activeTab === 'reservas' && <ReservasTab reservas={reservasRecientes} onRefresh={loadData} />}
        {activeTab === 'usuarios' && <UsuariosTab usuarios={usuarios} />}
        {activeTab === 'configuracion' && <ConfiguracionTab />}
      </div>
    </div>
  );
}
