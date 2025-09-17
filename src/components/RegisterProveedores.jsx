import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function RegisterProveedores() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    nombreDeLaEmpresa: "",
    NIT: "",
    NombreDelRepresentante: "",
    ApellidoDelRepresentante: "",
    TipoDeDocumento: "",
    NumeroDeDocumento: "",
    CamaraDeComercio: "",
    RUT: "",
    Email: "",
    Celular: "",
    Contraseña: ""
  })

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones mejoradas
    if (!formData.nombreDeLaEmpresa || !formData.NIT || !formData.Email || !formData.Contraseña) {
      setError('Por favor completa todos los campos obligatorios (*)')
      return
    }

    if (formData.Contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.Email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    // Validar NIT (solo números y guiones)
    const nitRegex = /^[0-9-]+$/
    if (!nitRegex.test(formData.NIT)) {
      setError('El NIT debe contener solo números y guiones')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Preparar metadata
      const userMetadata = {
        full_name: `${formData.NombreDelRepresentante} ${formData.ApellidoDelRepresentante}`,
        empresa: formData.nombreDeLaEmpresa,
        nit: formData.NIT,
        tipo_documento: formData.TipoDeDocumento,
        numero_documento: formData.NumeroDeDocumento,
        celular: formData.Celular,
        user_type: 'proveedor'
      }

      // Agregar redirectTo específico para proveedores
      const { data, error } = await signUp(formData.Email, formData.Contraseña, userMetadata, {
        redirectTo: `${window.location.origin}/home-proveedor?confirmed=true`
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('¡Cuenta de proveedor creada exitosamente! Revisa tu correo para confirmar tu cuenta.')
        
        setTimeout(() => {
          navigate('/login-proveedores')
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
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Imagen izquierda */}
        <div className="relative h-full hidden lg:flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1600009723489-027195d6b3d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Ym94ZXN8ZW58MHwxfDB8fHwy"
            alt="Cajas de cartón apiladas para almacenamiento"
            className="max-w-s mx-auto border rounded-xl"
          />
        </div>

        {/* Formulario derecha */}
        <div className="p-8 md:p-12 max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Registro de Proveedores
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

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre de la empresa */}
            <div className="space-y-2">
              <label htmlFor="nombreEmpresa" className="text-gray-700 font-medium">
                Nombre de la empresa *
              </label>
              <input
                id="nombreEmpresa"
                type="text"
                placeholder="Nombre de la empresa"
                value={formData.nombreDeLaEmpresa}
                onChange={(e) => handleInputChange("nombreDeLaEmpresa", e.target.value)}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                          bg-white text-gray-900 
                          focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* NIT */}
            <div className="space-y-2">
              <label htmlFor="NIT" className="text-gray-700 font-medium">
                NIT *
              </label>
              <input
                id="NIT"
                type="text"
                placeholder="Escribe el NIT"
                value={formData.NIT}
                onChange={(e) => handleInputChange("NIT", e.target.value)}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                          bg-white text-gray-900 
                          focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Nombres del representante en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nombreRepresentante" className="text-gray-700 font-medium">
                  Nombre del Representante
                </label>
                <input
                  id="nombreRepresentante"
                  type="text"
                  placeholder="Nombre"
                  value={formData.NombreDelRepresentante}
                  onChange={(e) => handleInputChange("NombreDelRepresentante", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="apellidoRepresentante" className="text-gray-700 font-medium">
                  Apellido del Representante
                </label>
                <input
                  id="apellidoRepresentante"
                  type="text"
                  placeholder="Apellido"
                  value={formData.ApellidoDelRepresentante}
                  onChange={(e) => handleInputChange("ApellidoDelRepresentante", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Tipo y número de documento en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tipoDocumento" className="text-gray-700 font-medium">
                  Tipo de Documento
                </label>
                <select
                  id="tipoDocumento"
                  value={formData.TipoDeDocumento}
                  onChange={(e) => handleInputChange("TipoDeDocumento", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="numeroDocumento" className="text-gray-700 font-medium">
                  Número de Documento
                </label>
                <input
                  id="numeroDocumento"
                  type="text"
                  placeholder="Número de documento"
                  value={formData.NumeroDeDocumento}
                  onChange={(e) => handleInputChange("NumeroDeDocumento", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Documentos en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="camaraComercio" className="text-gray-700 font-medium">
                  Cámara de Comercio
                </label>
                <input
                  id="camaraComercio"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    // Por ahora, solo mostrar el nombre del archivo
                    if (e.target.files[0]) {
                      console.log('Archivo seleccionado:', e.target.files[0].name)
                    }
                    handleInputChange("CamaraDeComercio", e.target.files[0])
                  }}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 py-2
                            bg-white text-gray-900 cursor-pointer
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-2xl file:border-0
                            file:text-sm file:font-semibold
                            file:bg-[#4B799B] file:text-white
                            hover:file:bg-[#3b5f7d]
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Formatos permitidos: PDF, JPG, PNG</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="RUT" className="text-gray-700 font-medium">
                  RUT
                </label>
                <input
                  id="RUT"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleInputChange("RUT", e.target.files[0])}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 py-2
                            bg-white text-gray-900 cursor-pointer
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-2xl file:border-0
                            file:text-sm file:font-semibold
                            file:bg-[#4B799B] file:text-white
                            hover:file:bg-[#3b5f7d]
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email y celular en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-700 font-medium">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.Email}
                  onChange={(e) => handleInputChange("Email", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="celular" className="text-gray-700 font-medium">
                  Celular
                </label>
                <input
                  id="celular"
                  type="tel"
                  placeholder="300 123 4567"
                  value={formData.Celular}
                  onChange={(e) => handleInputChange("Celular", e.target.value)}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-gray-700 font-medium">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.Contraseña}
                  onChange={(e) => handleInputChange("Contraseña", e.target.value)}
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
                'Registrar Proveedor'
              )}
            </button>

            {/* Enlaces */}
            <div className="text-center space-y-2">
              <Link 
                to="/login-proveedores" 
                className="block text-[#4B799B] hover:underline font-medium"
              >
                ¿Ya tienes cuenta como proveedor? Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}