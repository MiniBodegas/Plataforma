import { useState, useRef } from "react";
import { Pencil, Image, X } from "lucide-react";

export function BodegaCarruselEditor({
  empresa,
  onEmpresaChange,
  imagenes: initialImagenes = [], // <-- valor por defecto, nunca undefined
  onImagenesChange
}) {
  const [editEmpresa, setEditEmpresa] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef(null);
  const [imagenes, setImagenes] = useState(initialImagenes); // Estado para las imágenes

  // Maneja la carga de imágenes y genera previews
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = [...(imagenes || []), ...files]; // <-- asegura que sea array
    setImagenes(nuevasImagenes);
    onImagenesChange(nuevasImagenes);
    setActiveIndex(imagenes ? imagenes.length : 0);
  };

  // Eliminar imagen
  const handleRemoveImage = (idx) => {
    const nuevas = imagenes.filter((_, i) => i !== idx);
    setImagenes(nuevas);
    onImagenesChange(nuevas);
    setActiveIndex((prev) => prev > 0 ? prev - 1 : 0);
  };

  // Navegación del carrusel
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setActiveIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  // Click en el icono de imagen para abrir el input
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  console.log(imagenes);

  return (
    <div className="border-2 border-gray-590 rounded-xl mb-8 mx-auto max-w-7xl pb-16 min-h-[150px] flex flex-col justify-between">
      <div className="bg-[#E9E9E9] min-h-[350px] rounded-xl flex flex-col justify-center items-center relative" style={{ height: 260 }}>
        {/* Previsualización de imagen */}
        {imagenes && imagenes.length > 0 ? (
          <>
            <img
              src={URL.createObjectURL(imagenes[activeIndex])}
              alt={`preview-${activeIndex}`}
              className="object-contain h-full w-full rounded-xl"
              style={{ maxHeight: 220, maxWidth: "100%" }}
            />
            {/* Botón eliminar imagen */}
            <button
              type="button"
              className="absolute top-4 right-4 bg-white/80 rounded-full p-1 shadow"
              onClick={() => handleRemoveImage(activeIndex)}
              title="Eliminar imagen"
            >
              <X className="h-4 w-4 text-[#2C3A61]" />
            </button>
            {/* Botones de navegación */}
            {imagenes.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
                  onClick={handlePrev}
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
                  onClick={handleNext}
                >
                  {">"}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full w-full cursor-pointer" onClick={handleIconClick}>
            <Image className="h-12 w-12 text-[#2C3A61]" />
            <span className="text-[#2C3A61] mt-2 font-medium">Sube imágenes de tu mini bodega</span>
          </div>
        )}
        {/* Input oculto para seleccionar archivos */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleImagenesChange}
        />
      </div>
      <div className="bg-white rounded-b-xl px-6 py-6 flex flex-col items-center">
        {/* Mensaje de cantidad de imágenes agregadas */}
        {imagenes && imagenes.length > 0 && (
          <div className="mb-2 text-sm text-[#2C3A61] font-medium">
            {imagenes.length === 1
              ? "1 imagen agregada"
              : `${imagenes.length} imágenes agregadas`}
          </div>
        )}
        {/* Miniaturas con nombre de archivo */}
        {imagenes && imagenes.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {imagenes.map((img, i) => (
              <div key={i} className="flex flex-col items-center">
                <button
                  type="button"
                  className={`border rounded w-10 h-10 overflow-hidden ${i === activeIndex ? "border-[#4B799B]" : "border-gray-300"}`}
                  onClick={() => setActiveIndex(i)}
                  title={`Imagen ${i + 1}`}
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`mini-${i}`}
                    className="object-cover w-full h-full"
                  />
                </button>
                <span className="text-xs text-[#2C3A61] mt-1 max-w-[80px] truncate" title={img.name}>
                  {img.name}
                </span>
              </div>
            ))}
          </div>
        )}
        {editEmpresa ? (
          <input
            type="text"
            value={empresa}
            onChange={e => onEmpresaChange(e.target.value)}
            placeholder="Ingresa el nombre de tu empresa"
            className="text-center text-xl font-medium w-full border-b border-gray-300 outline-none mb-2 bg-white text-[#2C3A61]"
            onBlur={() => setEditEmpresa(false)}
            autoFocus
            style={{ backgroundColor: "#fff", color: "#2C3A61" }}
          />
        ) : (
          <div className="flex items-center justify-center w-full">
            <span className="text-[#2C3A61] text-xl font-medium flex-1">
              {empresa || "Ingresa el nombre de tu empresa"}
            </span>
            <button type="button" onClick={() => setEditEmpresa(true)}>
              <Pencil className="ml-2 h-5 w-5 text-[#2C3A61]" />
            </button>
          </div>
        )}
        {/* Indicadores de carrusel */}
        <div className="flex gap-2 mt-4">
          {imagenes && imagenes.length > 0
            ? imagenes.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === activeIndex ? "bg-[#2C3A61]" : "bg-[#E9E9E9]"}`}
                />
              ))
            : [0, 1, 2, 3, 4].map(i => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === 0 ? "bg-[#2C3A61]" : "bg-[#E9E9E9]"}`}
                />
              ))}
        </div>
      </div>
    </div>
  );
}