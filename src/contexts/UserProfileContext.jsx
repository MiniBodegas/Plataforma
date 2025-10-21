// contexts/UserProfileContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ProfileService } from '../services/ProfileService';
import { supabase } from '../lib/supabase';

const UserProfileContext = createContext({});

export function UserProfileProvider({ children }) {
  const { user, loading: authLoading, isProveedor } = useAuth();
  const [empresa, setEmpresa] = useState(null);
  const [minibodegas, setMinibodegas] = useState([]);
  const [minibodegasCount, setMinibodegasCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Solo cargar para proveedores
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
      
      // DEBUGGING: Intentar query directa primero
      const { data: directTest, error: directError } = await supabase
        .from('empresas')
        .select('id, nombre')
        .eq('user_id', user.id);
      
      if (directError) {
        setError(`Error directo: ${directError.message}`);
        return;
      }
      
      // Si el test directo funciona, usar ProfileService
      const empresaData = await ProfileService.getEmpresaByUserId(user.id);
      setEmpresa(empresaData);

      // Si tiene empresa, intentar cargar minibodegas
      if (empresaData) {
        try {
          // Cargar minibodegas con manejo de errores individual
          const minibodegasData = await ProfileService.getMinibodegasByEmpresa(empresaData.id);
          setMinibodegas(minibodegasData);

          // Intentar obtener conteo
          const count = await ProfileService.countMinibodegasActivas(empresaData.id);
          setMinibodegasCount(count);
          
        } catch (minibodegasError) {
          // No fallar todo el profile por este error
          setMinibodegas([]);
          setMinibodegasCount(0);
          
          // Solo mostrar error si es crítico
          if (minibodegasError.message.includes('permission') || 
              minibodegasError.message.includes('RLS') ||
              minibodegasError.message.includes('406')) {
            setError(`Error de permisos con minibodegas: ${minibodegasError.message}`);
          }
        }
      } else {
        setMinibodegas([]);
        setMinibodegasCount(0);
      }
      
    } catch (err) {
      // Manejar diferentes tipos de errores
      if (err.message.includes('406') || err.message.includes('Not Acceptable')) {
        setError('Error de permisos. Verifica la configuración de seguridad.');
      } else if (err.message.includes('401') || err.message.includes('JWT')) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else if (!err.message.includes('Could not find') && !err.message.includes('PGRST116')) {
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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = () => {
    if (!empresa) return false;
    
    const requiredFields = [
  
      'camara_comercio',
      'correo_contacto',
      'rut'
    ];
    for (const field of requiredFields) {
      const value = empresa[field];
      if (!value || value.toString().trim() === '') {
        console.log('Campo faltante o vacío:', field, value);
        return false;
      }
    }
    return true;
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