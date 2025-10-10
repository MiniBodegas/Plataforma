// components/FormularioEmpresa/DocumentosLegales.jsx
import { DocumentoEstado } from './DocumentoEstado';

export function DocumentosLegales({ 
  archivos, 
  archivosExistentes, 
  empresaExistente, 
  loading, 
  uploadProgress, 
  handleFileChange 
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">
        Documentos Legales <span className="text-red-500">*</span>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Los siguientes documentos son obligatorios para completar tu perfil de proveedor:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cámara de Comercio */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Cámara de Comercio <span className="text-red-500">*</span>
          </label>
          {archivosExistentes.camaraComercio ? (
            <div>
              <DocumentoEstado 
                tipo="camara-comercio" 
                archivo={archivosExistentes.camaraComercio} 
                empresaId={empresaExistente.id} 
              />
              <div className="mt-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('camaraComercio', e.target.files[0])}
                  className="w-full text-sm bg-white text-black"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Subir nuevo archivo para reemplazar</p>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('camaraComercio', e.target.files[0])}
                className="w-full h-12 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black
                          focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG o PNG (máx. 5MB) - Obligatorio</p>
            </div>
          )}
          {uploadProgress.camaraComercio !== undefined && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#4B799B] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.camaraComercio}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Subiendo... {uploadProgress.camaraComercio}%</p>
            </div>
          )}
        </div>

        {/* RUT */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            RUT <span className="text-red-500">*</span>
          </label>
          {archivosExistentes.rut ? (
            <div>
              <DocumentoEstado 
                tipo="rut" 
                archivo={archivosExistentes.rut} 
                empresaId={empresaExistente.id} 
              />
              <div className="mt-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('rut', e.target.files[0])}
                  className="w-full text-sm bg-white text-black"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Subir nuevo archivo para reemplazar</p>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('rut', e.target.files[0])}
                className="w-full h-12 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black
                          focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG o PNG (máx. 5MB) - Obligatorio</p>
            </div>
          )}
          {uploadProgress.rut !== undefined && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#4B799B] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.rut}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Subiendo... {uploadProgress.rut}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}