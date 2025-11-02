import { getEstadoColor, getEstadoTexto, formatPrecio, getMetrajeText } from './Helpers';
import { useState } from 'react';

// Componente para la imagen de la bodega
function BodegaImage({ imagen_url, nombre }) {
  let imageUrl = null;
  
  try {
    if (imagen_url) {
      if (typeof imagen_url === 'string') {
        // Check if it's a JSON string
        if (imagen_url.startsWith('[')) {
          const parsed = JSON.parse(imagen_url);
          imageUrl = Array.isArray(parsed) ? parsed[0] : null;
        } else {
          imageUrl = imagen_url;
        }
      }
    }
  } catch (error) {
    console.error('Error parsing image URL:', error);
  }

  return (
    <div className="w-24 h-24 flex-shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={nombre || "Mini bodega"}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150?text=Sin+imagen';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">Sin imagen</span>
        </div>
      )}
    </div>
  );
}

// Componente para la información de la bodega
function BodegaInfo({ bodega }) {
  const formatearPrecio = (precio) => {
    if (!precio) return '$ 0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  return (
    <div className="flex-grow">
      <h3 className="text-lg font-semibold text-[#2C3A61]">
        {bodega.nombre_personalizado || 
          `${bodega.metraje}m² - ${bodega.descripcion || 'Mini Bodega'}`}
      </h3>
      <div className="text-sm text-gray-600 mt-1">
        <p className="flex gap-2">
          <span className="font-medium">Sede:</span>
          {bodega.sede?.nombre || 'Sin sede'}
        </p>
        <p className="flex gap-2">
          <span className="font-medium">Ciudad:</span>
          {bodega.ciudad || 'No especificada'}
        </p>
        <p className="mt-1 font-medium text-[#2C3A61]">
          Precio mensual: {formatearPrecio(Number(bodega.precio_mensual))}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs ${getEstadoColor(bodega.estado)}`}>
            {getEstadoTexto(bodega.estado)}
          </span>
          {bodega.cantidad > 1 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {bodega.cantidad} unidades
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para las acciones de la bodega
function BodegaActions({ bodega, onEdit, onStatusChange }) {
  const [procesando, setProcesando] = useState(false);

  const handleStatusChange = async (nuevoEstado) => {
    try {
      setProcesando(true);
      console.log(`🎯 Bodega ID: ${bodega.id}, Estado actual: ${bodega.estado}, Nuevo estado: ${nuevoEstado}`);
      
      await onStatusChange(bodega.id, nuevoEstado);
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Debug info */}
      <div className="text-xs text-gray-500 border p-1 rounded">
        ID: {bodega.id}<br/>
        Estado: {bodega.estado}
      </div>

      <button
        onClick={() => onEdit(bodega)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
        disabled={procesando}
      >
        Modificar
      </button>

      {bodega.estado === 'activa' ? (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          onClick={() => handleStatusChange('inhabilitada')}
          disabled={procesando}
        >
          {procesando ? 'Procesando...' : 'Inhabilitar'}
        </button>
      ) : (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
          onClick={() => handleStatusChange('activa')}
          disabled={procesando}
        >
          {procesando ? 'Procesando...' : 'Habilitar'}
        </button>
      )}
    </div>
  );
}

// Componente principal BodegaCard
export function BodegaCard({ bodega, onEdit, onStatusChange }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-6">
        <BodegaImage 
          imagen_url={bodega.imagen_url} 
          nombre={bodega.nombre_personalizado} 
        />
        <BodegaInfo bodega={bodega} />
        <BodegaActions 
          bodega={bodega}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}