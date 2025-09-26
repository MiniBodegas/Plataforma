import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCreateReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const createReservation = async (reservationData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Debes estar logueado para crear una reserva');
      }

      console.log('🔄 Creando reserva con datos:', reservationData);

      // 1. Verificar que la mini bodega existe y está disponible
      const { data: miniBodega, error: bodegaError } = await supabase
        .from('mini_bodegas')
        .select('*, empresas!inner(id, nombre)')
        .eq('id', reservationData.bodegaSeleccionada.id)
        .single();

      if (bodegaError || !miniBodega) {
        throw new Error('La mini bodega seleccionada no está disponible');
      }

      if (miniBodega.disponible === false) {
        throw new Error('Esta mini bodega no está disponible para reservas');
      }

      // 2. Verificar que no haya reservas activas para esta bodega
      const { data: reservasExistentes, error: reservasError } = await supabase
        .from('reservas')
        .select('id, estado')
        .eq('mini_bodega_id', reservationData.bodegaSeleccionada.id)
        .in('estado', ['pendiente', 'aceptada']);

      if (reservasError) {
        throw new Error('Error verificando disponibilidad');
      }

      if (reservasExistentes && reservasExistentes.length > 0) {
        throw new Error('Esta mini bodega ya tiene una reserva activa');
      }

      // 3. Calcular fechas
      const fechaInicio = new Date(reservationData.fechaInicio);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + 1); // Por defecto 1 mes

      // 4. Crear la reserva
      const reservaData = {
        user_id: user.id,
        mini_bodega_id: reservationData.bodegaSeleccionada.id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
        fecha_fin: fechaFin.toISOString().split('T')[0],
        estado: 'pendiente',
        tipo_documento: reservationData.tipoDocumento,
        numero_documento: reservationData.numeroDocumento,
        numero_celular: reservationData.numeroCelular,
        servicios_adicionales: reservationData.servicios || [],
        precio_total: parseFloat(miniBodega.precio_mensual),
        created_at: new Date().toISOString()
      };

      console.log('💾 Guardando reserva:', reservaData);

      const { data: nuevaReserva, error: insertError } = await supabase
        .from('reservas')
        .insert([reservaData])
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
        .single();

      if (insertError) {
        console.error('❌ Error insertando reserva:', insertError);
        throw new Error(`Error creando la reserva: ${insertError.message}`);
      }

      console.log('✅ Reserva creada exitosamente:', nuevaReserva);

      // 5. Crear notificación para la empresa
      await notificarEmpresa(miniBodega.empresa_id, nuevaReserva);

      return {
        success: true,
        reserva: nuevaReserva,
        message: 'Reserva creada exitosamente. La empresa será notificada para aprobar tu solicitud.'
      };

    } catch (err) {
      console.error('❌ Error creando reserva:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Notificar empresa
  const notificarEmpresa = async (empresaId, reserva) => {
    try {
      const { error: notifError } = await supabase
        .from('notificaciones')
        .insert([{
          empresa_id: empresaId,
          tipo: 'nueva_reserva',
          titulo: 'Nueva solicitud de reserva',
          mensaje: `Tienes una nueva solicitud de reserva pendiente de aprobación para una de tus mini bodegas`,
          reserva_id: reserva.id,
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

  return {
    createReservation,
    loading,
    error
  };
}