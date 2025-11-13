import { X, MapPin, Ruler, Package, DollarSign, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function MiniBodegaModal({ bodega, warehouse, onClose, companyName }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!bodega) return null;

  // ✅ Obtener todas las imágenes disponibles (imagen_url es siempre string en tu DB)
  const images = (() => {
    const imgs = [];
    
    // Imagen principal de la bodega desde la DB
    if (bodega.imagen_url) {
      imgs.push(bodega.imagen_url);
    }
    
    // Imagen del objeto transformado (fallback)
    if (bodega.image && bodega.image !== bodega.imagen_url) {
      imgs.push(bodega.image);
    }
    
    // Imágenes de la empresa/warehouse como fallback
    if (imgs.length === 0 && warehouse?.images && Array.isArray(warehouse.images)) {
      imgs.push(...warehouse.images);
    }
    
    // Imagen por defecto si no hay ninguna
    if (imgs.length === 0) {
      imgs.push("https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop");
    }
    
    // Eliminar duplicados
    return [...new Set(imgs)];
  })();

  // ✅ Datos normalizados de la DB - LIMPIANDO LOS VALORES
  const datosDB = {
    id: bodega.id,
    metraje: bodega.metraje || bodega.tamaño,
    descripcion: bodega.descripcion || bodega.description,
    precio_mensual: bodega.precio_mensual || bodega.precio,
    disponible: Boolean(bodega.disponible), // ✅ Convertir a boolean explícito
    ciudad: bodega.ciudad || bodega.city,
    direccion: bodega.address,
    cantidad: bodega.cantidad || 1,
    nombre_personalizado: bodega.nombre_personalizado,
    ubicacion_interna: bodega.ubicacion_interna,
    metros_cuadrados: bodega.metros_cuadrados,
    caracteristicas: Array.isArray(bodega.caracteristicas) ? bodega.caracteristicas : [],
    estado: String(bodega.estado || '').toLowerCase().trim(), // ✅ Normalizar estado
    motivo_no_disponible: bodega.motivo_no_disponible,
    empresa_id: bodega.empresa_id,
    sede_id: bodega.sede_id
  };


  const handleReservar = () => {
    // Verificar disponibilidad
    if (!datosDB.disponible) {
      alert(`Esta mini bodega no está disponible.\n\nMotivo: ${datosDB.motivo_no_disponible || 'No especificado'}`);
      return;
    }

    navigate('/reservas', {
      state: {
        bodegaSeleccionada: {
          // Datos para el proceso de reserva
          id: datosDB.id,
          name: warehouse?.name || companyName,
          location: `${datosDB.ciudad || 'Ciudad'}, ${datosDB.zona || 'Zona'}`,
          city: datosDB.ciudad,
          zone: datosDB.zona,
          address: datosDB.direccion || warehouse?.address,
          
          // Información de la bodega
          tamaño: datosDB.metraje,
          metros_cuadrados: datosDB.metros_cuadrados,
          precio: parseFloat(datosDB.precio_mensual),
          description: datosDB.descripcion,
          
          // Imágenes
          image: images[0],
          images: images,
          
          // Detalles adicionales
          nombre_personalizado: datosDB.nombre_personalizado,
          ubicacion_interna: datosDB.ubicacion_interna,
          caracteristicas: datosDB.caracteristicas,
          cantidad_disponible: datosDB.cantidad,
          
          // Datos de la empresa
          empresaId: datosDB.empresa_id,
          sedeId: datosDB.sede_id,
          features: warehouse?.features || [],
          rating: warehouse?.rating || 0,
          reviewCount: warehouse?.reviewCount || 0,
          
          // Estado
          available: datosDB.disponible,
          estado: datosDB.estado
        }
      }
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // ✅ Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ✅ Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) prevImage();
      if (e.key === 'ArrowRight' && images.length > 1) nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carrusel de imágenes */}
        <div className="relative h-64 sm:h-80 bg-gray-200 overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`${datosDB.nombre_personalizado || 'Mini bodega'} - ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Badge de disponibilidad - ✅ SUPER CORREGIDO */}
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold z-10 ${
            datosDB.disponible && datosDB.estado === 'activa'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {datosDB.disponible && datosDB.estado === 'activa' ? '✓ Disponible' : '✗ No disponible'}
          </div>

          {/* Badge de cantidad */}
          {datosDB.cantidad > 1 && (
            <div className="absolute top-4 right-16 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
              {datosDB.cantidad} unidades
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition z-10"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition z-10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 sm:p-8">
          {/* Título y precio */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#2C3A61] mb-2">
                {datosDB.nombre_personalizado || `Mini Bodega ${datosDB.metraje}m³`}
              </h2>
              <p className="text-gray-600">{companyName}</p>
              {datosDB.estado === 'inhabilitada' && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Bodega inhabilitada</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#2C3A61]">
                ${parseFloat(datosDB.precio_mensual).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">por mes</div>
            </div>
          </div>

          {/* Motivo no disponible */}
          {!datosDB.disponible && datosDB.motivo_no_disponible && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">No disponible</h4>
                  <p className="text-sm text-red-700">{datosDB.motivo_no_disponible}</p>
                </div>
              </div>
            </div>
          )}

          {/* Descripción */}
          {datosDB.descripcion && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {datosDB.descripcion}
              </p>
            </div>
          )}

          {/* Información en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Ubicación */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-[#4B799B]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3A61] mb-1">Ubicación</h3>
                <p className="text-sm text-gray-600">
                  {datosDB.ciudad}{datosDB.zona ? ` - ${datosDB.zona}` : ''}
                </p>
                {datosDB.direccion && datosDB.direccion !== 'Dirección disponible al reservar' && (
                  <p className="text-xs text-gray-500 mt-1">{datosDB.direccion}</p>
                )}
              </div>
            </div>

            {/* Tamaño */}
            <div className="flex items-start gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Ruler className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3A61] mb-1">Tamaño</h3>
                <p className="text-sm text-gray-600">{datosDB.metraje}m³</p>
                {datosDB.metros_cuadrados && (
                  <p className="text-xs text-gray-500 mt-1">
                    {datosDB.metros_cuadrados}m² de superficie
                  </p>
                )}
              </div>
            </div>

            {/* Ubicación interna */}
            {datosDB.ubicacion_interna && (
              <div className="flex items-start gap-3">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <Home className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3A61] mb-1">Ubicación interna</h3>
                  <p className="text-sm text-gray-600">{datosDB.ubicacion_interna}</p>
                </div>
              </div>
            )}

            {/* Cantidad disponible */}
            {datosDB.cantidad > 1 && (
              <div className="flex items-start gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3A61] mb-1">Unidades disponibles</h3>
                  <p className="text-sm text-gray-600">{datosDB.cantidad} bodegas de este tipo</p>
                </div>
              </div>
            )}
          </div>

          {/* Características */}
          {datosDB.caracteristicas && datosDB.caracteristicas.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-[#2C3A61] mb-3">Características</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {datosDB.caracteristicas.map((caracteristica, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{caracteristica}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features de la empresa */}
          {warehouse?.features && warehouse.features.length > 0 && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-[#2C3A61] mb-3">Servicios adicionales de la sede</h3>
              <div className="flex flex-wrap gap-2">
                {warehouse.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción - ✅ SUPER CORREGIDO */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReservar}
              disabled={!datosDB.disponible || datosDB.estado !== 'activa'}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                datosDB.disponible && datosDB.estado === 'activa'
                  ? 'bg-[#4B799B] hover:bg-[#3b5f7a] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              {datosDB.disponible && datosDB.estado === 'activa' ? 'Reservar ahora' : 'No disponible'}
            </button>
            <button
              onClick={onClose}
              className="sm:w-32 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500">
              ID: {datosDB.id?.substring(0, 8)}... | Estado: {datosDB.estado}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}