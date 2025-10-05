import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useNotifications() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    if (!user) {
      setNotificaciones(0);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // ¡CORREGIDO! La forma correcta de contar registros en Supabase
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('leida', false);
      
      if (error) throw error;
      
      // Obtener el conteo desde data.count
      setNotificaciones(data.length || 0);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Marcar una notificación como leída
  const marcarComoLeida = async (id) => {
    if (!user) return;
    
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id);
      
      // Recargar para actualizar el contador
      cargarNotificaciones();
    } catch (err) {
      console.error("Error al marcar como leída:", err);
      setError(err.message);
    }
  };

  // Marcar todas como leídas
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
      console.error("Error al marcar todas como leídas:", err);
      setError(err.message);
    }
  };

  // Crear una nueva notificación
  const crearNotificacion = async (datos) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .insert([datos]);
      
      if (error) throw error;
      
      // Recargar para actualizar el contador si la notificación es para el usuario actual
      if (datos.user_id === user?.id) {
        cargarNotificaciones();
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error al crear notificación:", err);
      return { success: false, error: err };
    }
  };

  // Cargar notificaciones al montar el componente y cuando cambia el usuario
  useEffect(() => {
    cargarNotificaciones();
    
    // Actualizar cada minuto
    const interval = setInterval(() => {
      cargarNotificaciones();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Retorna los datos y funciones necesarias
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