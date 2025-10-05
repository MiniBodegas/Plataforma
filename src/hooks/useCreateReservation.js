import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCreateReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Función para actualizar disponibilidad de bodega
  const actualizarDisponibilidadBodega = async (bodegaId, disponible) => {
    try {
      const { error } = await supabase
        .from('mini_bodegas') // Cambiado de 'bodegas' a 'mini_bodegas'
        .update({ disponible: disponible })
        .eq('id', bodegaId);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Error actualizando disponibilidad:", err);
      return { success: false, error: err.message };
    }
  };

  // Función principal para crear reserva
  const createReservation = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar que tenemos todos los datos necesarios
      if (!data.bodegaSeleccionada || !data.bodegaSeleccionada.id) {
        throw new Error('No hay una bodega seleccionada');
      }
      
      // IMPORTANTE: Extraer y guardar el empresa_id
      const empresaId = data.bodegaSeleccionada.empresa_id;
      if (!empresaId) {
        console.warn('¡Advertencia! El ID de empresa no está disponible');
      }
      
      // Calcular fecha_fin automáticamente (1 mes después de la fecha_inicio)
      let fechaFin;
      if (data.fechaInicio) {
        const inicio = new Date(data.fechaInicio);
        inicio.setMonth(inicio.getMonth() + 1);
        fechaFin = inicio.toISOString().split('T')[0];
      } else {
        const ahora = new Date();
        ahora.setMonth(ahora.getMonth() + 1);
        fechaFin = ahora.toISOString().split('T')[0];
      }
      
      // Extraer el precio mensual de la bodega seleccionada
      const precioMensual = data.bodegaSeleccionada.precio || 
                          data.bodegaSeleccionada.precio_mensual || 
                          data.bodegaSeleccionada.precio_base || 
                          '0.00';
      
      const reservaData = {
        mini_bodega_id: data.bodegaSeleccionada.id,
        empresa_id: empresaId,
        user_id: user?.id,
        fecha_inicio: data.fechaInicio,
        fecha_fin: fechaFin,
        servicios_adicionales: data.servicios || [],
        tipo_documento: data.tipoDocumento,
        numero_documento: data.numeroDocumento,
        numero_celular: data.numeroCelular,
        estado: 'pendiente',
        precio_total: precioMensual.toString()
      };
      
      const { data: reservaCreada, error } = await supabase
        .from('reservas')
        .insert([reservaData])
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        success: true,
        reservaId: reservaCreada?.id,
        reserva: reservaCreada
      };
    } catch (err) {
      console.error('Error al crear reserva:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createReservation,
    actualizarDisponibilidadBodega,
    loading,
    error
  };
}