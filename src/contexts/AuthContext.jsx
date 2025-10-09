import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // Nuevo estado

  useEffect(() => {
    // Obtener tipo de usuario guardado
    const savedUserType = localStorage.getItem('userType');
    if (savedUserType) {
      setUserType(savedUserType);
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Determinar tipo de usuario después del login
      if (data.user) {
        await determinarTipoUsuario(data.user);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para determinar tipo de usuario
  const determinarTipoUsuario = async (user) => {
    try {
      // Verificar si tiene empresa (es proveedor)
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const tipo = empresa && !error ? 'proveedor' : 'usuario';
      setUserType(tipo);
      localStorage.setItem('userType', tipo);
      
      console.log('🏷️ Tipo de usuario determinado:', tipo);
      
    } catch (error) {
      console.log('Error determinando tipo usuario, asumiendo usuario normal');
      setUserType('usuario');
      localStorage.setItem('userType', 'usuario');
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Obtener tipo de usuario antes de limpiar
      const currentUserType = userType || localStorage.getItem('userType') || 'usuario';
      
      // Intentar logout de Supabase
      let { error } = await supabase.auth.signOut();
      
      if (error && error.message?.includes('403')) {
        console.warn('Logout global falló, intentando logout local...');
        ({ error } = await supabase.auth.signOut({ scope: 'local' }));
      }
      
      if (error) {
        console.warn('Logout de Supabase falló, forzando logout local:', error);
      }
      
    } catch (err) {
      console.error('Error en signOut:', err);
    } finally {
      // Limpiar estado de la aplicación
      setUser(null);
      setUserType(null);
      setLoading(false);
      
      // Limpiar localStorage (excepto userType temporalmente)
      const tempUserType = userType || localStorage.getItem('userType') || 'usuario';
      
      try {
        localStorage.removeItem('redirectAfterLogin');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.token') || 
              key.startsWith('sb-') || 
              key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.warn('Error limpiando localStorage:', storageError);
      }
      
      // Redirigir según el tipo de usuario
      const redirectUrl = tempUserType === 'proveedor' ? '/home-proveedor' : '/';
      
      console.log('🔄 Redirigiendo a:', redirectUrl, 'para tipo:', tempUserType);
      
      // Limpiar userType después de obtener la URL
      localStorage.removeItem('userType');
      
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    }
  };

  // Nueva función para establecer tipo de usuario manualmente
  const setUserTypeManually = (tipo) => {
    setUserType(tipo);
    localStorage.setItem('userType', tipo);
  };

  const value = {
    user,
    userType,
    loading,
    signUp,
    signIn,
    signOut,
    setUserTypeManually,
    determinarTipoUsuario
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}