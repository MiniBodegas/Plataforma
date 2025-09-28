// Crear un nuevo archivo: src/services/bodegasService.js

import { supabase } from '../lib/supabase';

export const actualizarDisponibilidadBodega = async (bodegaId, disponible, motivo = null) => {
  try {
    console.log('🔄 Actualizando disponibilidad de bodega:', { 
      bodegaId, 
      disponible, 
      motivo,
      accion: disponible ? 'LIBERAR' : 'RESERVAR'
    });
    
    const updateData = {
      disponible: disponible
      // ✅ QUITAR fecha_actualizacion por ahora
      // fecha_actualizacion: new Date().toISOString()
    };

    // ✅ SOLO AGREGAR MOTIVO SI LA COLUMNA EXISTE Y SE PROPORCIONA
    if (motivo !== null && motivo !== undefined) {
      // Intentar actualizar con motivo, si falla, actualizar sin motivo
      updateData.motivo_no_disponible = motivo;
    } else if (disponible) {
      // Si se está liberando, intentar limpiar el motivo
      updateData.motivo_no_disponible = null;
    }

    const { data, error } = await supabase
      .from('mini_bodegas')
      .update(updateData)
      .eq('id', bodegaId)
      .select();

    if (error) {
      console.error('❌ Error actualizando disponibilidad:', error);
      
      // ✅ SI ERROR POR COLUMNA motivo_no_disponible, REINTENTAR SIN ELLA
      if (error.message.includes('motivo_no_disponible')) {
        console.log('⚠️ Columna motivo_no_disponible no existe, reintentando solo con disponible...');
        
        const { data: data2, error: error2 } = await supabase
          .from('mini_bodegas')
          .update({ disponible: disponible })
          .eq('id', bodegaId)
          .select();

        if (error2) throw error2;
        
        console.log('✅ Disponibilidad actualizada (sin motivo):', data2);
        return data2;
      }
      
      throw error;
    }

    console.log('✅ Disponibilidad actualizada exitosamente:', {
      bodegaId,
      nuevoEstado: disponible ? 'DISPONIBLE' : 'NO DISPONIBLE',
      motivo: updateData.motivo_no_disponible,
      data: data[0]
    });
    
    return data;
    
  } catch (error) {
    console.error('❌ Error en actualizarDisponibilidadBodega:', error);
    throw error;
  }
};

export const crearReserva = async (datosReserva) => {
  try {
    console.log('📝 Creando reserva:', datosReserva);
    
    const { data, error } = await supabase
      .from('reservas')
      .insert([{
        mini_bodega_id: datosReserva.bodegaId,
        empresa_id: datosReserva.empresaId,
        cliente_documento: datosReserva.numeroDocumento,
        cliente_celular: datosReserva.numeroCelular,
        fecha_inicio: datosReserva.fechaInicio,
        servicios_adicionales: datosReserva.servicios || [],
        estado: 'pendiente', // ✅ EMPEZAR COMO PENDIENTE
        fecha_reserva: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ Error creando reserva:', error);
      throw error;
    }

    console.log('✅ Reserva creada:', data);
    return data[0];
    
  } catch (error) {
    console.error('❌ Error en crearReserva:', error);
    throw error;
  }
};

// ✅ FUNCIÓN ESPECÍFICA PARA MARCAR COMO RESERVADA
export const marcarBodegaComoReservada = async (bodegaId) => {
  console.log('🔒 Marcando bodega como reservada:', bodegaId);
  return await actualizarDisponibilidadBodega(
    bodegaId, 
    false, // disponible = false
    'Reservada por cliente' // motivo automático
  );
};

// ✅ FUNCIÓN PARA LIBERAR BODEGA
export const liberarBodega = async (bodegaId, motivo = 'Liberada manualmente') => {
  console.log('🔓 Liberando bodega:', bodegaId);
  return await actualizarDisponibilidadBodega(
    bodegaId, 
    true, // disponible = true
    null // sin motivo cuando se libera
  );
};

export const obtenerBodegasPorEmpresa = async (empresaId) => {
  try {
    const { data, error } = await supabase
      .from('mini_bodegas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo bodegas:', error);
    throw error;
  }
};