import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error obteniendo sesión:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error en getInitialSession:', error);
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Auth event:', event);
        }
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        // Asegurar que loading sea false después de cualquier evento
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  // Memoizar funciones para evitar re-renders
  const authMethods = useMemo(() => ({
    getUserType: () => user?.user_metadata?.user_type || null,
    isProveedor: () => user?.user_metadata?.user_type === 'proveedor',
    isUsuario: () => user?.user_metadata?.user_type === 'usuario',
  }), [user?.user_metadata?.user_type]);

  // Memoizar el value del context
  const value = useMemo(() => ({
    user,
    session,
    loading,
    signOut,
    ...authMethods,
  }), [user, session, loading, authMethods]);

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