// components/PerfilProveedor/ChecklistProgreso.jsx
import { useNavigate } from "react-router-dom";
import { useProgresoProveedor } from "../hooks/useProgresoProveedor";

export function ChecklistProgreso() {
  const navigate = useNavigate();
  const { 
    perfilCompleto, 
    primerMinibodega, 
    pagosConfigurados, 
    loading, 
    porcentajeProgreso 
  } = useProgresoProveedor();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const items = [
    {
      titulo: 'Completar perfil',
      completado: perfilCompleto,
      accion: () => navigate('/completar-formulario-proveedor'),
      deshabilitado: false
    },
    {
      titulo: 'Crear MiniBodega',
      completado: primerMinibodega,
      accion: () => navigate('/bodega-editor-proveedor'),
      deshabilitado: !perfilCompleto
    },
    {
      titulo: 'Configurar pagos',
      completado: pagosConfigurados,
      accion: () => navigate('/configurar-pagos'),
      deshabilitado: !perfilCompleto
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#2C3A61]">Configuración</h3>
        <span className="text-xs text-gray-500">{porcentajeProgreso}%</span>
      </div>
      
      {/* Barra de progreso compacta */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
        <div 
          className="bg-[#4B799B] h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${porcentajeProgreso}%` }}
        ></div>
      </div>

      {/* Lista compacta */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                item.completado ? 'bg-green-500' : item.deshabilitado ? 'bg-gray-300' : 'bg-gray-200'
              }`}>
                {item.completado && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${
                item.deshabilitado ? 'text-gray-400' : 'text-gray-700'
              }`}>
                {item.titulo}
              </span>
            </div>
            
            <button
              onClick={item.accion}
              disabled={item.deshabilitado}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                item.completado
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : item.deshabilitado
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#4B799B] text-white hover:bg-blue-700'
              }`}
            >
              {item.completado ? 'Ver' : 'Ir'}
            </button>
          </div>
        ))}
      </div>

      {/* Mensaje de éxito compacto */}
      {porcentajeProgreso === 100 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
          <span className="text-green-700 text-xs font-medium">✅ ¡Configuración completa!</span>
        </div>
      )}
    </div>
  );
}