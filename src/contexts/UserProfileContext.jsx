// contexts/UserProfileContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ProfileService } from '../services/ProfileService';

const UserProfileContext = createContext({});

export function UserProfileProvider({ children }) {
  const { user, loading: authLoading, isProveedor } = useAuth();
  const [empresa, setEmpresa] = useState(null);
  const [minibodegas, setMinibodegas] = useState([]);
  const [minibodegasCount, setMinibodegasCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solo ejecutar cuando auth loading termine y tengamos un usuario proveedor
    if (!authLoading && user && isProveedor()) {
      loadProfile();
    } else if (!authLoading && (!user || !isProveedor())) {
      // Limpiar estado si no hay usuario o no es proveedor
      setEmpresa(null);
      setMinibodegas([]);
      setMinibodegasCount(0);
      setLoading(false);
    }
  }, [user, authLoading, isProveedor]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const empresaData = await ProfileService.getEmpresaByUserId(user.id);
      setEmpresa(empresaData);

      // Si tiene empresa, cargar sus minibodegas
      if (empresaData) {
        const [minibodegasData, count] = await Promise.all([
          ProfileService.getMinibodegasByEmpresa(empresaData.id),
          ProfileService.countMinibodegasActivas(empresaData.id)
        ]);
        
        setMinibodegas(minibodegasData);
        setMinibodegasCount(count);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
      // Solo mostrar error si no es "no encontrado"
      if (!err.message.includes('Could not find') && !err.message.includes('PGRST116')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresa = async (empresaData) => {
    try {
      setLoading(true);
      setError(null);

      const updatedEmpresa = await ProfileService.updateEmpresa(empresa.id, empresaData);
      setEmpresa(updatedEmpresa);
      
      return updatedEmpresa;
    } catch (err) {
      console.error('Error actualizando empresa:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEmpresa = async (empresaData) => {
    try {
      setLoading(true);
      setError(null);

      const newEmpresa = await ProfileService.createEmpresa({
        ...empresaData,
        user_id: user.id
      });
      
      setEmpresa(newEmpresa);
      return newEmpresa;
    } catch (err) {
      console.error('Error creando empresa:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = () => {
    if (!empresa) return false;
    
    const requiredFields = [
      'nombre',
      'descripcion', 
      'ciudad',
      'direccion_principal',
      'nombre_representante',
      'celular',
      'camara_comercio',
      'rut'
    ];

    return requiredFields.every(field => {
      const value = empresa[field];
      return value && value.toString().trim() !== '';
    });
  };

  const hasMinibodegas = () => {
    return minibodegasCount > 0;
  };

  const value = {
    empresa,
    minibodegas,
    minibodegasCount,
    loading,
    error,
    loadProfile,
    updateEmpresa,
    createEmpresa,
    isProfileComplete,
    hasMinibodegas,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile debe ser usado dentro de UserProfileProvider');
  }
  return context;
};