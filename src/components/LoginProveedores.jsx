import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link } from "react-router-dom"

export function LoginProveedores() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    
    Email: "",
    Celular: "",
    Contraseña: ""

  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
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
          <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Escribe tu email"
                      value={formData.Email}
                      onChange={(e) => handleInputChange("Email", e.target.value)}
                      className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                                bg-white text-gray-900 
                                focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                    />
                  </div>

                  {/* Celular */}
                  <div className="space-y-2">
                    <label htmlFor="celular" className="text-gray-700 font-medium">
                      Celular
                    </label>
                    <input
                      id="celular"
                      type="tel"
                      placeholder="Escribe tu número de celular"
                      value={formData.Celular}
                      onChange={(e) => handleInputChange("Celular", e.target.value)}
                      className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                                bg-white text-gray-900 
                                focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
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
                  placeholder="Escribe tu contraseña"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-[#4B799B] hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Regístrate
            </button>

            {/* Enlace */}
            <div className="text-center">
              <Link to="/register-proveedores" className="text-[#4B799B] hover:underline font-medium">
                Aun no tengo cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}