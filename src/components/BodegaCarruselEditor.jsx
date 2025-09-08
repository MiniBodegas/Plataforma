import { useState } from "react";
import { Pencil, Image, X } from "lucide-react";

export function BodegaCarruselEditor({
  empresa,
  onEmpresaChange,
  imagenes,
  onImagenesChange
}) {
  const [editEmpresa, setEditEmpresa] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Maneja la carga de imágenes y genera previews
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    onImagenesChange([...imagenes, ...files]);
    setActiveIndex(imagenes.length); // Muestra la primera nueva imagen
  };

  // Eliminar imagen
  const handleRemoveImage = (idx) => {
    const nuevas = imagenes.filter((_, i) => i !== idx);
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

  return (
    <div className="border-2 border-blue-300 rounded-xl mb-8 mx-auto" style={{ maxWidth: 520 }}>
      <div className="bg-[#E9E9E9] rounded-xl flex flex-col justify-center items-center relative" style={{ height: 260 }}>
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
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full w-full">
            <Image className="h-12 w-12 text-[#2C3A61]" />
            <span className="text-[#2C3A61] mt-2 font-medium">Sube imágenes de tu mini bodega</span>
          </div>
        )}
        <input
          type="file"
          multiple
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          style={{ width: "80%", backgroundColor: "#fff", color: "#2C3A61" }}
          onChange={handleImagenesChange}
        />
        {/* Botones de navegación */}
        {imagenes && imagenes.length > 1 && (
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
        {/* Previsualización miniaturas */}
        {imagenes && imagenes.length > 1 && (
          <div className="flex gap-2 mt-4">
            {imagenes.map((img, i) => (
              <button
                key={i}
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
            ))}
          </div>
        )}
        {/* Previsualización de todas las imágenes (galería) */}
        {imagenes && imagenes.length > 1 && (
          <div className="flex gap-2 mt-6 flex-wrap justify-center">
            {imagenes.map((img, i) => (
              <div key={i} className="border rounded w-24 h-24 overflow-hidden">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`galeria-${i}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}