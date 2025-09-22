import { useState, useEffect } from "react";
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
  const [editPrecio, setEditPrecio] = useState(false);
  const [editDireccion, setEditDireccion] = useState(false);
  const [editCiudad, setEditCiudad] = useState(false);
  const [editZona, setEditZona] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [imagenError, setImagenError] = useState(false);

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

  // Función para obtener la URL correcta de la imagen
  const getImageUrl = (img) => {
    if (!img) return null;
    
    // Si es una string (URL de la DB)
    if (typeof img === 'string') {
      // Si es URL de Supabase, agregar timestamp para evitar cache
      if (img.includes('supabase.co')) {
        return `${img}?t=${Date.now()}`;
      }
      
      // Verificar si es una URL válida
      try {
        new URL(img);
        return img;
      } catch (e) {
        return null;
      }
    }
    
    // Si es un archivo File
    if (img instanceof File) {
      try {
        return URL.createObjectURL(img);
      } catch (e) {
        return null;
      }
    }
    
    return null;
  };

  // Verificar si hay imagen válida
  const tieneImagen = () => {
    const url = getImageUrl(imagen);
    return url !== null && !imagenError;
  };

  // Manejar error de imagen
  const handleImageError = (e) => {
    setImagenError(true);
  };

  // Manejar carga exitosa de imagen
  const handleImageLoad = (e) => {
    setImagenError(false);
  };

  // Resetear error cuando cambia la imagen
  useEffect(() => {
    if (imagen) {
      setImagenError(false);
    }
  }, [imagen]);

  return (
    <div className={`flip-card w-72 h-[480px]${flipped ? " flipped" : ""}`}>
      <div className="flip-inner">
        {/* Cara frontal */}
        <div className="flip-front bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col items-center w-72 h-[480px]">
          {/* Sección de imagen */}
          <div className="bg-[#E9E9E9] rounded-xl w-full h-36 flex flex-col justify-center items-center mb-4">
            {tieneImagen() ? (
              <div className="relative w-full h-full">
                <img
                  src={getImageUrl(imagen)}
                  alt="Mini bodega"
                  className="object-contain h-full w-full rounded-xl"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
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
                    : "Sube una imagen de tu mini bodega"
                  }
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    setImagenError(false);
                    onImagenChange && onImagenChange(e.target.files[0]);
                  }}
                />
              </label>
            )}
          </div>
          
          <div className="w-full text-center flex-1">
            {/* Metraje editable */}
            <div className="flex items-center justify-center mb-3">
              {editMetraje ? (
                <input
                  type="text"
                  value={metraje}
                  onChange={e => onMetrajeChange && onMetrajeChange(e.target.value)}
                  className="font-bold text-[#2C3A61] text-lg bg-white text-center rounded px-2 py-1"
                  style={{ maxWidth: '200px', minWidth: '100px' }}
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
            
            {/* Descripción editable */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-3">
              <span className="font-semibold whitespace-nowrap mr-2">Es como:</span>
              {editDescripcion ? (
                <input
                  type="text"
                  value={descripcion}
                  onChange={e => onDescripcionChange && onDescripcionChange(e.target.value)}
                  className="flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  style={{ maxWidth: '150px', minWidth: '80px' }}
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
            
            {/* Contenido editable */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-3">
              <span className="font-semibold whitespace-nowrap mr-2">¿Qué cabe?:</span>
              {editContenido ? (
                <input
                  type="text"
                  value={contenido}
                  onChange={e => onContenidoChange && onContenidoChange(e.target.value)}
                  className="flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  style={{ maxWidth: '140px', minWidth: '80px' }}
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
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-4">
              <span className="font-semibold whitespace-nowrap mr-2">💰 Precio:</span>
              {editPrecio ? (
                <input
                  type="number"
                  value={precioMensual}
                  onChange={e => onPrecioMensualChange && onPrecioMensualChange(e.target.value)}
                  className="flex-1 bg-white text-[#2C3A61] rounded px-2 py-1"
                  style={{ 
                    maxWidth: '120px', 
                    minWidth: '80px',
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                    appearance: 'none'
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
          </div>
          
          {/* Botón para voltear la card */}
          <button
            className="w-full py-3 rounded-xl border border-[#BFD6EA] text-[#2C3A61] font-bold bg-white hover:bg-[#E9E9E9] transition"
            onClick={() => setFlipped(true)}
            title="Ver ubicación"
          >
            📍 Ubicación y Detalles
          </button>
        </div>
        
        {/* Cara trasera - Ubicación y Detalles */}
        <div className="flip-back bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col justify-between w-72 h-[480px]">
          <div className="w-full text-center">
            <h3 className="font-bold text-[#2C3A61] text-lg mb-6">📍 Ubicación y Detalles</h3>
            
            {/* Dirección */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">Dirección:</label>
              {editDireccion ? (
                <textarea
                  value={direccion}
                  onChange={e => onDireccionChange && onDireccionChange(e.target.value)}
                  className="w-full p-2 rounded bg-white text-[#2C3A61] border text-sm resize-none"
                  rows="3"
                  onBlur={() => setEditDireccion(false)}
                  autoFocus
                  placeholder="Calle 123 #45-67, Edificio A, Local 101"
                />
              ) : (
                <div
                  className="w-full p-2 rounded bg-gray-50 text-[#2C3A61] border cursor-pointer hover:bg-gray-100 transition text-sm min-h-[60px] flex items-center"
                  onClick={() => setEditDireccion(true)}
                  title={direccion || "Ingresa la dirección completa"}
                >
                  <span className="truncate w-full">
                    {direccion || "Ingresa la dirección completa de la mini bodega"}
                  </span>
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
                  title={ciudad || "Selecciona la ciudad"}
                >
                  <span className="truncate w-full">
                    {ciudad || "Selecciona la ciudad"}
                  </span>
                </div>
              )}
            </div>

            {/* Zona */}
            <div className="mb-6">
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
                  title={zona || "Selecciona la zona"}
                >
                  <span className="truncate w-full">
                    {zona || "Selecciona la zona"}
                  </span>
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

