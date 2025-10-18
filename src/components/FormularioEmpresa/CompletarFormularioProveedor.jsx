import { useEffect } from "react";
import { useCompletarFormulario } from "../../hooks/useCompletarFormulario";
import { InformacionEmpresa, DocumentosLegales } from "../index";

export function CompletarFormularioProveedor() {
  const {
    formData,
    archivos,
    archivosExistentes,
    loading,
    uploadProgress,
    error,
    empresaExistente,
    user,
    handleSubmit,
    handleInputChange,
    handleFileChange
  } = useCompletarFormulario();

  // Elimina este useEffect:
  // useEffect(() => {
  //   if (empresaExistente) {
  //     setFormData({
  //       ...empresaExistente,
  //       correo_contacto: empresaExistente.correo_contacto || "",
  //       // ...otros campos...
  //     });
  //   }
  // }, [empresaExistente]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-[#2C3A61] text-center mb-6">
          {empresaExistente ? 'Actualizar Información de la Empresa' : 'Completar Información de la Empresa'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Para continuar como proveedor, necesitamos la información completa de tu empresa.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* InformacionEmpresa SIN nombre legal */}
          <InformacionEmpresa 
            formData={formData}
            user={user}
            loading={loading}
            handleInputChange={handleInputChange}
            hideNombreLegal={true}
          />

          {/* Input obligatorio para correo de contacto distinto al de registro */}
          <div className="mb-6">
            <label htmlFor="correo_contacto" className="block text-sm font-medium text-gray-700 mb-2">
              Correo de contacto de la empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="correo_contacto"
              name="correo_contacto"
              required
              value={formData.correo_contacto || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              placeholder="ejemplo@empresa.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este correo debe ser diferente al que usaste para registrarte como usuario.
            </p>
          </div>

          <DocumentosLegales 
            archivos={archivos}
            archivosExistentes={archivosExistentes}
            empresaExistente={empresaExistente}
            loading={loading}
            uploadProgress={uploadProgress}
            handleFileChange={handleFileChange}
          />

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
              empresaExistente ? 'Actualizar información' : 'Guardar información'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}