// components/DocumentosLegales.jsx
export function DocumentosLegales({
  archivos,
  archivosExistentes,
  empresaExistente,
  loading,
  uploadProgress,
  handleFileChange,
}) {
  const Row = ({ label, name }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="file"
        onChange={(e) => handleFileChange(name, e.target.files?.[0])}
        disabled={loading}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#4B799B] file:text-white hover:file:bg-blue-700"
      />
      {archivos[name]?.name && (
        <p className="text-xs text-gray-500 mt-1">
          Seleccionado: {archivos[name].name}
        </p>
      )}
      {typeof uploadProgress[name] === "number" && (
        <div className="w-full bg-gray-200 rounded h-2 mt-2">
          <div
            className="bg-[#4B799B] h-2 rounded"
            style={{ width: `${uploadProgress[name]}%` }}
          />
        </div>
      )}
      {empresaExistente && archivosExistentes[name]?.name && (
        <p className="text-xs text-gray-500 mt-2">
          Documento existente:{" "}
          <span className="underline">{archivosExistentes[name].name}</span>
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-2">
        Documentos legales
      </h3>
      <Row label="Cámara de Comercio" name="camaraComercio" />
      <Row label="RUT" name="rut" />
    </div>
  );
}
