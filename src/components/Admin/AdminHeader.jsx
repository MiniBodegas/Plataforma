import { Settings, Home, LogOut } from 'lucide-react';

export function AdminHeader({ onNavigateHome, onLogout }) {
  return (
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
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Home className="h-4 w-4" />
              Volver al inicio
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
