import { useState, useRef, useEffect } from "react";
import { Pencil, Image, X } from "lucide-react";

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

  // ✅ Sincronizar imágenes cuando cambian las props
  useEffect(() => {
    setImagenes(initialImagenes);
  }, [initialImagenes]);

  // ✅ Sincronizar características cuando cambian las props
  useEffect(() => {
    if (caracteristicas) {
      const carArray = caracteristicas.split(',').map(c => c.trim()).filter(c => c.length > 0);
      setCaracteristicasSeleccionadas(carArray);
    }
  }, [caracteristicas]);

  // Maneja la carga de imágenes y genera previews
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = [...(imagenes || []), ...files];
    setImagenes(nuevasImagenes);
    if (onImagenesChange) onImagenesChange(nuevasImagenes);
  };

  // Eliminar imagen
  const handleRemoveImage = (idx) => {
    const nuevas = imagenes.filter((_, i) => i !== idx);
    setImagenes(nuevas);
    if (onImagenesChange) onImagenesChange(nuevas);
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

  // ✅ Función para obtener la URL correcta de la imagen
  const getImageUrl = (img) => {
    if (typeof img === 'string') {
      return img; // Ya es una URL
    }
    if (img instanceof File) {
      return URL.createObjectURL(img); // Es un archivo File
    }
    return null; // Caso inválido
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
                className="text-3xl font-bold w-full bg-white text-[#2C3A61] text-left border-none outline-none"
                onBlur={() => setEditEmpresa(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditEmpresa(false)}
                autoFocus
                placeholder="Nombre de tu empresa"
              />
            ) : (
              <span
                className="text-3xl font-bold text-[#2C3A61] text-left cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                onClick={() => setEditEmpresa(true)}
              >
                {empresa || "Nombre de tu empresa"}
              </span>
            )}
            {!editEmpresa && (
              <button 
                onClick={() => setEditEmpresa(true)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4 text-[#2C3A61]" />
              </button>
            )}
          </div>
          <div className="flex items-center">
            {editDireccion ? (
              <input
                type="text"
                value={direccion}
                onChange={e => onDireccionChange(e.target.value)}
                className="text-base w-full bg-white text-[#2C3A61] text-left border-none outline-none"
                onBlur={() => setEditDireccion(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditDireccion(false)}
                autoFocus
                placeholder="Dirección de tus mini bodegas"
              />
            ) : (
              <span
                className="text-base text-[#2C3A61] text-left cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                onClick={() => setEditDireccion(true)}
              >
                {direccion || "Ingresa la dirección de tus mini bodegas"}
              </span>
            )}
            {!editDireccion && (
              <button 
                onClick={() => setEditDireccion(true)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4 text-[#2C3A61]" />
              </button>
            )}
          </div>
        </div>
        
        {/* Descripción a la derecha */}
        <div className="bg-[#4B799B] rounded-xl p-6 flex flex-col justify-center h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-white text-base">Descripción</span>
            {!editDescripcion && (
              <button 
                onClick={() => setEditDescripcion(true)}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
          <div className="text-white">
            {editDescripcion ? (
              <textarea
                value={descripcion}
                onChange={e => onDescripcionChange(e.target.value)}
                className="w-full p-3 rounded bg-white text-[#2C3A61] resize-none"
                rows={4}
                onBlur={() => setEditDescripcion(false)}
                autoFocus
                placeholder="Describe tu empresa y servicios de mini bodegas..."
              />
            ) : (
              <span
                className="cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors block"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Imágenes */}
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center mb-4">
            <Image
              className="h-10 w-10 text-[#2C3A61] mb-2 cursor-pointer hover:text-[#4B799B] transition-colors"
              onClick={handleIconClick}
            />
            <span className="text-[#2C3A61] font-semibold mb-1">Sube imágenes de tu empresa</span>
            <span className="text-[#2C3A61] text-sm opacity-75">Clic aquí para seleccionar</span>
          </div>
          
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImagenesChange}
          />
          
          {/* ✅ Previsualización de imágenes corregida */}
          {imagenes && imagenes.length > 0 && (
            <div className="w-full">
              <div className="flex gap-2 mt-4 flex-wrap justify-center">
                {imagenes.map((img, i) => {
                  const imageUrl = getImageUrl(img);
                  if (!imageUrl) return null;
                  
                  return (
                    <div key={i} className="flex flex-col items-center relative group">
                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Eliminar imagen"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      <img
                        src={imageUrl}
                        alt={`preview-${i}`}
                        className="object-cover w-20 h-20 rounded border mb-1 group-hover:shadow-lg transition-shadow"
                      />
                      <span className="text-xs text-[#2C3A61] max-w-[80px] truncate" 
                            title={typeof img === 'string' ? `Imagen ${i + 1}` : img.name}>
                        {typeof img === 'string' ? `Img ${i + 1}` : img.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-sm text-[#2C3A61] font-medium text-center">
                {imagenes.length === 1
                  ? "1 imagen agregada"
                  : `${imagenes.length} imágenes agregadas`}
              </div>
            </div>
          )}
        </div>
        
        {/* Características */}
        <div className="bg-white rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#2C3A61] font-semibold">Características</span>
            {!editCaracteristicas && (
              <button 
                onClick={() => setEditCaracteristicas(true)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4 text-[#2C3A61]" />
              </button>
            )}
          </div>
          
          {/* Selección de características por default */}
          {!editCaracteristicas ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {CARACTERISTICAS_DEFAULT.map(car => (
                  <button
                    key={car}
                    type="button"
                    className={`px-3 py-1 rounded-full border transition-all ${
                      caracteristicasSeleccionadas.includes(car)
                        ? "bg-[#4B799B] text-white border-[#4B799B] shadow-md"
                        : "bg-white text-[#4B799B] border-[#4B799B] hover:bg-[#4B799B] hover:text-white"
                    } text-sm`}
                    onClick={() => handleToggleCaracteristica(car)}
                  >
                    {car}
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-[#2C3A61] bg-gray-50 rounded p-3">
                <span className="font-medium">Seleccionadas:</span>
                <br />
                <span className="text-[#4B799B] cursor-pointer hover:underline" 
                      onClick={() => setEditCaracteristicas(true)}>
                  {caracteristicasSeleccionadas.length > 0
                    ? caracteristicasSeleccionadas.join(", ")
                    : "Selecciona o escribe las características de tus mini bodegas"}
                </span>
              </div>
            </div>
          ) : (
            <textarea
              value={caracteristicas}
              onChange={e => onCaracteristicasChange(e.target.value)}
              placeholder="Ejemplo: Vigilancia 24/7, Acceso privado, Seguro incluido..."
              className="w-full p-3 rounded bg-white text-[#2C3A61] border resize-none"
              rows={4}
              onBlur={() => setEditCaracteristicas(false)}
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  );
}