// components/FormularioEmpresa/DocumentoEstado.jsx
import { useState } from "react";
import { descargarArchivo, obtenerUrlVistaPrevia } from "../../utils/archivoUtils";

export function DocumentoEstado({ tipo, archivo, empresaId }) {
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [cargandoVista, setCargandoVista] = useState(false);

  const mostrarVistaPrevia = async () => {
    if (!archivo || cargandoVista) return;
    
    setCargandoVista(true);
    try {
      const url = await obtenerUrlVistaPrevia(empresaId, tipo, archivo.name);
      if (url) {
        setVistaPrevia(url);
        setTimeout(() => setVistaPrevia(null), 240000);
      }
    } catch (error) {
      console.error('Error mostrando vista previa:', error);
    } finally {
      setCargandoVista(false);
    }
  };

  if (!archivo) return null;

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Documento actual:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={mostrarVistaPrevia}
            disabled={cargandoVista}
            className="text-[#4B799B] hover:underline text-sm disabled:opacity-50"
          >
            {cargandoVista ? 'Cargando...' : 'Vista previa'}
          </button>
          <button
            type="button"
            onClick={() => descargarArchivo(empresaId, tipo, archivo.name)}
            className="text-[#4B799B] hover:underline text-sm"
          >
            Descargar
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-800 mb-2">{archivo.name}</p>
      <p className="text-xs text-gray-500">
        Subido: {new Date(archivo.created_at || archivo.updated_at).toLocaleDateString()}
      </p>
      
      {vistaPrevia && (
        <div className="mt-3">
          <iframe
            src={vistaPrevia}
            className="w-full h-40 border border-gray-200 rounded"
            title={`Vista previa ${tipo}`}
          />
          <button
            onClick={() => setVistaPrevia(null)}
            className="text-xs text-gray-500 hover:text-gray-700 mt-1"
          >
            Cerrar vista previa
          </button>
        </div>
      )}
    </div>
  );
}