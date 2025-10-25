// components/FormularioEmpresa/InformacionEmpresa.jsx
export function InformacionEmpresa({ formData, user, loading, handleInputChange }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Información de la Empresa</h3>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Nombre de la empresa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombreEmpresa"
            value={formData.nombreEmpresa ?? ""}
            onChange={handleInputChange}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Ingresa el nombre de tu empresa"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad ?? ""}
            onChange={handleInputChange}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Ciudad donde opera la empresa"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion ?? ""}
            onChange={handleInputChange}
            rows="3"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Breve descripción de tu empresa (obligatorio)"
            disabled={loading}
          />
        </div>

         <div>
          <label className="block text-gray-700 font-medium mb-2">
            Dirección principal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="direccionPrincipal"
            value={formData.direccionPrincipal ?? ""}
            onChange={handleInputChange}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Dirección principal de la empresa (obligatorio)"
            disabled={loading}
          />
        </div>

         {/* Correo de contacto */}
        <div>
          <label htmlFor="correo_contacto" className="block text-sm font-medium text-gray-700 mb-2">
            Correo de contacto
          </label>
          <input
            type="email"
            id="correo_contacto"
            name="correo_contacto"
            value={formData.correo_contacto || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            placeholder="ejemplo@correo.com"
            disabled={loading}
          />
        </div>

        {/* Sitio web */}
        <div>
          <label htmlFor="sitio_web" className="block text-sm font-medium text-gray-700 mb-2">
            Sitio web
          </label>
          <input
            type="url"
            id="sitio_web"
            name="sitio_web"
            value={formData.sitio_web || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            placeholder="https://tusitio.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Email de la empresa
          </label>
          <input
            type="email"
            value={user?.email || ""}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-gray-100 text-gray-600 cursor-not-allowed"
            disabled={true}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Este email viene de tu cuenta y no se puede modificar
          </p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Teléfono de la empresa
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono ?? ""}
            onChange={handleInputChange}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Teléfono fijo de la empresa"
            disabled={loading}
          />
        </div>

       
      </div>
    </div>
  );
}