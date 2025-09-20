import { useState } from "react";
import { Image, RotateCcw } from "lucide-react";
import './CardBodegas.css';

export function CardBodegas({
  id = null,
  metraje,
  descripcion,
  contenido,
  imagen,
  direccion,
  ciudad,
  zona,
  precioMensual,
  onImagenChange,
  onMetrajeChange,
  onDescripcionChange,
  onContenidoChange,
  onDireccionChange,
  onCiudadChange,
  onZonaChange,
  onPrecioMensualChange
}) {
  const [editMetraje, setEditMetraje] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState(false);
  const [editContenido, setEditContenido] = useState(false);
  const [editDireccion, setEditDireccion] = useState(false);
  const [editCiudad, setEditCiudad] = useState(false);
  const [editZona, setEditZona] = useState(false);
  const [editPrecio, setEditPrecio] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Formatear precio para mostrar
  const formatearPrecio = (precio) => {
    if (!precio) return "";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

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
          
          <div className="w-full text-center flex-1">
            {/* Metraje editable */}
            <div className="flex items-center justify-center mb-2">
              {editMetraje ? (
                <input
                  type="text"
                  value={metraje}
                  onChange={e => onMetrajeChange && onMetrajeChange(e.target.value)}
                  className="font-bold text-[#2C3A61] text-lg w-full bg-white text-center rounded px-2 py-1"
                  onBlur={() => setEditMetraje(false)}
                  autoFocus
                  placeholder="Ej: 15 m²"
                />
              ) : (
                <span
                  className="font-bold text-[#2C3A61] text-lg block w-full cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition"
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
                  className="ml-2 flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  onBlur={() => setEditDescripcion(false)}
                  autoFocus
                  placeholder="un closet pequeño"
                />
              ) : (
                <span
                  className="ml-2 flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition"
                  onClick={() => setEditDescripcion(true)}
                >
                  {descripcion || "una comparativa de tamaño"}
                </span>
              )}
            </div>
            
            {/* Contenido editable */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-4">
              <span className="font-semibold">¿Qué cabe?:</span>
              {editContenido ? (
                <input
                  type="text"
                  value={contenido}
                  onChange={e => onContenidoChange && onContenidoChange(e.target.value)}
                  className="ml-2 flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  onBlur={() => setEditContenido(false)}
                  autoFocus
                  placeholder="cajas, ropa, documentos"
                />
              ) : (
                <span
                  className="ml-2 flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition"
                  onClick={() => setEditContenido(true)}
                >
                  {contenido || "qué puede guardar"}
                </span>
              )}
            </div>
          </div>
          
          {/* Botón para voltear la card */}
          <button
            className="w-full py-3 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition"
            onClick={() => setFlipped(true)}
            title="Ver ubicación y precio"
          >
            📍 Ubicación y Precio 💰
          </button>
        </div>
        
        {/* Cara trasera - Ubicación y Precio */}
        <div className="flip-back bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col justify-between w-72 h-[420px]">
          <div className="w-full text-center">
            <h3 className="font-bold text-[#2C3A61] text-lg mb-6">📍 Ubicación y Precio</h3>
            
            {/* Dirección */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">Dirección:</label>
              {editDireccion ? (
                <textarea
                  value={direccion}
                  onChange={e => onDireccionChange && onDireccionChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm resize-none"
                  rows="2"
                  onBlur={() => setEditDireccion(false)}
                  autoFocus
                  placeholder="Calle 123 #45-67, Edificio A"
                />
              ) : (
                <div
                  className="w-full p-2 rounded bg-gray-50 text-[#2C3A61] border cursor-pointer hover:bg-gray-100 transition text-sm min-h-[50px] flex items-center"
                  onClick={() => setEditDireccion(true)}
                >
                  {direccion || "Ingresa la dirección de la mini bodega"}
                </div>
              )}
            </div>

            {/* Ciudad */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">Ciudad:</label>
              {editCiudad ? (
                <input
                  type="text"
                  value={ciudad}
                  onChange={e => onCiudadChange && onCiudadChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm"
                  onBlur={() => setEditCiudad(false)}
                  autoFocus
                  placeholder="Bogotá"
                />
              ) : (
                <div
                  className="w-full p-2 rounded bg-gray-50 text-[#2C3A61] border cursor-pointer hover:bg-gray-100 transition text-sm"
                  onClick={() => setEditCiudad(true)}
                >
                  {ciudad || "Selecciona la ciudad"}
                </div>
              )}
            </div>

            {/* Zona */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">Zona:</label>
              {editZona ? (
                <select
                  value={zona}
                  onChange={e => onZonaChange && onZonaChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm"
                  onBlur={() => setEditZona(false)}
                  autoFocus
                >
                  <option value="">Selecciona una zona</option>
                  <option value="Norte">Norte</option>
                  <option value="Sur">Sur</option>
                  <option value="Este">Este</option>
                  <option value="Oeste">Oeste</option>
                  <option value="Centro">Centro</option>
                </select>
              ) : (
                <div
                  className="w-full p-2 rounded bg-gray-50 text-[#2C3A61] border cursor-pointer hover:bg-gray-100 transition text-sm"
                  onClick={() => setEditZona(true)}
                >
                  {zona || "Selecciona la zona"}
                </div>
              )}
            </div>

            {/* Precio Mensual */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">Precio Mensual:</label>
              {editPrecio ? (
                <input
                  type="number"
                  value={precioMensual}
                  onChange={e => onPrecioMensualChange && onPrecioMensualChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm"
                  onBlur={() => setEditPrecio(false)}
                  autoFocus
                  placeholder="350000"
                  min="0"
                />
              ) : (
                <div
                  className="w-full p-2 rounded bg-gray-50 text-[#2C3A61] border cursor-pointer hover:bg-gray-100 transition text-sm font-bold"
                  onClick={() => setEditPrecio(true)}
                >
                  {precioMensual ? formatearPrecio(precioMensual) : "Ingresa el precio mensual"}
                </div>
              )}
            </div>
          </div>

          {/* Botón volver */}
          <button
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