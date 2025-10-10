// components/FormularioEmpresa/InformacionRepresentante.jsx
export function InformacionRepresentante({ formData, loading, handleInputChange }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Información del Representante Legal</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Nombre del representante legal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nombreRepresentante}
            onChange={(e) => handleInputChange('nombreRepresentante', e.target.value)}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Nombre completo del representante"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Celular <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.celular}
            onChange={(e) => handleInputChange('celular', e.target.value)}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white text-black
                      focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
            placeholder="Número de celular"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}