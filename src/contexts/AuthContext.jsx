import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error en getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ✅ AGREGAR función signIn
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error en signIn:', error);
        return { data: null, error };
      }

      return { data, error: null };
      
    } catch (error) {
      console.error('Error inesperado en signIn:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // ✅ AGREGAR función signUp
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata // Para guardar user_type
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Error en signUp:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserType = () => {
    return user?.user_metadata?.user_type || null;
  };

  const isProveedor = () => {
    return getUserType() === 'proveedor';
  };

  const isUsuario = () => {
    return getUserType() === 'usuario';
  };

  const value = {
    user,
    session,
    loading,
    signIn,     // ✅ Agregar
    signUp,     // ✅ Agregar
    signOut,
    getUserType,
    isProveedor,
    isUsuario,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};