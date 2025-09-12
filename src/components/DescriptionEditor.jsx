import { useState, useRef } from "react";
import { Pencil, Image } from "lucide-react";

const CARACTERISTICAS_DEFAULT = [
  "Vigilancia 24/7",
  "Acceso privado",
  "Seguro incluido",
  "Estanterías disponibles",
  "Control de clima"
];

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
  const [caracteristicasSeleccionadas, setCaracteristicasSeleccionadas] = useState([]);
  const fileInputRef = useRef(null);

  // Maneja la carga de imágenes y genera previews
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    if (onImagenesChange) onImagenesChange(files);
  };

  // Click en el icono de imagen para abrir el input
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Selección de características por default
  const handleToggleCaracteristica = (car) => {
    let nuevas;
    if (caracteristicasSeleccionadas.includes(car)) {
      nuevas = caracteristicasSeleccionadas.filter(c => c !== car);
    } else {
      nuevas = [...caracteristicasSeleccionadas, car];
    }
    setCaracteristicasSeleccionadas(nuevas);
    if (onCaracteristicasChange) onCaracteristicasChange(nuevas.join(", "));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-xl">
      {/* Título y descripción en dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Título a la izquierda con fondo blanco */}
        <div className="bg-white rounded-xl p-6 flex flex-col justify-center items-start h-full">
          <div className="flex items-center mb-2">
            {editEmpresa ? (
              <input
                type="text"
                value={empresa}
                onChange={e => onEmpresaChange(e.target.value)}
                className="text-3xl font-bold w-full bg-white text-[#2C3A61] text-left"
                onBlur={() => setEditEmpresa(false)}
                autoFocus
                style={{ backgroundColor: "#fff", color: "#2C3A61" }}
              />
            ) : (
              <span
                className="text-3xl font-bold text-[#2C3A61] text-left cursor-pointer"
                onClick={() => setEditEmpresa(true)}
              >
                {empresa || "Nombre de tu empresa"}
              </span>
            )}
          </div>
          <div className="flex items-center">
            {editDireccion ? (
              <input
                type="text"
                value={direccion}
                onChange={e => onDireccionChange(e.target.value)}
                className="text-base w-full bg-white text-[#2C3A61] text-left"
                onBlur={() => setEditDireccion(false)}
                autoFocus
                style={{ backgroundColor: "#fff", color: "#2C3A61" }}
              />
            ) : (
              <span
                className="text-base text-[#2C3A61] text-left cursor-pointer"
                onClick={() => setEditDireccion(true)}
              >
                {direccion || "Ingresa la dirección de tus minis bodegas"}
              </span>
            )}
          </div>
        </div>
        {/* Descripción a la derecha */}
        <div className="bg-[#4B799B] rounded-xl p-6 flex flex-col justify-center h-full">
          <span className="font-semibold text-white text-base mb-2">Descripción</span>
          <div className="text-white">
            {editDescripcion ? (
              <textarea
                value={descripcion}
                onChange={e => onDescripcionChange(e.target.value)}
                className="w-full p-2 rounded bg-white text-[#2C3A61] mt-2"
                rows={4}
                style={{ backgroundColor: "#fff", color: "#2C3A61" }}
                onBlur={() => setEditDescripcion(false)}
                autoFocus
              />
            ) : (
              <span
                className="cursor-pointer"
                onClick={() => setEditDescripcion(true)}
              >
                {descripcion
                  ? descripcion
                  : "Ejemplo: Nuestra mini bodega cuenta con seguridad 24/7, acceso privado y excelente ubicación. Ideal para guardar tus pertenencias de forma segura y cómoda."}
              </span>
            )}
          </div>
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
          </div>
          {/* Selección de características por default */}
          {!editCaracteristicas ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {CARACTERISTICAS_DEFAULT.map(car => (
                  <button
                    key={car}
                    type="button"
                    className={`px-3 py-1 rounded-full border ${
                      caracteristicasSeleccionadas.includes(car)
                        ? "bg-[#4B799B] text-white border-[#4B799B]"
                        : "bg-white text-[#4B799B] border-[#4B799B]"
                    } text-sm`}
                    onClick={() => handleToggleCaracteristica(car)}
                  >
                    {car}
                  </button>
                ))}
              </div>
              <span
                className="text-[#4B799B] block mt-2 cursor-pointer"
                onClick={() => setEditCaracteristicas(true)}
              >
                {caracteristicasSeleccionadas.length > 0
                  ? caracteristicasSeleccionadas.join(", ")
                  : "Selecciona o escribe las características de tus minis bodegas"}
              </span>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}