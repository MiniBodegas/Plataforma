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
  const crearNotificacion = async (datos) => {
    try {
      console.log("⏳ Creando notificación con datos:", datos);
      
      // Validación de datos mínimos requeridos
      if (!datos.user_id || !datos.titulo || !datos.mensaje) {
        throw new Error("Faltan campos obligatorios para la notificación");
      }
      
      // Preparar parámetros para la función RPC
      const params = {
        receptor_id: datos.user_id,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        tipo: datos.tipo || 'sistema',
        empresa_id: datos.empresa_id || null,
        reserva_id: datos.reserva_id || null,
        emisor_id: datos.emisor_id || user?.id || null // Usar emisor_id proporcionado o el usuario actual
      };
      
      console.log("✅ Parámetros de notificación:", params);
      
      // Usar la función RPC para crear notificaciones
      const { data, error } = await supabase.rpc('crear_notificacion', params);
      
      if (error) {
        console.error("❌ Error insertando notificación:", error);
        throw error;
      }
      
      console.log("✅ Notificación creada exitosamente:", data);
      
      // Si la notificación es para el usuario actual, recargar contador
      if (user && datos.user_id === user.id) {
        cargarNotificaciones();
      }
      
      return { success: true };
    } catch (err) {
      console.error("❌ Error al crear notificación:", err);
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
