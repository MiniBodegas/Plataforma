import { useState, useEffect, useCallback } from 'react';
import { userRolesService } from '../services/userServiceRoles';

export function useUserRoles() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await userRolesService.getAllUsers();
    
    if (err) {
      setError(err);
    } else {
      setUsuarios(data || []);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ✅ Cambiado: ahora assignRole acepta email o userId
  const assignRole = async (emailOrUserId, role, createdBy) => {
    // Si es un email, usar assignRoleByEmail
    if (emailOrUserId.includes('@')) {
      const { data, error: err } = await userRolesService.assignRoleByEmail(emailOrUserId, role, createdBy);
      if (!err) await loadUsers();
      return { data, error: err };
    }
    
    // Si es un ID, usar assignRole normal
    const { data, error: err } = await userRolesService.assignRole(emailOrUserId, role, createdBy);
    if (!err) await loadUsers();
    return { data, error: err };
  };

  const removeRole = async (userId) => {
    const { data, error: err } = await userRolesService.removeRole(userId);
    if (!err) await loadUsers();
    return { data, error: err };
  };

  return {
    usuarios,
    loading,
    error,
    loadUsers,
    assignRole,
    removeRole
  };
}