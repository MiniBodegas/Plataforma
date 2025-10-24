import { useCompletarFormulario } from "../../hooks/useCompletarFormulario";
import { useNavigate } from "react-router-dom";
import { InformacionEmpresa } from "./InformacionEmpresa";

export function CompletarFormularioProveedor() {
  const {
    formData,
    loading,
    error,
    user,
    handleSubmit,
    handleInputChange
  } = useCompletarFormulario();

  const navigate = useNavigate();

  const onSubmit = (e) => {
    handleSubmit(e);
    navigate('/home-proveedor');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-[#2C3A61] text-center mb-6">
          {formData?.nombre ? 'Actualizar Información de la Empresa' : 'Completar Información de la Empresa'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Para continuar como proveedor, necesitamos la información completa de tu empresa.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Usa el componente modularizado para los datos principales */}
          <InformacionEmpresa
            formData={formData}
            user={user}
            loading={loading}
            handleInputChange={handleInputChange}
          />

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

          {/* Descripción corta */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción corta
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              placeholder="Describe brevemente tu empresa"
              rows={3}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#4B799B] hover:bg-blue-700 text-white font-semibold 
                      rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </div>
            ) : (
              formData?.nombre ? 'Actualizar información' : 'Guardar información'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}