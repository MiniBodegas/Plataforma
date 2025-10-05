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
      
      // Forma correcta de contar notificaciones
      const { data, error } = await supabase
        .from('notificaciones')
        .select('id') // Solo seleccionamos ID para eficiencia
        .eq('user_id', user.id)
        .eq('leida', false);
      
      if (error) throw error;
      
      // Contar resultados
      setNotificaciones(data?.length || 0);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función clave: crear notificación
  const crearNotificacion = async (datos) => {
    try {
      console.log("⏳ Creando notificación con datos:", datos);
      
      // Validación de datos mínimos requeridos
      if (!datos.user_id || !datos.titulo || !datos.mensaje) {
        throw new Error("Faltan campos obligatorios para la notificación");
      }
      
      const { data, error } = await supabase
        .from('notificaciones')
        .insert([{
          user_id: datos.user_id,
          empresa_id: datos.empresa_id || null,
          tipo: datos.tipo || 'sistema',
          titulo: datos.titulo,
          mensaje: datos.mensaje,
          reserva_id: datos.reserva_id || null,
          leida: false
        }]);
      
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

  // Marcar como leída
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

  // Cargar notificaciones al montar y cuando cambia el usuario
  useEffect(() => {
    cargarNotificaciones();
    
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