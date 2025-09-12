import { useState } from "react";
import { Image, RotateCcw } from "lucide-react";
import './CardBodegas.css';

export function CardBodegas({
  metraje,
  descripcion,
  contenido,
  imagen,
  onImagenChange,
  onMetrajeChange,
  onDescripcionChange,
  onContenidoChange,
  direccion,
  onDireccionChange
}) {
  const [editMetraje, setEditMetraje] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState(false);
  const [editContenido, setEditContenido] = useState(false);
  const [editDireccion, setEditDireccion] = useState(false);
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={`flip-card w-72 h-[420px]${flipped ? " flipped" : ""}`}>
      <div className="flip-inner">
        {/* Cara frontal */}
        <div className="flip-front bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col items-center w-72 h-[420px]">
          <div className="bg-[#E9E9E9] rounded-xl w-full h-36 flex flex-col justify-center items-center mb-4">
            {imagen ? (
              <img
                src={typeof imagen === "string" ? imagen : URL.createObjectURL(imagen)}
                alt="comparativa"
                className="object-contain h-full w-full rounded-xl"
              />
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Image className="h-10 w-10 text-[#2C3A61]" />
                <span className="text-[#2C3A61] mt-2 text-sm text-center">Sube una imagen de tu mini bodega</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => onImagenChange && onImagenChange(e.target.files[0])}
                />
              </label>
            )}
          </div>
          <div className="w-full text-center">
            {/* Metraje editable */}
            <div className="flex items-center justify-center mb-2">
              {editMetraje ? (
                <input
                  type="text"
                  value={metraje}
                  onChange={e => onMetrajeChange && onMetrajeChange(e.target.value)}
                  className="font-bold text-[#2C3A61] text-lg w-full bg-white"
                  onBlur={() => setEditMetraje(false)}
                  autoFocus
                  style={{ backgroundColor: "#fff", color: "#2C3A61" }}
                />
              ) : (
                <span
                  className="font-bold text-[#2C3A61] text-lg block w-full cursor-pointer"
                  onClick={() => setEditMetraje(true)}
                >
                  {metraje || "Metraje de tu mini bodega"}
                </span>
              )}
            </div>
            {/* Descripción editable */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-2">
              <span className="font-semibold">Es como:</span>
              {editDescripcion ? (
                <input
                  type="text"
                  value={descripcion}
                  onChange={e => onDescripcionChange && onDescripcionChange(e.target.value)}
                  className="ml-2 w-full bg-white text-[#2C3A61]"
                  onBlur={() => setEditDescripcion(false)}
                  autoFocus
                  style={{ backgroundColor: "#fff", color: "#2C3A61" }}
                />
              ) : (
                <span
                  className="ml-2 w-full cursor-pointer"
                  onClick={() => setEditDescripcion(true)}
                >
                  {descripcion || "Ingresa una comparativa de tamaño"}
                </span>
              )}
            </div>
            {/* Contenido editable */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-4">
              <span className="font-semibold">¿Que cabe?:</span>
              {editContenido ? (
                <input
                  type="text"
                  value={contenido}
                  onChange={e => onContenidoChange && onContenidoChange(e.target.value)}
                  className="ml-2 w-full bg-white text-[#2C3A61]"
                  onBlur={() => setEditContenido(false)}
                  autoFocus
                  style={{ backgroundColor: "#fff", color: "#2C3A61" }}
                />
              ) : (
                <span
                  className="ml-2 w-full cursor-pointer"
                  onClick={() => setEditContenido(true)}
                >
                  {contenido || "Ingresa que puede guardar el usuario"}
                </span>
              )}
            </div>
          </div>
          <button
            className="w-full py-2 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition mb-2"
            onClick={() => setFlipped(true)}
            title="Ver dirección"
          >
            Agregar dirección <span className="ml-2">📍</span>
          </button>
        </div>
        {/* Cara reversa */}
        <div className="flip-back bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col items-center w-72 h-[420px]">
          <div className="w-full text-center flex flex-col justify-center h-full">
            <span className="font-bold text-[#2C3A61] text-lg mb-4">Dirección de la bodega</span>
            {editDireccion ? (
              <input
                type="text"
                value={direccion}
                onChange={e => onDireccionChange && onDireccionChange(e.target.value)}
                className="w-full p-2 rounded bg-white text-[#2C3A61] border mb-4"
                onBlur={() => setEditDireccion(false)}
                autoFocus
                style={{ backgroundColor: "#fff", color: "#2C3A61" }}
              />
            ) : (
              <span
                className="text-[#2C3A61] w-full cursor-pointer"
                onClick={() => setEditDireccion(true)}
              >
                {direccion || "Ingresa la dirección de la mini bodega"}
              </span>
            )}
            <button
              className="w-full py-2 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition mt-4"
              onClick={() => setFlipped(false)}
              title="Volver"
            >
              <RotateCcw className="inline-block mr-2 h-4 w-4" /> Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}