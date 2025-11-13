import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserRoles } from '../../../hooks/useUserRole';
import { 
  UserPlus, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react';

export function UsuariosTab() {
  const { user: currentUser } = useAuth();
  // ✅ Eliminar inviteUser de la destructuración
  const { usuarios, loading, error, assignRole, removeRole, loadUsers } = useUserRoles();
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('usuario');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage(null);

    // ✅ Cambiar inviteUser por assignRole (acepta email)
    const { data, error: err } = await assignRole(inviteEmail, inviteRole, currentUser.id);

    if (err) {
      setMessage({ type: 'error', text: err });
    } else {
      setMessage({ 
        type: 'success', 
        text: `Rol ${inviteRole} asignado correctamente a ${inviteEmail}` 
      });
      setInviteEmail('');
      setInviteRole('usuario');
      setShowInviteForm(false);
    }

    setProcessing(false);
  };

  const handleEditRole = (userId, currentRole) => {
    setEditingUserId(userId);
    setEditingRole(currentRole);
  };

  const handleSaveRole = async (userId) => {
    setProcessing(true);
    const { error: err } = await assignRole(userId, editingRole, currentUser.id);
    
    if (err) {
      setMessage({ type: 'error', text: err });
    } else {
      setMessage({ type: 'success', text: 'Rol actualizado correctamente' });
      setEditingUserId(null);
    }
    
    setProcessing(false);
  };

  const handleRemoveRole = async (userId, userEmail) => {
    if (!window.confirm(`¿Eliminar rol de ${userEmail}? Volverá a ser usuario normal.`)) {
      return;
    }

    setProcessing(true);
    const { error: err } = await removeRole(userId);
    
    if (err) {
      setMessage({ type: 'error', text: err });
    } else {
      setMessage({ type: 'success', text: 'Rol eliminado correctamente' });
    }
    
    setProcessing(false);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-red-100 text-red-700', icon: Shield },
      empresa: { color: 'bg-blue-100 text-blue-700', icon: User },
      usuario: { color: 'bg-gray-100 text-gray-700', icon: User },
      auth_only: { color: 'bg-purple-100 text-purple-700', icon: Shield }
    };

    const badge = badges[role] || badges.usuario;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {role === 'auth_only' ? 'Solo Auth' : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[#4B799B] border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <p>Error al cargar usuarios: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón asignar rol */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2C3A61]">Gestión de Usuarios</h2>
            <p className="text-gray-600 mt-1">
              Total: {usuarios.length} usuarios | Admins: {usuarios.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="flex items-center gap-2 bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Asignar Rol
          </button>
        </div>

        {/* Mensajes */}
        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg mb-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Formulario de asignación de rol */}
        {showInviteForm && (
          <form onSubmit={handleInviteUser} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B799B] focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B799B] focus:border-transparent bg-white"
                >
                  <option value="usuario">Usuario</option>
                  <option value="empresa">Empresa</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processing}
                className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? 'Asignando...' : 'Asignar Rol'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{usuario.email}</div>
                        <div className="text-xs text-gray-500">{usuario.nombre}</div>
                        {usuario.id === currentUser.id && (
                          <span className="text-xs text-blue-600 font-medium">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 capitalize">{usuario.tipo?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === usuario.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="usuario">Usuario</option>
                        <option value="empresa">Empresa</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {getRoleBadge(usuario.role)}
                        {usuario.roles_multiples && usuario.roles_multiples.length > 1 && (
                          usuario.roles_multiples.slice(1).map((rol, idx) => (
                            <span key={idx}>{getRoleBadge(rol)}</span>
                          ))
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(usuario.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {editingUserId === usuario.id ? (
                        <>
                          <button
                            onClick={() => handleSaveRole(usuario.id)}
                            disabled={processing}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditRole(usuario.id, usuario.role)}
                            disabled={usuario.id === currentUser.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={usuario.id === currentUser.id ? 'No puedes editar tu propio rol' : 'Editar rol'}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveRole(usuario.id, usuario.email)}
                            disabled={usuario.id === currentUser.id || usuario.role === 'usuario'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              usuario.id === currentUser.id 
                                ? 'No puedes eliminar tu propio rol' 
                                : usuario.role === 'usuario'
                                ? 'Los usuarios normales no tienen rol asignado'
                                : 'Eliminar rol'
                            }
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
