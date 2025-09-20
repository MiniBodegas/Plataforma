import { useState, useRef } from "react";
import { Pencil, Image, X, Save, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export function BodegaCarruselEditor({
  empresaId = null, // ID de la empresa si ya existe
  empresa,
  onEmpresaChange,
  imagenes: initialImagenes = [],
  onImagenesChange,
  onSave // Callback cuando se guarde exitosamente
}) {
  const [editEmpresa, setEditEmpresa] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef(null);
  const [imagenes, setImagenes] = useState(initialImagenes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Función para subir múltiples imágenes a Supabase Storage
  const uploadImages = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `carrusel/${fileName}`;

        const { data, error } = await supabase.storage
          .from('imagenes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('imagenes')
          .getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error(`Error uploading image ${index}:`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null); // Filtrar URLs exitosas
  };

  // Función para guardar empresa y carrusel en Supabase
  const handleSaveCarrusel = async () => {
    setSaving(true);
    
    try {
      console.log('Guardando carrusel...');
      
      // Validar datos
      if (!empresa?.trim()) {
        alert('Por favor ingresa el nombre de la empresa');
        return;
      }

      if (!imagenes || imagenes.length === 0) {
        alert('Por favor agrega al menos una imagen');
        return;
      }

      // 1. Guardar o actualizar empresa
      let empresaData;
      if (empresaId) {
        // Actualizar empresa existente
        const { data, error } = await supabase
          .from('empresas')
          .update({ nombre: empresa.trim() })
          .eq('id', empresaId)
          .select();
        
        if (error) throw error;
        empresaData = data[0];
      } else {
        // Crear nueva empresa
        const { data, error } = await supabase
          .from('empresas')
          .insert([{
            nombre: empresa.trim(),
            ciudad: 'Bogotá' // Por defecto
          }])
          .select();
        
        if (error) throw error;
        empresaData = data[0];
      }

      console.log('Empresa guardada:', empresaData);

      // 2. Subir imágenes al storage
      const imagenesFile = imagenes.filter(img => typeof img !== 'string'); // Solo archivos nuevos
      const imagenesUrl = imagenes.filter(img => typeof img === 'string'); // URLs existentes

      let nuevasUrls = [];
      if (imagenesFile.length > 0) {
        console.log('Subiendo imágenes...');
        nuevasUrls = await uploadImages(imagenesFile);
      }

      const todasLasUrls = [...imagenesUrl, ...nuevasUrls];
      console.log('URLs de imágenes:', todasLasUrls);

      // 3. Limpiar registros existentes del carrusel si es actualización
      if (empresaId) {
        await supabase
          .from('carrusel_imagenes')
          .delete()
          .eq('empresa_id', empresaData.id);
      }

      // 4. Guardar imágenes del carrusel en la base de datos
      if (todasLasUrls.length > 0) {
        const carruselData = todasLasUrls.map((url, index) => ({
          empresa_id: empresaData.id,
          imagen_url: url,
          orden: index,
          alt_text: `Imagen ${index + 1} de ${empresa}`
        }));

        const { error: carruselError } = await supabase
          .from('carrusel_imagenes')
          .insert(carruselData);

        if (carruselError) throw carruselError;
      }

      console.log('Carrusel guardado exitosamente');
      setSaved(true);

      // Callback para el componente padre
      if (onSave) {
        onSave({
          empresa: empresaData,
          imagenes: todasLasUrls
        });
      }

      // Resetear estado después de 3 segundos
      setTimeout(() => setSaved(false), 3000);

    } catch (error) {
      console.error('Error guardando carrusel:', error);
      alert(`Error al guardar el carrusel: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Maneja la carga de imágenes y genera previews
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = [...(imagenes || []), ...files];
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

  return (
    <div className="border-2 border-gray-590 rounded-xl mb-8 mx-auto max-w-7xl pb-16 min-h-[150px] flex flex-col justify-between">
      <div className="bg-[#E9E9E9] min-h-[350px] rounded-xl flex flex-col justify-center items-center relative" style={{ height: 260 }}>
        {/* Previsualización de imagen */}
        {imagenes && imagenes.length > 0 ? (
          <>
            <img
              src={typeof imagenes[activeIndex] === 'string' 
                ? imagenes[activeIndex] 
                : URL.createObjectURL(imagenes[activeIndex])
              }
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
          accept="image/*"
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
                    src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                    alt={`mini-${i}`}
                    className="object-cover w-full h-full"
                  />
                </button>
                <span className="text-xs text-[#2C3A61] mt-1 max-w-[80px] truncate" 
                      title={typeof img === 'string' ? `Imagen ${i + 1}` : img.name}>
                  {typeof img === 'string' ? `Img ${i + 1}` : img.name}
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
          <div className="flex items-center justify-center w-full mb-4">
            <span className="text-[#2C3A61] text-xl font-medium flex-1">
              {empresa || "Ingresa el nombre de tu empresa"}
            </span>
            <button type="button" onClick={() => setEditEmpresa(true)}>
              <Pencil className="ml-2 h-5 w-5 text-[#2C3A61]" />
            </button>
          </div>
        )}

        {/* Botón guardar carrusel */}
        <button
          className={`w-full max-w-md py-2 px-4 rounded-xl font-bold transition flex items-center justify-center ${
            saved 
              ? 'bg-green-500 text-white' 
              : 'bg-[#2C3A61] text-white hover:bg-[#4B799B]'
          }`}
          onClick={handleSaveCarrusel}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              ¡Guardado!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Carrusel
            </>
          )}
        </button>
        
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