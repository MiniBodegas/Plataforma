import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProveedorDashboard() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);

  useEffect(() => {
    // ✅ SIEMPRE CARGAR TODAS LAS BODEGAS, SIN FILTROS
    fetchTodasLasBodegas();
  }, []);

  const fetchTodasLasBodegas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando TODAS las bodegas (sin filtros)...');
      
      // ✅ CONSULTA SIN FILTROS - OBTENER TODAS LAS BODEGAS
      const { data, error: supabaseError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('❌ Error en consulta:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ TODAS las bodegas obtenidas:', {
        total: data?.length || 0,
        disponibles: data?.filter(b => b.disponible).length || 0,
        noDisponibles: data?.filter(b => !b.disponible).length || 0,
        primerasBodegas: data?.slice(0, 3).map(b => ({
          id: b.id,
          metraje: b.metraje,
          ciudad: b.ciudad,
          disponible: b.disponible,
          empresa_id: b.empresa_id
        }))
      });

      setBodegas(data || []);
    } catch (err) {
      console.error('❌ Error fetchTodasLasBodegas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarDisponibilidad = async (bodegaId, disponible, motivo = null) => {
    try {
      console.log('🔄 Actualizando disponibilidad:', { bodegaId, disponible, motivo });
      
      const updateData = { 
        disponible: disponible,
        updated_at: new Date().toISOString()
      };

      // ✅ AGREGAR MOTIVO SI EXISTE LA COLUMNA
      if (motivo !== null && motivo !== undefined) {
        updateData.motivo_no_disponible = motivo;
      } else if (disponible) {
        updateData.motivo_no_disponible = null;
      }

      const { data, error } = await supabase
        .from('mini_bodegas')
        .update(updateData)
        .eq('id', bodegaId)
        .select();

      if (error) {
        // Si hay error con motivo_no_disponible, intentar sin ese campo
        if (error.message.includes('motivo_no_disponible')) {
          console.log('⚠️ Columna motivo_no_disponible no existe, actualizando solo disponible...');
          
          const { data: data2, error: error2 } = await supabase
            .from('mini_bodegas')
            .update({ 
              disponible: disponible,
              updated_at: new Date().toISOString()
            })
            .eq('id', bodegaId)
            .select();

          if (error2) throw error2;

          // Actualizar estado local
          setBodegas(prev => prev.map(bodega => 
            bodega.id === bodegaId 
              ? { ...bodega, disponible, updated_at: new Date().toISOString() }
              : bodega
          ));
          
          return true;
        }
        
        throw error;
      }

      // Actualizar estado local
      setBodegas(prev => prev.map(bodega => 
        bodega.id === bodegaId 
          ? { 
              ...bodega, 
              disponible, 
              motivo_no_disponible: disponible ? null : motivo,
              updated_at: new Date().toISOString()
            }
          : bodega
      ));
      
      return true;
    } catch (error) {
      console.error('❌ Error actualizando disponibilidad:', error);
      throw error;
    }
  };

  return {
    bodegas, // ✅ TODAS las bodegas (disponibles y no disponibles)
    loading,
    error,
    empresaId: null, // No necesitamos filtrar por empresa
    refetch: fetchTodasLasBodegas,
    actualizarDisponibilidad
  };
}