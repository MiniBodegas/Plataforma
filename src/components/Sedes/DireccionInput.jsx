import { useState } from "react";

export function DireccionInput({ 
  ciudad, 
  direccion, 
  onDireccionChange, 
  onCoordenadaChange,
  required = false,
  className = ""
}) {
  const [loading, setLoading] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null);
  const [error, setError] = useState(null);

  // Función para formatear direcciones colombianas a diferentes formatos
  const formatearDireccionesAlternativas = (direccion, ciudad) => {
    const dir = direccion.trim();
    
    const patterns = [
      dir,
      dir.replace(/#/g, ' No. '),
      dir.replace(/#/g, ' ').replace(/-/g, ' '),
      dir.replace(/[#\-]/g, ' ').replace(/\s+/g, ' '),
      dir.replace(/#/, ', '),
    ];

    return patterns.map(pattern => ({
      query: `${pattern}, ${ciudad}, Colombia`,
      formato: pattern
    }));
  };

  // Geocodificar con Nominatim
  const geocodificarConNominatim = async (queryText) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?` + 
        `format=json` +
        `&q=${encodeURIComponent(queryText)}` +
        `&limit=3` +
        `&countrycodes=co` +
        `&addressdetails=1` +
        `&extratags=1`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'MiniBodegas-App' }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const mejorResultado = data.sort((a, b) => b.importance - a.importance)[0];
        
        return {
          lat: parseFloat(mejorResultado.lat),
          lng: parseFloat(mejorResultado.lon),
          importance: mejorResultado.importance,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error Nominatim:', error);
      return null;
    }
  };

  // Geocodificar con LocationIQ
  const geocodificarConLocationIQ = async (queryText) => {
    try {
      const API_KEY = 'pk.a89d82eb73133eb7acd59ca5c87a9af0';
      
      const url = `https://us1.locationiq.com/v1/search?` +
        `key=${API_KEY}` +
        `&q=${encodeURIComponent(queryText)}` +
        `&format=json` +
        `&countrycodes=co` +
        `&limit=3` +
        `&addressdetails=1`;
      
      const response = await fetch(url);
      
      if (response.status === 429) {
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          importance: data[0].importance,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error LocationIQ:', error);
      return null;
    }
  };

  // Geocodificar con múltiples estrategias
  const geocodificarDireccion = async () => {
    if (!direccion || !ciudad) {
      setError('Por favor ingresa ciudad y dirección');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formatos = formatearDireccionesAlternativas(direccion, ciudad);
      const resultados = [];
      
      // Intentar con cada formato
      for (const { query } of formatos) {
        // 1. Intentar con Nominatim
        const nominatim = await geocodificarConNominatim(query);
        if (nominatim) {
          resultados.push(nominatim);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 2. Intentar con LocationIQ
        const locationiq = await geocodificarConLocationIQ(query);
        if (locationiq) {
          resultados.push(locationiq);
        }
        
        // Si ya encontramos resultados con buena importancia, parar
        if (resultados.length > 0 && resultados.some(r => r.importance > 0.5)) {
          break;
        }
      }
      
      // Seleccionar el mejor resultado
      if (resultados.length > 0) {
        const mejorResultado = resultados.sort((a, b) => 
          (b.importance || 0) - (a.importance || 0)
        )[0];
        
        const coords = {
          lat: mejorResultado.lat,
          lng: mejorResultado.lng
        };
        
        setCoordenadas(coords);
        onCoordenadaChange && onCoordenadaChange(coords);
        setError(null);
        
        return coords;
      } else {
        setError('No se encontró la dirección. Ajústala manualmente en el mapa.');
        setCoordenadas(null);
        onCoordenadaChange && onCoordenadaChange(null);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error geocodificando:', error);
      setError('Error al buscar la ubicación');
      setCoordenadas(null);
      onCoordenadaChange && onCoordenadaChange(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-semibold text-[#2C3A61]">
          Dirección {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            className={`flex-1 p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${coordenadas ? 'border-green-500' : ''}`}
            value={direccion}
            onChange={(e) => {
              onDireccionChange(e.target.value);
              setError(null);
              setCoordenadas(null);
              onCoordenadaChange && onCoordenadaChange(null);
            }}
            placeholder="Ej: Calle 18 #122-135"
            required={required}
          />
          
          <button
            type="button"
            onClick={geocodificarDireccion}
            disabled={loading || !direccion || !ciudad}
            className="px-4 py-3 bg-[#2C3A61] text-white rounded-xl font-semibold hover:bg-[#1d2742] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <span className="animate-spin">🔄</span>
                Buscando...
              </>
            ) : (
              <>
                <span>🔍</span>
                Buscar
              </>
            )}
          </button>
        </div>

        {/* Mensaje de ayuda */}
        {!ciudad && direccion && (
          <p className="text-xs text-orange-600 flex items-center gap-1">
            <span>⚠️</span>
            Selecciona primero la ciudad
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}

        {/* Confirmación simple */}
        {coordenadas && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span>✓</span>
            Ubicación encontrada. Ajústala en el mapa si es necesario.
          </p>
        )}
      </div>
    </div>
  );
}