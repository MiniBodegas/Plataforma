import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

export function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await signUp(formData.email, formData.password)

      if (error) {
        setError(error.message)
      } else {
        // Guarda el perfil en la tabla usuarios/profiles sin nombre
        const userId = data?.user?.id || data?.id
        if (userId) {
          await supabase.from('usuarios').upsert([
            {
              id: userId,
              nombre: null,
              foto_url: null
            }
          ])
        }

        setMessage('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Imagen izquierda */}
        <div className="relative h-full hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1600009723489-027195d6b3d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Ym94ZXN8ZW58MHwxfDB8fHwy"
            alt="Cajas de cartón apiladas para almacenamiento"
            className="w-full max-h-100 object-contain rounded-lg"
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
        </div>

        {/* Formulario derecha */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Crear cuenta
          </h2>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Correo */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-700 font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="Escribe tu correo"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                          bg-white text-gray-900 
                          focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-gray-700 font-medium">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Escribe tu contraseña (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 pr-12
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-[#4B799B] hover:bg-blue-700 text-white font-semibold transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Regístrate'
              )}
            </button>

            {/* Enlace */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-[#4B799B] hover:underline font-medium"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}