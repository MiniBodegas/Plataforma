export function ConfiguracionTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Configuración del Sistema</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">General</h4>
          <p className="text-gray-600 text-sm">
            Configuraciones generales de la plataforma
          </p>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Notificaciones</h4>
          <p className="text-gray-600 text-sm">
            Gestiona las notificaciones del sistema
          </p>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Seguridad</h4>
          <p className="text-gray-600 text-sm">
            Configuración de seguridad y permisos
          </p>
        </div>
      </div>
    </div>
  );
}
