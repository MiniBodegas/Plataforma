// CardBodegas.jsx
import { useState, useEffect, useMemo } from "react";
import { Image, RotateCcw, Minus, Plus } from "lucide-react";
import "./CardBodegas.css";

export function CardBodegas({
  id = null,
  // Frente (visible para usuario)
  metraje = "",
  descripcion = "",
  contenido = "",
  imagen = null,
  precioMensual = "",
  cantidad = 1,
  maxCantidad = 99,

  // Reverso
  nombrePersonalizado = "",
  descripcionAdicional = "",
  ubicacionInterna = "",

  // Callbacks (no-ops para evitar TypeError si no llegan)
  onImagenChange = () => {},
  onMetrajeChange = () => {},
  onDescripcionChange = () => {},
  onContenidoChange = () => {},
  onPrecioMensualChange = () => {},
  onCantidadChange = () => {},
  onNombrePersonalizadoChange = () => {},
  onDescripcionAdicionalChange = () => {},
  onUbicacionInternaChange = () => {}
}) {
  const [editMetraje, setEditMetraje] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState(false);
  const [editContenido, setEditContenido] = useState(false);
  const [editPrecio, setEditPrecio] = useState(false);
  const [editNombrePersonalizado, setEditNombrePersonalizado] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [imagenError, setImagenError] = useState(false);

  // Cantidad interna (controlado + notifica)
  const [cantidadInterna, setCantidadInterna] = useState(cantidad);
  useEffect(() => {
    setCantidadInterna(cantidad);
  }, [cantidad]);

  const aumentarCantidad = () => {
    const nueva = cantidadInterna + 1;
    if (nueva <= maxCantidad) {
      setCantidadInterna(nueva);
      onCantidadChange(nueva);
    }
  };

  const disminuirCantidad = () => {
    const nueva = cantidadInterna - 1;
    if (nueva >= 1) {
      setCantidadInterna(nueva);
      onCantidadChange(nueva);
    }
  };

  const formatearPrecio = (precio) => {
    if (precio === "" || precio == null || isNaN(Number(precio))) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(precio));
  };

  // Imagen helpers
  const getImageUrl = (img) => {
    if (!img) return null;

    if (typeof img === "string") {
      if (img.includes("supabase.co")) return `${img}?t=${Date.now()}`;
      try {
        new URL(img);
        return img;
      } catch {
        return null;
      }
    }

    if (img instanceof File) {
      try {
        return URL.createObjectURL(img);
      } catch {
        return null;
      }
    }
    return null;
  };

  const tieneImagen = useMemo(() => {
    const url = getImageUrl(imagen);
    return url !== null && !imagenError;
  }, [imagen, imagenError]);

  useEffect(() => {
    if (imagen) setImagenError(false);
  }, [imagen]);

  return (
    <div className={`flip-card w-72 h-[520px]${flipped ? " flipped" : ""}`}>
      <div className="flip-inner">
        {/* =================== FRENTE =================== */}
        <div className="flip-front bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col items-center w-72 h-[520px]">
          {/* Imagen */}
          <div className="bg-[#E9E9E9] rounded-xl w-full h-36 flex flex-col justify-center items-center mb-4">
            {tieneImagen ? (
              <div className="relative w-full h-full">
                <img
                  src={getImageUrl(imagen)}
                  alt="Mini bodega"
                  className="object-contain h-full w-full rounded-xl"
                  onError={() => setImagenError(true)}
                  onLoad={() => setImagenError(false)}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                <Image className="h-10 w-10 text-[#2C3A61]" />
                <span className="text-[#2C3A61] mt-2 text-sm text-center">
                  {imagenError
                    ? "Error cargando imagen - Sube una nueva"
                    : "Sube una imagen de tu mini bodega"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setImagenError(false);
                    if (e.target.files?.[0]) onImagenChange(e.target.files[0]);
                  }}
                />
              </label>
            )}
          </div>

          <div className="w-full text-center flex-1">
            {/* Metraje */}
            <div className="flex items-center justify-center mb-3">
              {editMetraje ? (
                <input
                  type="text"
                  value={metraje}
                  onChange={(e) => onMetrajeChange(e.target.value)}
                  className="font-bold text-[#2C3A61] text-lg bg-white text-center rounded px-2 py-1"
                  style={{ maxWidth: "200px", minWidth: "100px" }}
                  onBlur={() => setEditMetraje(false)}
                  autoFocus
                  placeholder="Ej: 15 m²"
                />
              ) : (
                <span
                  className="font-bold text-[#2C3A61] text-lg block w-full cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition truncate"
                  onClick={() => setEditMetraje(true)}
                  title={metraje || "Metraje de tu mini bodega"}
                >
                  {metraje || "Metraje de tu mini bodega"}
                </span>
              )}
            </div>

            {/* Descripción corta (comparativa) */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-3">
              <span className="font-semibold whitespace-nowrap mr-2">Es como:</span>
              {editDescripcion ? (
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => onDescripcionChange(e.target.value)}
                  className="flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  style={{ maxWidth: "150px", minWidth: "80px" }}
                  onBlur={() => setEditDescripcion(false)}
                  autoFocus
                  placeholder="un closet pequeño"
                />
              ) : (
                <span
                  className="flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition truncate-text"
                  onClick={() => setEditDescripcion(true)}
                  title={descripcion || "una comparativa de tamaño"}
                >
                  {descripcion || "una comparativa de tamaño"}
                </span>
              )}
            </div>

            {/* Contenido (qué cabe) */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-3">
              <span className="font-semibold whitespace-nowrap mr-2">¿Qué cabe?:</span>
              {editContenido ? (
                <input
                  type="text"
                  value={contenido}
                  onChange={(e) => onContenidoChange(e.target.value)}
                  className="flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  style={{ maxWidth: "140px", minWidth: "80px" }}
                  onBlur={() => setEditContenido(false)}
                  autoFocus
                  placeholder="cajas, ropa, documentos"
                />
              ) : (
                <span
                  className="flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition truncate-text"
                  onClick={() => setEditContenido(true)}
                  title={contenido || "qué puede guardar"}
                >
                  {contenido || "qué puede guardar"}
                </span>
              )}
            </div>

            {/* Precio mensual */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-2">
              <span className="font-semibold whitespace-nowrap mr-2">💰 Precio c/u:</span>
              {editPrecio ? (
                <input
                  type="number"
                  value={precioMensual}
                  onChange={(e) => onPrecioMensualChange(e.target.value)}
                  className="flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  style={{
                    maxWidth: "120px",
                    minWidth: "80px",
                    MozAppearance: "textfield",
                    WebkitAppearance: "none",
                    appearance: "none"
                  }}
                  onBlur={() => setEditPrecio(false)}
                  autoFocus
                  placeholder="350000"
                  min="0"
                />
              ) : (
                <span
                  className="flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition truncate-text"
                  onClick={() => setEditPrecio(true)}
                  title={precioMensual ? formatearPrecio(precioMensual) : "precio mensual"}
                >
                  {precioMensual ? formatearPrecio(precioMensual) : "precio mensual"}
                </span>
              )}
            </div>

            {/* Cantidad */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs text-[#2C3A61] font-semibold">Cantidad:</span>

              <button
                onClick={disminuirCantidad}
                type="button"
                disabled={cantidadInterna <= 1}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${cantidadInterna <= 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#2C3A61] hover:bg-gray-100 active:scale-95"
                  } transition-all duration-150`}
              >
                <Minus className="h-3 w-3" />
              </button>

              <span className="w-8 h-6 text-center text-sm font-bold text-[#2C3A61] flex items-center justify-center">
                {cantidadInterna}
              </span>

              <button
                onClick={aumentarCantidad}
                type="button"
                disabled={cantidadInterna >= maxCantidad}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${cantidadInterna >= maxCantidad
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#2C3A61] hover:bg-gray-100 active:scale-95"
                  } transition-all duration-150`}
              >
                <Plus className="h-3 w-3" />
              </button>

              <span className="text-xs text-gray-400">/{maxCantidad}</span>
            </div>
          </div>

          {/* Voltear */}
          <button
            type="button"
            className="w-full py-3 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition"
            onClick={() => setFlipped(true)}
            title="Ver ubicación"
          >
            📍 Ubicación y Detalles
          </button>
        </div>

        {/* =================== REVERSO =================== */}
        <div className="flip-back bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col justify-between w-72 h-[520px]">
          <div className="w-full text-center">
            <h3 className="font-bold text-[#2C3A61] text-lg mb-6">📍 Ubicación y Detalles</h3>

            {/* Nombre personalizado */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                🏷️ Nombre personalizado (opcional):
              </label>
              {editNombrePersonalizado ? (
                <input
                  type="text"
                  value={nombrePersonalizado}
                  onChange={(e) => onNombrePersonalizadoChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm"
                  onBlur={() => setEditNombrePersonalizado(false)}
                  autoFocus
                  placeholder="Ej: Bodega Principal, Local Centro, etc."
                  maxLength={50}
                />
              ) : (
                <div
                  className="w-full p-2 rounded bg-gray-50 text-[#2C3A61] border cursor-pointer hover:bg-gray-100 transition text-sm min-h-[40px] flex items-center"
                  onClick={() => setEditNombrePersonalizado(true)}
                  title={nombrePersonalizado || "Agrega un nombre personalizado"}
                >
                  <span className="truncate w-full text-center">
                    {nombrePersonalizado || "Sin nombre personalizado"}
                  </span>
                </div>
              )}
              {nombrePersonalizado && (
                <div className="text-xs text-gray-500 mt-1">
                  {nombrePersonalizado.length}/50 caracteres
                </div>
              )}
            </div>

            {/* Descripción adicional */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                📝 Descripción adicional:
              </label>
              <textarea
                value={descripcionAdicional || ""}
                onChange={(e) =>
                  onDescripcionAdicionalChange(e.target.value)
                }
                className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm"
                placeholder="Ej: Espacio ideal para archivos, acceso por escaleras, etc."
                rows={2}
                maxLength={120}
              />
              {descripcionAdicional && (
                <div className="text-xs text-gray-500 mt-1">
                  {descripcionAdicional.length}/120 caracteres
                </div>
              )}
            </div>

            {/* Ubicación interna */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                🏢 Ubicación interna:
              </label>
              <input
                type="text"
                value={ubicacionInterna || ""}
                onChange={(e) => onUbicacionInternaChange(e.target.value)}
                className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm"
                placeholder="Ej: Segundo piso, pasillo central, cerca a la entrada"
                maxLength={60}
              />
              {ubicacionInterna && (
                <div className="text-xs text-gray-500 mt-1">
                  {ubicacionInterna.length}/60 caracteres
                </div>
              )}
            </div>
          </div>

          {/* Volver */}
          <button
            type="button"
            className="w-full py-3 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition"
            onClick={() => setFlipped(false)}
            title="Volver"
          >
            <RotateCcw className="inline-block mr-2 h-4 w-4" />
            Volver a la descripción
          </button>
        </div>
      </div>
    </div>
  );
}
