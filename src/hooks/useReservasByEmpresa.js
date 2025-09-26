import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useReservasByEmpresa() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        console.log('❌ No hay usuario logueado');
        setReservas([]);
        return;
      }

      console.log('🔍 Obteniendo reservas para empresa del usuario:', user.id);

      // 1. Obtener la empresa del usuario
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id, nombre')
        .eq('user_id', user.id)
        .single();

      if (empresaError || !empresa) {
        console.error('❌ No se encontró empresa:', empresaError);
        throw new Error('No se encontró la empresa asociada al usuario');
      }

      console.log('✅ Empresa encontrada:', empresa);

      // 2. Obtener reservas de las mini bodegas de la empresa
      const { data: reservasData, error: reservasError } = await supabase
        .from('reservas')
        .select(`
          *,
          mini_bodegas!inner(
            id,
            metraje,
            direccion,
            ciudad,
            zona,
            precio_mensual,
            empresa_id
          )
        `)
        .eq('mini_bodegas.empresa_id', empresa.id)
        .order('created_at', { ascending: false });

      if (reservasError) {
        console.error('❌ Error obteniendo reservas:', reservasError);
        throw reservasError;
      }

      console.log('📦 Reservas encontradas:', reservasData?.length || 0, reservasData);

      // 3. Enriquecer datos de reservas
      const reservasEnriquecidas = await Promise.all(
        (reservasData || []).map(async (reserva) => {
          // Obtener datos del usuario que hizo la reserva
          const { data: userData } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', reserva.user_id)
            .single();

          return {
            ...reserva,
            usuarioEmail: userData?.email || 'Email no disponible',
            // Formatear fechas
            fechaInicioFormateada: new Date(reserva.fecha_inicio).toLocaleDateString('es-ES'),
            fechaFinFormateada: new Date(reserva.fecha_fin).toLocaleDateString('es-ES'),
            fechaCreacionFormateada: new Date(reserva.created_at).toLocaleDateString('es-ES'),
            // Información de la bodega
            infoBodega: {
              titulo: `Mini bodega de ${reserva.mini_bodegas.metraje || 'N/A'}`,
              ubicacion: `${reserva.mini_bodegas.zona || ''} - ${reserva.mini_bodegas.ciudad || ''}`.trim(),
              direccion: reserva.mini_bodegas.direccion || 'Sin dirección'
            }
          };
        })
      );

      setReservas(reservasEnriquecidas);

    } catch (err) {
      console.error('❌ Error en useReservasByEmpresa:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoReserva = async (reservaId, nuevoEstado, motivo = '') => {
    try {
      console.log('🔄 Actualizando reserva:', reservaId, 'a estado:', nuevoEstado);

      const updateData = {
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      };

      // Agregar campos específicos según el estado
      if (nuevoEstado === 'aceptada') {
        updateData.fecha_aceptacion = new Date().toISOString();
      } else if (nuevoEstado === 'rechazada') {
        updateData.fecha_rechazo = new Date().toISOString();
        if (motivo) {
          updateData.motivo_rechazo = motivo;
        }
      }

      const { error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', reservaId);

      if (error) {
        console.error('❌ Error actualizando reserva:', error);
        throw error;
      }

      console.log('✅ Reserva actualizada correctamente');

      // Crear notificación para el usuario
      await notificarUsuario(reservaId, nuevoEstado);

      // Recargar reservas para reflejar el cambio
      await fetchReservas();

      return { success: true };
    } catch (err) {
      console.error('❌ Error actualizando reserva:', err);
      return { success: false, error: err.message };
    }
  };

  // Función para notificar al usuario
  const notificarUsuario = async (reservaId, nuevoEstado) => {
    try {
      // Obtener datos de la reserva para la notificación
      const { data: reserva } = await supabase
        .from('reservas')
        .select('user_id, mini_bodega_id')
        .eq('id', reservaId)
        .single();

      if (!reserva) return;

      let titulo, mensaje;
      if (nuevoEstado === 'aceptada') {
        titulo = '¡Reserva aceptada!';
        mensaje = 'Tu solicitud de reserva ha sido aceptada. Ya puedes proceder con el pago.';
      } else if (nuevoEstado === 'rechazada') {
        titulo = 'Reserva rechazada';
        mensaje = 'Lamentablemente tu solicitud de reserva ha sido rechazada. Puedes intentar con otra mini bodega.';
      }

      // Insertar notificación
      const { error: notifError } = await supabase
        .from('notificaciones')
        .insert([{
          user_id: reserva.user_id,
          tipo: `reserva_${nuevoEstado}`,
          titulo: titulo,
          mensaje: mensaje,
          reserva_id: reservaId,
          leida: false,
          created_at: new Date().toISOString()
        }]);

      if (notifError) {
        console.warn('⚠️ Error creando notificación:', notifError);
      }
    } catch (err) {
      console.warn('⚠️ Error en notificación:', err);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [user?.id]);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas,
    actualizarEstadoReserva
  };
}