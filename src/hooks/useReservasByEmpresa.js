import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { actualizarDisponibilidadBodega } from '../services/bodegasService';

export function useReservasByEmpresa() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo todas las reservas...');

      // ✅ CONSULTA SIMPLE: Obtener todas las reservas con sus bodegas
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select(`
          *,
          mini_bodegas(
            id,
            metraje,
            ciudad,
            zona,
            precio_mensual,
            imagen_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo reservas:', error);
        throw error;
      }

      console.log('✅ Reservas obtenidas:', {
        total: reservas?.length || 0,
        reservas: reservas
      });

      setReservas(reservas || []);

    } catch (err) {
      console.error('❌ Error en fetchReservas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoReserva = async (reservaId, nuevoEstado, motivoRechazo = null) => {
    try {
      console.log('🔄 Actualizando estado de reserva:', { reservaId, nuevoEstado, motivoRechazo });

      const updateData = { 
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      };

      if (nuevoEstado === 'aceptada') {
        updateData.fecha_aceptacion = new Date().toISOString();
      } else if (nuevoEstado === 'rechazada') {
        updateData.fecha_rechazo = new Date().toISOString();
        if (motivoRechazo && motivoRechazo.trim()) {
          updateData.motivo_rechazo = motivoRechazo.trim();
        }
      }

      const { data: reservaActualizada, error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', reservaId)
        .select(`
          *,
          mini_bodegas(id, metraje, ciudad, zona, precio_mensual)
        `)
        .single();

      if (error) {
        console.error('❌ Error actualizando reserva:', error);
        throw error;
      }

      console.log('✅ Reserva actualizada:', reservaActualizada);

      // ✅ CAMBIAR DISPONIBILIDAD DE BODEGA SEGÚN ESTADO
      if (nuevoEstado === 'aceptada' && reservaActualizada.mini_bodega_id) {
        try {
          await actualizarDisponibilidadBodega(
            reservaActualizada.mini_bodega_id,
            false,
            `Reservada - Cliente: ${reservaActualizada.numero_documento}`
          );
          console.log('✅ Bodega marcada como no disponible');
        } catch (errorBodega) {
          console.error('⚠️ Error actualizando disponibilidad:', errorBodega);
        }
      }

      if (nuevoEstado === 'rechazada' && reservaActualizada.mini_bodega_id) {
        try {
          await actualizarDisponibilidadBodega(
            reservaActualizada.mini_bodega_id,
            true,
            null
          );
          console.log('✅ Bodega liberada');
        } catch (errorBodega) {
          console.error('⚠️ Error liberando bodega:', errorBodega);
        }
      }

      // Actualizar estado local
      setReservas(prevReservas => 
        prevReservas.map(reserva => 
          reserva.id === reservaId 
            ? { ...reserva, ...updateData }
            : reserva
        )
      );

      return { success: true, data: reservaActualizada };

    } catch (error) {
      console.error('❌ Error en actualizarEstadoReserva:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    reservas,
    loading,
    error,
    actualizarEstadoReserva,
    refetch: fetchReservas
  };
}