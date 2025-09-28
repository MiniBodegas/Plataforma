import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext'; // ✅ DESCOMENTAR

export function useProveedorDashboard() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const { user } = useAuth(); // ✅ DESCOMENTAR

  useEffect(() => {
    if (user?.id) {
      obtenerEmpresaYBodegas();
    } else {
      setLoading(false);
      console.log('⚠️ No hay usuario logueado');
    }
  }, [user?.id]);

  const obtenerEmpresaYBodegas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        console.log('❌ No hay usuario logueado');
        setBodegas([]);
        return;
      }

      console.log('🔍 Obteniendo empresa para usuario:', user.id);

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
      setEmpresaId(empresa.id);

      // 2. Obtener bodegas de la empresa
      await fetchBodegas(empresa.id);

    } catch (err) {
      console.error('❌ Error obteniendo empresa y bodegas:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchBodegas = async (empresaIdParam) => {
    try {
      const idEmpresa = empresaIdParam || empresaId;
      
      if (!idEmpresa) {
        console.log('❌ No hay empresa ID');
        setBodegas([]);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Obteniendo bodegas para empresa:', idEmpresa);
      
      const { data, error: supabaseError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', idEmpresa)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('❌ Error en consulta:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Bodegas obtenidas:', {
        total: data?.length || 0,
        disponibles: data?.filter(b => b.disponible).length || 0,
        noDisponibles: data?.filter(b => !b.disponible).length || 0
      });

      setBodegas(data || []);
    } catch (err) {
      console.error('❌ Error fetchBodegas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarDisponibilidad = async (bodegaId, disponible, motivo = null) => {
    try {
      console.log('🔄 Actualizando disponibilidad:', { bodegaId, disponible, motivo });
      
      const updateData = { 
        disponible: disponible
      };

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
        if (error.message.includes('motivo_no_disponible')) {
          console.log('⚠️ Columna motivo_no_disponible no existe, actualizando solo disponible...');
          
          const { data: data2, error: error2 } = await supabase
            .from('mini_bodegas')
            .update({ disponible: disponible })
            .eq('id', bodegaId)
            .select();

          if (error2) throw error2;

          setBodegas(prev => prev.map(bodega => 
            bodega.id === bodegaId 
              ? { ...bodega, disponible }
              : bodega
          ));
          
          return true;
        }
        
        throw error;
      }

      setBodegas(prev => prev.map(bodega => 
        bodega.id === bodegaId 
          ? { 
              ...bodega, 
              disponible, 
              motivo_no_disponible: disponible ? null : motivo
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
    bodegas,
    loading,
    error,
    empresaId,
    refetch: () => fetchBodegas(empresaId),
    actualizarDisponibilidad
  };
}