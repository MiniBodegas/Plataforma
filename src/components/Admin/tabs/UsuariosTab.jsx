export function UsuariosTab({ usuarios }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Gestión de Usuarios</h3>
      <p className="text-gray-600 mb-4">
        Administra roles y permisos de usuarios en el sistema.
      </p>
      <div className="space-y-4">
        {usuarios.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay usuarios para mostrar
          </p>
        ) : (
          usuarios.map((usuario) => (
            <div key={usuario.id} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800">{usuario.email}</p>
              <p className="text-sm text-gray-500">{usuario.role}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
