import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase'; 
import { NotificationBell } from './NotificationBell';

export function Header({ tipo }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState(0); // Estado para notificaciones

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    closeMenu();
  };

  // Función para manejar enlaces protegidos
  const handleProtectedLink = (targetRoute, loginRoute) => {
    closeMenu();
    if (user && user?.user_metadata?.user_type === 'proveedor') {
      navigate(targetRoute);
    } else {
      // Guardar la ruta a la que quería ir para redirigir después del login
      localStorage.setItem('redirectAfterLogin', targetRoute);
      navigate(loginRoute);
    }
  };

  // Cargar notificaciones no leídas
  useEffect(() => {
    async function cargarNotificaciones() {
      if (!user) return;
      
      try {
        // Consultar la tabla de notificaciones para el usuario actual
        const { data, error } = await supabase
          .from('notificaciones')
          .select('id') // Seleccionar solo el ID para minimizar datos transferidos
          .eq('user_id', user.id)
          .eq('leida', false);
          
        if (data && !error) {
          setNotificaciones(data.length || 0);
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    }
    
    cargarNotificaciones();
    
    // Opcionalmente actualizar cada minuto
    const interval = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="w-full bg-white text-[#2C3A61] shadow-sm relative">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to={tipo === "proveedor" ? "/home-proveedor" : "/"} className="text-decoration-none">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C3A61] hover:scale-105 transition-transform duration-300 cursor-pointer">
              MiniBodegas
            </h1>
          </Link>
        </div>

        {/* Menú Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          {tipo === "usuario" && (
            <>
              <Link
                to="/calculadora"
                className="text-base font-medium relative group whitespace-nowrap"
              >
                Calcula tu espacio
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2C3A61] transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* Mostrar diferentes botones según el estado de autenticación */}
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Campana de notificaciones antes del botón de perfil */}
                  <NotificationBell />
                  
                  <Link 
                    to="/perfil-user"
                    className="flex items-center gap-2 px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 whitespace-nowrap"
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 rounded font-semibold bg-[#2C3A61] text-white 
                    hover:bg-[#1e2a47] transition-colors duration-300 whitespace-nowrap"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login"
                    className="px-4 py-2 rounded font-semibold text-[#2C3A61] 
                    hover:bg-gray-100 transition-colors duration-300 whitespace-nowrap"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register"
                    className="px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 whitespace-nowrap"
                  >
                    Regístrate
                  </Link>
                </div>
              )}
            </>
          )}

          {tipo === "proveedor" && (
            <>
              {/* Mostrar siempre "Crea tu mini bodega", pero protegerlo */}
              <button
                onClick={() => handleProtectedLink('/bodega-editor-proveedor', '/login-proveedores')}
                className="text-base font-medium relative group whitespace-nowrap cursor-pointer bg-transparent border-none p-0 text-[#2C3A61]"
              >
                Crea tu mini bodega
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2C3A61] transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Dashboard solo visible para proveedores logueados */}
              {user && user?.user_metadata?.user_type === 'proveedor' && (
                <Link
                  to="/mis-bodegas"
                  className="text-base font-medium relative group whitespace-nowrap"
                >
                  Dashboard
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2C3A61] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}

              {/* Mostrar diferentes botones según el estado de autenticación para proveedores */}
              {user && user?.user_metadata?.user_type === 'proveedor' ? (
                <div className="flex items-center space-x-4">
                  {/* Campana de notificaciones antes del botón de perfil */}
                  <NotificationBell />
                  
                  <Link 
                    to="/perfil-proveedor"
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 whitespace-nowrap text-sm lg:text-base"
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-3 lg:px-4 py-2 rounded font-semibold bg-[#2C3A61] text-white 
                    hover:bg-[#1e2a47] transition-colors duration-300 whitespace-nowrap text-sm lg:text-base"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login-proveedores"
                    className="px-3 lg:px-4 py-2 rounded font-semibold text-[#2C3A61] 
                    hover:bg-gray-100 transition-colors duration-300 whitespace-nowrap text-sm lg:text-base"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register-proveedores"
                    className="px-3 lg:px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 whitespace-nowrap text-sm lg:text-base"
                  >
                    Regístrate como Proveedor
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Botón Hamburguesa */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-[#2C3A61]" />
          ) : (
            <Menu className="h-6 w-6 text-[#2C3A61]" />
          )}
        </button>
      </div>

      {/* Menú Mobile */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t transition-all duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="flex flex-col p-4 space-y-4">
          {tipo === "usuario" && (
            <>
              <Link
                to="/calculadora"
                className="text-base font-medium py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200"
                onClick={closeMenu}
              >
                Calcula tu espacio
              </Link>

              {/* Menú mobile para usuarios */}
              {user ? (
                <>
                  {/* Campana de notificaciones independiente en versión móvil */}
                  <div className="px-3 py-2">
                    <NotificationBell />
                  </div>
                  
                  <Link 
                    to="/perfil-user"
                    className="flex items-center gap-2 px-4 py-3 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 text-center"
                    onClick={closeMenu}
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-3 rounded font-semibold bg-[#2C3A61] text-white 
                    hover:bg-[#1e2a47] transition-colors duration-300 text-center w-full"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="px-4 py-3 rounded font-semibold text-[#2C3A61] 
                    hover:bg-gray-100 transition-colors duration-300 text-center"
                    onClick={closeMenu}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register"
                    className="px-4 py-3 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 text-center"
                    onClick={closeMenu}
                  >
                    Regístrate
                  </Link>
                </>
              )}
            </>
          )}

          {tipo === "proveedor" && (
            <>
              {/* Mostrar siempre "Crea tu mini bodega" en mobile, pero protegerlo */}
              <button
                onClick={() => handleProtectedLink('/bodega-editor-proveedor', '/login-proveedores')}
                className="text-base font-medium py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200 text-left w-full bg-transparent border-none"
              >
                Crea tu mini bodega
              </button>

              {/* Dashboard solo visible para proveedores logueados en mobile */}
              {user && user?.user_metadata?.user_type === 'proveedor' && (
                <Link
                  to="/mis-bodegas"
                  className="text-base font-medium py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              )}

              {/* Menú mobile para proveedores */}
              {user && user?.user_metadata?.user_type === 'proveedor' ? (
                <>
                  {/* Campana de notificaciones independiente en versión móvil */}
                  <div className="px-3 py-2">
                    <NotificationBell />
                  </div>
                
                  <Link 
                    to="/perfil-proveedor"
                    className="flex items-center gap-2 px-4 py-3 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 text-center"
                    onClick={closeMenu}
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-3 rounded font-semibold bg-[#2C3A61] text-white 
                    hover:bg-[#1e2a47] transition-colors duration-300 text-center w-full"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login-proveedores"
                    className="px-4 py-3 rounded font-semibold text-[#2C3A61] 
                    hover:bg-gray-100 transition-colors duration-300 text-center"
                    onClick={closeMenu}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register-proveedores"
                    className="px-4 py-3 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
                    hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 text-center"
                    onClick={closeMenu}
                  >
                    Regístrate como Proveedor
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Overlay para cerrar menú en móvil */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        ></div>
      )}
    </header>
  );
}
