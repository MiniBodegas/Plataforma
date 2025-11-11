import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function useAdminAccess(user) {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        if (!user?.id) {
          console.log('❌ No hay usuario logueado');
          if (!cancelled) navigate('/');
          return false;
        }

        console.log('🔍 Verificando permisos para user_id:', user.id);

        // ✅ Verificar rol desde la tabla
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('📊 Resultado de verificación:', { userRole, error });

        if (error) {
          console.error('❌ Error consultando rol:', error);
          if (!cancelled) {
            alert('Error verificando permisos: ' + error.message);
            navigate('/');
          }
          return false;
        }

        if (!userRole) {
          console.warn('⚠️ Usuario no tiene rol asignado');
          if (!cancelled) {
            alert('No tienes un rol asignado en el sistema');
            navigate('/');
          }
          return false;
        }

        if (userRole.role !== 'admin') {
          console.warn('⚠️ Usuario sin permisos de admin, rol actual:', userRole.role);
          if (!cancelled) {
            alert(`No tienes permisos de administrador.\nTu rol actual es: ${userRole.role}`);
            navigate('/');
          }
          return false;
        }

        console.log('✅ Acceso admin verificado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error inesperado verificando acceso:', error);
        if (!cancelled) {
          alert('Error inesperado: ' + error.message);
          navigate('/');
        }
        return false;
      }
    };

    checkAccess();
    return () => { cancelled = true; };
  }, [user?.id, navigate]);
}
