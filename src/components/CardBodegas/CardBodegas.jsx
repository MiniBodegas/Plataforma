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

  // Nuevos props
  metrosCuadrados = "",
  caracteristicas = "",
  disponible = true,

  // Callbacks (no-ops para evitar TypeError si no llegan)
  onImagenChange = () => {},
  onMetrajeChange = () => {},
  onDescripcionChange = () => {},
  onContenidoChange = () => {},
  onPrecioMensualChange = () => {},
  onCantidadChange = () => {},
  onNombrePersonalizadoChange = () => {},
  onDescripcionAdicionalChange = () => {},
  onUbicacionInternaChange = () => {},
  onDisponibleChange = () => {},
  onMetrosCuadradosChange = () => {},
  onCaracteristicasChange = () => {}
}) {
  const [editMetraje, setEditMetraje] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState(false);
  const [editContenido, setEditContenido] = useState(false);
  const [editPrecio, setEditPrecio] = useState(false);
  const [editNombrePersonalizado, setEditNombrePersonalizado] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [imagenError, setImagenError] = useState(false);
  const [editMetrosCuadrados, setEditMetrosCuadrados] = useState(false);
  const [editCaracteristicas, setEditCaracteristicas] = useState(false);
  const [caracteristicasOpen, setCaracteristicasOpen] = useState(false);
  const [ubicacionOpen, setUbicacionOpen] = useState(false);

  const opcionesCaracteristicas = [
    "Acceso 24/7",
    "Vigilancia",
    "Montacargas",
    "Zona de carga",
    "Clima controlado",
    "Parqueadero",
    "Cámaras de seguridad"
  ];

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
        <div className="flip-front bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col w-72 h-[520px]">
          {/* Imagen */}
          <div className="bg-[#E9E9E9] rounded-xl w-full h-32 flex justify-center items-center mb-3 overflow-hidden">
            {getImageUrl(imagen) && !imagenError ? (
              <img
                src={getImageUrl(imagen)}
                alt={nombrePersonalizado || "Mini bodega"}
                className="object-cover h-full w-full rounded-xl"
                onError={() => setImagenError(true)}
                loading="lazy"
              />
            ) : (
              <span className="text-gray-400">Sin imagen</span>
            )}
          </div>
          <div className="w-full mt-2 flex justify-center">
            <label className="text-xs text-[#2C3A61] cursor-pointer bg-white border border-[#BFD6EA] rounded px-2 py-1 hover:bg-blue-50 transition">
              Cambiar imagen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    onImagenChange(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Campos alineados a la izquierda */}
          <div className="w-full flex flex-col gap-2">
            {/* Nombre editable */}
            <div>
              <label className="font-bold text-[#2C3A61] text-xs block mb-1">Nombre</label>
              <input
                type="text"
                value={nombrePersonalizado}
                onChange={(e) => onNombrePersonalizadoChange(e.target.value)}
                className="w-full p-1.5 rounded bg-white text-[#2C3A61] border text-xs"
                placeholder="Nombre personalizado"
                maxLength={50}
              />
            </div>

            {/* Metros cúbicos */}
            <div>
              <label className="font-semibold text-[#2C3A61] text-xs block mb-1">Metros cúbicos (m³)</label>
              <input
                type="number"
                value={metraje}
                onChange={(e) => onMetrajeChange(e.target.value)}
                className="w-full p-1.5 rounded bg-white text-[#2C3A61] border text-xs"
                min={0}
                step="any"
                placeholder="m³"
              />
            </div>

            {/* Metros cuadrados */}
            <div>
              <label className="font-semibold text-[#2C3A61] text-xs block mb-1">Metros cuadrados (m²)</label>
              <input
                type="number"
                value={metrosCuadrados === null || metrosCuadrados === undefined ? "" : metrosCuadrados}
                onChange={(e) => {
                  const val = e.target.value;
                  onMetrosCuadradosChange(val === "" ? "" : Number(val));
                }}
                className="w-full p-1.5 rounded bg-white text-[#2C3A61] border text-xs"
                min={0}
                step="any"
                placeholder="m²"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="font-semibold text-[#2C3A61] text-xs block mb-1">Descripción</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => onDescripcionChange(e.target.value)}
                className="w-full p-1.5 rounded bg-white text-[#2C3A61] border text-xs"
                placeholder="Descripción"
                maxLength={120}
              />
            </div>

            {/* Precio y cantidad */}
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="font-semibold text-[#2C3A61] text-xs block mb-1">Precio</label>
                <input
                  type="number"
                  value={precioMensual}
                  onChange={(e) => onPrecioMensualChange(e.target.value)}
                  className="w-full p-1.5 rounded bg-white text-[#2C3A61] border text-xs"
                  min={0}
                  step="any"
                  placeholder="COP"
                />
              </div>
              <div className="flex-1">
                <label className="font-semibold text-[#2C3A61] text-xs block mb-1">Cantidad</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 rounded bg-blue-50 border border-blue-200 text-[#2C3A61] text-xs"
                    onClick={disminuirCantidad}
                    disabled={cantidadInterna <= 1}
                    style={{ minWidth: 24 }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={cantidadInterna}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val >= 1 && val <= maxCantidad) {
                        setCantidadInterna(val);
                        onCantidadChange(val);
                      }
                    }}
                    className="w-10 p-1 rounded bg-white text-[#2C3A61] border text-xs text-center"
                    min={1}
                    max={maxCantidad}
                  />
                  <button
                    type="button"
                    className="p-1 rounded bg-blue-50 border border-blue-200 text-[#2C3A61] text-xs"
                    onClick={aumentarCantidad}
                    disabled={cantidadInterna >= maxCantidad}
                    style={{ minWidth: 24 }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botón para ver reverso */}
          <button
            type="button"
            className="w-full mt-3 py-2 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition text-xs"
            onClick={() => setFlipped(true)}
            title="Ver ubicación"
          >
            📍 Caracteristicas
          </button>
        </div>

        {/* =================== REVERSO =================== */}
        <div className="flip-back bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col justify-between w-72 h-[520px]">
          <div className="w-full text-center">
            <h3 className="font-bold text-[#2C3A61] text-lg mb-6">📍 Características</h3>

            {/* Características primero */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                🛡️ Características:
              </label>
              <div className="relative">
                <div
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm cursor-pointer flex flex-wrap gap-1 min-h-[40px]"
                  onClick={() => setCaracteristicasOpen((open) => !open)}
                  tabIndex={0}
                  onBlur={() => setCaracteristicasOpen(false)}
                  style={{ minHeight: "40px" }}
                >
                  {Array.isArray(caracteristicas) && caracteristicas.length > 0
                    ? caracteristicas.map((car, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-[#2C3A61]">
                          {car}
                        </span>
                      ))
                    : <span className="text-gray-400">Selecciona características</span>
                  }
                  <span className="ml-auto text-xs text-gray-400">&#9660;</span>
                </div>
                {caracteristicasOpen && (
                  <div className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-auto">
                    {opcionesCaracteristicas.map((opcion) => (
                      <div
                        key={opcion}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center ${
                          Array.isArray(caracteristicas) && caracteristicas.includes(opcion) ? "font-semibold text-[#2C3A61]" : "text-gray-700"
                        }`}
                        onMouseDown={() => {
                          let nuevas;
                          if (Array.isArray(caracteristicas) && caracteristicas.includes(opcion)) {
                            nuevas = caracteristicas.filter(c => c !== opcion);
                          } else {
                            nuevas = [...(Array.isArray(caracteristicas) ? caracteristicas : []), opcion];
                          }
                          onCaracteristicasChange(nuevas);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Array.isArray(caracteristicas) && caracteristicas.includes(opcion)}
                          readOnly
                          className="mr-2"
                        />
                        {opcion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación interna */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                🏢 Ubicación interna:
              </label>
              <div className="relative">
                <div
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm cursor-pointer flex items-center min-h-[40px]"
                  onClick={() => setUbicacionOpen((open) => !open)}
                  tabIndex={0}
                  onBlur={() => setUbicacionOpen(false)}
                  style={{ minHeight: "40px" }}
                >
                  {ubicacionInterna
                    ? <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-[#2C3A61]">{ubicacionInterna}</span>
                    : <span className="text-gray-400">Selecciona ubicación</span>
                  }
                  <span className="ml-auto text-xs text-gray-400">&#9660;</span>
                </div>
                {ubicacionOpen && (
                  <div className="absolute z-10 bg-white border rounded shadow w-full mt-1">
                    {["Primer piso", "Segundo piso", "Externo", "Interno"].map((opcion) => (
                      <div
                        key={opcion}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                          ubicacionInterna === opcion ? "font-semibold text-[#2C3A61]" : "text-gray-700"
                        }`}
                        onMouseDown={() => {
                          onUbicacionInternaChange(opcion);
                          setUbicacionOpen(false);
                        }}
                      >
                        {opcion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botón para deshabilitar la bodega */}
            <div className="mb-4 flex items-center justify-center">
              <label className="text-sm font-semibold text-[#2C3A61] mr-2">
                Estado:
              </label>
              <button
                type="button"
                className={`px-4 py-2 rounded-md font-semibold text-xs transition-colors ${
                  disponible
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
                onClick={() => onDisponibleChange(!disponible)}
                title={disponible ? "Deshabilitar minibodega" : "Habilitar minibodega"}
              >
                {disponible ? "Disponible" : "Inhabilitada"}
              </button>
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
