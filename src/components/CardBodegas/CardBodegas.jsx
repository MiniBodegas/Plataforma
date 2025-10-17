import { useState, useEffect } from "react";
import { Image, RotateCcw, Minus, Plus } from "lucide-react";
import './CardBodegas.css';

export function CardBodegas({
  id = null,
  metraje = "",
  descripcion = "",
  contenido = "",
  imagen = null,
  precioMensual = "",
  cantidad = 1,
  maxCantidad = 99,
  nombrePersonalizado = "", // ✅ NUEVO: nombre personalizado
  onImagenChange,
  onMetrajeChange,
  onDescripcionChange,
  onContenidoChange,    
  onPrecioMensualChange,
  onCantidadChange,
  onNombrePersonalizadoChange // ✅ NUEVO: callback para nombre personalizado
}) {
  const [editMetraje, setEditMetraje] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState(false);
  const [editContenido, setEditContenido] = useState(false);
  const [editPrecio, setEditPrecio] = useState(false);
  const [editNombrePersonalizado, setEditNombrePersonalizado] = useState(false); // ✅ NUEVO: estado para editar nombre
  const [flipped, setFlipped] = useState(false);
  const [imagenError, setImagenError] = useState(false);
  
  // ✅ ESTADO INTERNO PARA CANTIDAD
  const [cantidadInterna, setCantidadInterna] = useState(cantidad);

  // ✅ SINCRONIZAR CON PROP EXTERNA
  useEffect(() => {
    setCantidadInterna(cantidad);
  }, [cantidad]);

  // ✅ FUNCIONES PARA MANEJAR CANTIDAD - CON DEBUG
  const aumentarCantidad = () => {
    const nuevaCantidad = cantidadInterna + 1;
    console.log('🔼 CardBodegas: Aumentando cantidad de', cantidadInterna, 'a', nuevaCantidad);
    if (nuevaCantidad <= maxCantidad) {
      setCantidadInterna(nuevaCantidad);
      if (onCantidadChange) {
        console.log('📤 CardBodegas: Notificando cambio al padre:', nuevaCantidad);
        onCantidadChange(nuevaCantidad);
      } else {
        console.log('❌ CardBodegas: onCantidadChange no está definido');
      }
    }
  };

  const disminuirCantidad = () => {
    const nuevaCantidad = cantidadInterna - 1;
    console.log('🔽 CardBodegas: Disminuyendo cantidad de', cantidadInterna, 'a', nuevaCantidad);
    if (nuevaCantidad >= 1) {
      setCantidadInterna(nuevaCantidad);
      if (onCantidadChange) {
        console.log('📤 CardBodegas: Notificando cambio al padre:', nuevaCantidad);
        onCantidadChange(nuevaCantidad);
      } else {
        console.log('❌ CardBodegas: onCantidadChange no está definido');
      }
    }
  };

  const handleCantidadInput = (e) => {
    const valor = parseInt(e.target.value) || 1;
    if (valor >= 1 && valor <= maxCantidad) {
      setCantidadInterna(valor);
      onCantidadChange && onCantidadChange(valor);
    }
  };

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

  // ✅ CALCULAR PRECIO TOTAL CON CANTIDAD INTERNA
  const precioTotal = precioMensual ? precioMensual * cantidadInterna : 0;

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
    <div className={`flip-card w-72 h-[520px]${flipped ? " flipped" : ""}`}>
      <div className="flip-inner">
        {/* Cara frontal */}
        <div className="flip-front bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col items-center w-72 h-[520px]">
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

            {/* Precio mensual unitario */}
            <div className="flex items-center justify-center text-[#2C3A61] text-sm mb-2">
              <span className="font-semibold whitespace-nowrap mr-2">💰 Precio c/u:</span>
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

            {/* ✅ CONTROLES DE CANTIDAD - SOLO BOTONES + Y - */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs text-[#2C3A61] font-semibold">Cantidad:</span>
              
              <button
                onClick={disminuirCantidad}
                disabled={cantidadInterna <= 1}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${cantidadInterna <= 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-[#2C3A61] hover:bg-gray-100 active:scale-95'
                  } transition-all duration-150`}
              >
                <Minus className="h-3 w-3" />
              </button>
              
              <span className="w-8 h-6 text-center text-sm font-bold text-[#2C3A61] flex items-center justify-center">
                {cantidadInterna}
              </span>
              
              <button
                onClick={aumentarCantidad}
                disabled={cantidadInterna >= maxCantidad}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${cantidadInterna >= maxCantidad 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-[#2C3A61] hover:bg-gray-100 active:scale-95'
                  } transition-all duration-150`}
              >
                <Plus className="h-3 w-3" />
              </button>
              
              <span className="text-xs text-gray-400">/{maxCantidad}</span>
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
        <div className="flip-back bg-[#F7F8FA] rounded-2xl shadow p-6 flex flex-col justify-between w-72 h-[520px]">
          <div className="w-full text-center">
            <h3 className="font-bold text-[#2C3A61] text-lg mb-6">📍 Ubicación y Detalles</h3>
            
            {/* ✅ NUEVO: Nombre personalizado */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                🏷️ Nombre personalizado (opcional):
              </label>
              {editNombrePersonalizado ? (
                <input
                  type="text"
                  value={nombrePersonalizado}
                  onChange={e => onNombrePersonalizadoChange && onNombrePersonalizadoChange(e.target.value)}
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

            {/* Dirección/ciudad/zona removidos - sólo detalles y nombre personalizado */}
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