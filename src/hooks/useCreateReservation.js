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
        .from('bodegas')
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
      
      // Verificación
      if (!data.bodegaSeleccionada || !data.bodegaSeleccionada.id) {
        throw new Error('No hay una bodega seleccionada');
      }
      
      // Extraer y verificar el ID de la empresa
      const empresaId = data.bodegaSeleccionada.empresa_id;
      console.log('ID de empresa a guardar en reserva:', empresaId);
      
      if (!empresaId) {
        console.warn('⚠️ ADVERTENCIA: Falta ID de empresa, la reserva quedará sin asociar');
      }
      
      // Extraer el precio mensual de la bodega seleccionada
      const precioMensual = data.bodegaSeleccionada.precio || 
                           data.bodegaSeleccionada.precio_mensual || 
                           data.bodegaSeleccionada.precio_base || 
                           '0.00';
      
      // Verificar que tenemos un precio válido
      console.log('Precio mensual extraído:', precioMensual);
      
      // Crea el objeto de reserva con los nombres de columna correctos
      const reservaData = {
        mini_bodega_id: data.bodegaSeleccionada.id,
        empresa_id: empresaId,
        user_id: user?.id,
        fecha_inicio: data.fechaInicio,
        servicios_adicionales: data.servicios || [],
        tipo_documento: data.tipoDocumento,
        numero_documento: data.numeroDocumento,
        numero_celular: data.numeroCelular,
        estado: 'pendiente',
        precio_total: precioMensual.toString() // Convertir a string si es necesario
      };
      
      console.log('Datos de reserva a insertar:', reservaData);
      
      const { data: reservaCreada, error } = await supabase
        .from('reservas')
        .insert([reservaData])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Reserva creada:', reservaCreada);
      
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