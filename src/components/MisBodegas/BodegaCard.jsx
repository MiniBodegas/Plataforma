import { getEstadoColor, getEstadoTexto, formatPrecio, getMetrajeText } from './Helpers';
import { useState } from 'react';

// Componente para la imagen de la bodega
function BodegaImage({ imagen_url, nombre }) {
  // Asegurarse de que la URL de la imagen sea válida
  const imageUrl = imagen_url ? 
    (Array.isArray(JSON.parse(imagen_url)) ? 
      JSON.parse(imagen_url)[0] : 
      imagen_url
    ) : null;

  return (
    <div className="w-24 h-24 flex-shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={nombre || "Mini bodega"}
          className="w-full h-full object-cover rounded-lg"
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
          {bodega.ciudad}
        </p>
        <p className="flex gap-2">
          <span className="font-medium">Ubicación:</span>
          {bodega.ubicacion_interna || 'No especificada'}
        </p>
        <p className="mt-1 font-medium text-[#2C3A61]">
          Precio mensual: {formatPrecio(bodega.precio_mensual)}
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
    setProcesando(true);
    await onStatusChange(bodega.id, nuevoEstado);
    setProcesando(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onEdit(bodega)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
      >
        Modificar
      </button>

      <select
        className="border rounded-lg px-3 py-2 text-sm bg-white"
        value={bodega.estado}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={procesando}
      >
        <option value="activa">Activa</option>
        <option value="inhabilitada">Inhabilitada</option>
        <option value="ocupada">Ocupada</option>
        <option value="mantenimiento">Mantenimiento</option>
      </select>

      {bodega.estado === 'activa' ? (
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
          onClick={() => handleStatusChange('inhabilitada')}
          disabled={procesando}
        >
          Inhabilitar
        </button>
      ) : (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
          onClick={() => handleStatusChange('activa')}
          disabled={procesando}
        >
          Activar
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