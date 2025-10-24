import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Detecta la empresa del usuario (empresas.user_id = currentUserId),
 * carga todas las mini_bodegas y expone actualizarDisponibilidad.
 */
export function useProveedorDashboard(currentUserId) {
  const [bodegas, setBodegas] = useState([]);
  const [empresaId, setEmpresaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmpresaId = useCallback(async () => {
    if (!currentUserId) return null;
    const { data, error } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', currentUserId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.id || null;
  }, [currentUserId]);

  const fetchTodasLasBodegas = useCallback(async () => {
    const { data, error } = await supabase
      .from('mini_bodegas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const empId = await fetchEmpresaId();
      setEmpresaId(empId);

      const todas = await fetchTodasLasBodegas();
      setBodegas(todas);
    } catch (err) {
      console.error('❌ useProveedorDashboard refetch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchEmpresaId, fetchTodasLasBodegas]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const actualizarDisponibilidad = async (bodegaId, disponible, motivo = null) => {
    try {
      const updateData = {
        disponible,
        updated_at: new Date().toISOString(),
        motivo_no_disponible: disponible ? null : (motivo ?? null),
      };

      const { error } = await supabase
        .from('mini_bodegas')
        .update(updateData)
        .eq('id', bodegaId);

      if (error) throw error;

      setBodegas(prev => prev.map(b =>
        b.id === bodegaId ? { ...b, ...updateData } : b
      ));
      return true;
    } catch (e) {
      console.error('❌ actualizarDisponibilidad:', e);
      throw e;
    }
  };

  return {
    bodegas,
    empresaId,     // ✅ ahora se expone el id de la empresa detectada
    loading,
    error,
    refetch,
    actualizarDisponibilidad,
  };
}
