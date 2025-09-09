import { useState, useRef } from "react";
import { Pencil, Image } from "lucide-react";

export function DescriptionEditor({
  empresa,
  onEmpresaChange,
  direccion,
  onDireccionChange,
  descripcion,
  onDescripcionChange,
  caracteristicas,
  onCaracteristicasChange,
  imagenes: initialImagenes = [],
  onImagenesChange
}) {
  const [editEmpresa, setEditEmpresa] = useState(false);
  const [editDireccion, setEditDireccion] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState(false);
  const [editCaracteristicas, setEditCaracteristicas] = useState(false);
  const [imagenes, setImagenes] = useState(initialImagenes);
  const fileInputRef = useRef(null);

  // Maneja la carga de imágenes y genera previews
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files); // Solo guarda la última imagen subida
    if (onImagenesChange) onImagenesChange(files);
  };

  // Click en el icono de imagen para abrir el input
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-xl ">
      {/* Título y dirección */}
      <div className="bg-[#F7F8FA] rounded-xl p-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-2">
            {editEmpresa ? (
              <input
                type="text"
                value={empresa}
                onChange={e => onEmpresaChange(e.target.value)}
                className="text-center text-3xl font-bold w-full bg-white text-[#2C3A61]"
                onBlur={() => setEditEmpresa(false)}
                autoFocus
                style={{ backgroundColor: "#fff", color: "#2C3A61" }}
              />
            ) : (
              <>
                <span className="text-3xl font-bold text-[#2C3A61]">
                  {empresa || "Nombre de tu empresa"}
                </span>
                <button type="button" onClick={() => setEditEmpresa(true)}>
                  <Pencil className="ml-2 h-5 w-5 text-[#2C3A61]" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center">
            {editDireccion ? (
              <input
                type="text"
                value={direccion}
                onChange={e => onDireccionChange(e.target.value)}
                className="text-center text-base w-full bg-white text-[#2C3A61]"
                onBlur={() => setEditDireccion(false)}
                autoFocus
                style={{ backgroundColor: "#fff", color: "#2C3A61" }}
              />
            ) : (
              <>
                <span className="text-base text-[#2C3A61]">
                  {direccion || "Ingresa la dirección de tus minis bodegas"}
                </span>
                <button type="button" onClick={() => setEditDireccion(true)}>
                  <Pencil className="ml-2 h-4 w-4 text-[#2C3A61]" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-[#4B799B] rounded-xl p-5 mb-4 flex flex-col relative">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-semibold text-white text-base">Descripción</span>
            <div className="text-white mt-1">
              {editDescripcion ? (
                <textarea
                  value={descripcion}
                  onChange={e => onDescripcionChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] mt-2"
                  rows={3}
                  style={{ backgroundColor: "#fff", color: "#2C3A61" }}
                  onBlur={() => setEditDescripcion(false)}
                  autoFocus
                />
              ) : (
                <span>
                  {descripcion
                    ? descripcion
                    : "Ejemplo: Nuestra mini bodega cuenta con seguridad 24/7, acceso privado y excelente ubicación. Ideal para guardar tus pertenencias de forma segura y cómoda."}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="ml-2 mt-1"
            onClick={() => setEditDescripcion(true)}
            title="Editar descripción"
          >
            <Pencil className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Cards de abajo */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Imágenes */}
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <Image
              className="h-10 w-10 text-[#2C3A61] mb-2 cursor-pointer"
              onClick={handleIconClick}
            />
            <span className="text-[#2C3A61] font-semibold mb-1">Sube imágenes de tu bodega</span>
          </div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleImagenesChange}
          />
          {/* Previsualización de imágenes agregadas */}
          {imagenes && imagenes.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {imagenes.map((img, i) => (
                <div key={i} className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${i}`}
                    className="object-cover w-20 h-20 rounded border mb-1"
                  />
                  <span className="text-xs text-[#2C3A61] max-w-[80px] truncate" title={img.name}>
                    {img.name}
                  </span>
                </div>
              ))}
            </div>
          )}
          {imagenes && imagenes.length > 0 && (
            <div className="mt-2 text-sm text-[#2C3A61] font-medium">
              {imagenes.length === 1
                ? "1 imagen agregada"
                : `${imagenes.length} imágenes agregadas`}
            </div>
          )}
        </div>
        {/* Características */}
        <div className="bg-white rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#2C3A61] font-semibold">Características</span>
            <button type="button" onClick={() => setEditCaracteristicas(true)}>
              <Pencil className="h-5 w-5 text-[#2C3A61]" />
            </button>
          </div>
          {editCaracteristicas ? (
            <textarea
              value={caracteristicas}
              onChange={e => onCaracteristicasChange(e.target.value)}
              placeholder="Ingresa las características de tus minis bodegas"
              className="w-full p-2 rounded bg-white text-[#2C3A61] border"
              rows={3}
              style={{ backgroundColor: "#fff", color: "#2C3A61" }}
              onBlur={() => setEditCaracteristicas(false)}
              autoFocus
            />
          ) : (
            <span className="text-[#4B799B]">
              {caracteristicas || "Ingresa las características de tus minis bodegas"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}