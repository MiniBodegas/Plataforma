import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useNotifications() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contar notificaciones no leídas (eficiente con count/head)
  const cargarNotificaciones = async () => {
    try {
      if (!user) {
        setNotificaciones(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const { count, error: errCount } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('leida', false);

      if (errCount) throw errCount;
      setNotificaciones(count || 0);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear notificación vía RPC crear_notificacion
  const crearNotificacion = async ({
    user_id,        // destinatario (UUID de auth.users.id)
    titulo,
    mensaje,
    tipo = 'sistema',     // usamos 'sistema' para no romper el CHECK
    empresa_id = null,
    reserva_id = null,
  }) => {
    try {
      const { data, error } = await supabase.rpc('crear_notificacion', {
        receptor_id: user_id,
        titulo,
        mensaje,
        tipo,
        empresa_id,
        reserva_id
      });

      if (error) {
        console.error('❌ Error insertando notificación (RPC):', error);
        return { success: false, error: error.message };
      }
      if (!data?.success) {
        console.error('❌ RPC devolvió error lógico:', data);
        return { success: false, error: data?.error || 'rpc_error' };
      }

      // Si el destinatario soy yo, refresco contador
      if (user && user.id === user_id) {
        cargarNotificaciones();
      }

      return { success: true, id: data.notificacion_id };
    } catch (err) {
      console.error('❌ Error al crear notificación (catch):', err);
      return { success: false, error: err.message };
    }
  };

  const marcarComoLeida = async (id) => {
    if (!user) return;
    try {
      await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
      cargarNotificaciones();
    } catch (err) {
      console.error('Error al marcar como leída:', err);
      setError(err.message);
    }
  };

  const marcarTodasComoLeidas = async () => {
    if (!user) return;
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user.id)
        .eq('leida', false);
      setNotificaciones(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    notificaciones,
    loading,
    error,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    crearNotificacion
  };
}
