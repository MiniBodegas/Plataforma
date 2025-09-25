import { Instagram, Facebook, MessageCircle } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function Footer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  
  // Detecta modo proveedor por la ruta
  const isProveedor = location.pathname.includes("proveedor")
  const isUserLoggedAsProveedor = user?.user_metadata?.user_type === 'proveedor'
  const isUserLoggedAsRegular = user && user?.user_metadata?.user_type !== 'proveedor'

  const handleContextSwitch = async (targetRoute) => {
    try {
      console.log('🔄 Cambiando contexto a:', targetRoute)
      
      // Si hay un usuario logueado y está cambiando de contexto
      if (user) {
        console.log('👤 Usuario logueado, haciendo logout...')
        
        // Hacer logout de forma segura
        const { error } = await signOut()
        if (error) {
          console.error('❌ Error en signOut:', error)
          // Continuar de todos modos
        }
        
        // Limpiar cualquier estado residual
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
        
        // Esperar un poco más para asegurar que se completó el logout
        setTimeout(() => {
          console.log('🏠 Navegando a:', targetRoute)
          navigate(targetRoute, { replace: true })
          // Forzar recarga de la página para limpiar estado completamente
          window.location.reload()
        }, 200)
      } else {
        console.log('🔄 No hay usuario, navegando directamente')
        navigate(targetRoute, { replace: true })
      }
    } catch (error) {
      console.error('💥 Error en cambio de contexto:', error)
      // Como fallback, hacer navegación directa
      window.location.href = targetRoute
    }
  }

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Plataforma de mini bodegas</h3>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <Facebook className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <MessageCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Enlaces útiles</h4>
            <ul className="space-y-2 text-gray-600">
              {isProveedor ? (
                <li>
                  <button 
                    onClick={() => handleContextSwitch("/")}
                    className="hover:text-gray-900 text-left"
                  >
                    {user ? "Ir a sección de usuarios" : "Ir a sección de usuarios"}
                  </button>
                </li>
              ) : (
                <li>
                  <button 
                    onClick={() => handleContextSwitch("/home-proveedor")}
                    className="hover:text-gray-900 text-left"
                  >
                    {user ? "Ir a sección de proveedores" : "Ir a sección de proveedores"}
                  </button>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Contacto</h4>
            <p className="text-gray-600">minibodegas@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
