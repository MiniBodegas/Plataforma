import { Link, useLocation } from 'react-router-dom';

export function NavBarProveedores() {
  const location = useLocation();

  const navItems = [
    {
      path: '/sedes-editor',
      label: 'Sedes',
      icon: '🏭'
    },
    {
      path: '',
      label: 'Bodegas',
      icon: '🏬'
    },
    {
      path: '/mis-mini-bodegas',
      label: 'Mis mini bodegas',
      icon: '🏢'
    },
    {
      path: '/mis-bodegas',
      label: 'Reservas',
      icon: '📋'
    },
    {
      path: '/balance',
      label: 'Balance',
      icon: '💰'
    },
    {
      path: '/perfil-proveedor',
      label: 'Perfil',
      icon: '👤'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 mb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-2 py-4 px-6 text-sm font-medium transition-all duration-200
                border-b-2 hover:text-[#2C3A61]
                ${isActive(item.path)
                  ? 'text-[#2C3A61] border-[#2C3A61] bg-blue-50/50'
                  : 'text-gray-600 border-transparent hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}