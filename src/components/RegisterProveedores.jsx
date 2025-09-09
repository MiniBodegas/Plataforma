import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link } from "react-router-dom"

export function RegisterProveedores() {
  const [showPassword, setShowPassword] = useState(false)
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
        <div className="relative h-full hidden lg:flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1600009723489-027195d6b3d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Ym94ZXN8ZW58MHwxfDB8fHwy"
            alt="Cajas de cartón apiladas para almacenamiento"
            className="max-w-s mx-auto border rounded-xl"
          />
        </div>

        {/* Formulario derecha */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Crear cuenta
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nombre */}
            <div className="space-y-2">
                <label htmlFor="Nombre de la empresa" className="text-gray-700 font-medium">
                    Nombre de la empresa
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="Nombre de la empresa"
                    value={formData.nombreDeLaEmpresa}
                    onChange={(e) => handleInputChange("nombreDeLaEmpresa", e.target.value)}
                    className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                />
                </div>

            {/* NIT*/}
            <div className="space-y-2">
              <label htmlFor="NIT" className="text-gray-700 font-medium">
                NIT
              </label>
              <input
                id="NIT"
                type="Text"
                placeholder="Escribe tu NIT"
                value={formData.NIT}
                onChange={(e) => handleInputChange("NIT", e.target.value)}
                className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
              />
            </div>

             {/* Nombre del Representante */}
            <div className="space-y-2">
                <label htmlFor="Nombre del Representante" className="text-gray-700 font-medium">
                    Nombre del Representante
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="Nombre del Representante"
                    value={formData.NombreDelRepresentante}
                    onChange={(e) => handleInputChange("NombreDelRepresentante", e.target.value)}
                    className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                />
                </div>

                {/* Tipo de Documento */}
                    <div className="space-y-2">
                    <label htmlFor="tipoDocumento" className="text-gray-700 font-medium">
                        Tipo de Documento
                    </label>
                    <select
                        id="tipoDocumento"
                        value={formData.TipoDeDocumento}
                        onChange={(e) => handleInputChange("TipoDeDocumento", e.target.value)}
                        className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                                bg-white text-gray-900 
                                focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="NIT">NIT</option>
                        <option value="PAS">Pasaporte</option>
                    </select>
                    </div>

                  {/* Numero de documento*/}
                  <div className="space-y-2">
                    <label htmlFor="NIT" className="text-gray-700 font-medium">
                      Numero de Documento
                    </label>
                    <input
                      id="NIT"
                      type="Text"
                      placeholder="Escribe tu Numero de documento"
                      value={formData.NumeroDeDocumento}
                      onChange={(e) => handleInputChange("NumeroDeDocumento", e.target.value)}
                      className="w-full h-12 rounded-2xl border border-gray-300 px-4 
                                  bg-white text-gray-900 
                                  focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                    />
                  </div>

                    {/* CamaraDeComercio */}
                    <div className="space-y-2">
                      <label htmlFor="Camara de comercio" className="text-gray-700 font-medium">
                        Cámara de Comercio
                      </label>
                      <input
                        id="CamaraDeComercio"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInputChange("CamaraDeComercio", e.target.files[0])}
                        className="w-full h-12 rounded-2xl border border-gray-300 px-4 py-2
                                  bg-white text-gray-900 cursor-pointer
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-2xl file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-[#4B799B] file:text-white
                                  hover:file:bg-[#3b5f7d]
                                  focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                      />
                    </div>

                  {/* RUT */}
                    {/* Input para subir imagen */}
                    <div className="space-y-2">
                      <label htmlFor="RUT" className="text-gray-700 font-medium">
                        RUT
                      </label>
                      <input
                        id="RUT"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInputChange("RUT", e.target.files[0])}
                        className="w-full h-12 rounded-2xl border border-gray-300 px-4 py-2
                                  bg-white text-gray-900 cursor-pointer
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-2xl file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-[#4B799B] file:text-white
                                  hover:file:bg-[#3b5f7d]
                                  focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                      />
                    </div>
                 

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
              <Link to="/login-proveedores" className="text-[#4B799B] hover:underline font-medium">
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}