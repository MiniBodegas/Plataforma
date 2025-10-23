// hooks/useReservasByEmpresa.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Trae reservas y se suscribe en tiempo real (INSERT/UPDATE/DELETE).
 * Si pasas empresaId, filtra por empresa. Si no, escucha todo.
 */
export function useReservasByEmpresa(empresaId) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const base = supabase
        .from('reservas')
        .select(`
          *,
          mini_bodegas (
            id,
            metraje,
            ciudad,
            zona,
            precio_mensual,
            imagen_url,
            cantidad
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = empresaId
        ? await base.eq('empresa_id', empresaId)
        : await base;

      if (error) throw error;

      setReservas(data || []);
    } catch (err) {
      console.error('❌ fetchReservas error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  // 📡 Realtime: upsert en memoria ante cambios
  useEffect(() => {
    const channel = supabase
      .channel(`rt-reservas${empresaId ? `-${empresaId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT | UPDATE | DELETE
          schema: 'public',
          table: 'reservas',
          ...(empresaId ? { filter: `empresa_id=eq.${empresaId}` } : {}),
        },
        (payload) => {
          setReservas((prev) => {
            if (payload.eventType === 'DELETE') {
              return prev.filter((r) => r.id !== payload.old.id);
            }
            const rec = payload.new;
            const idx = prev.findIndex((r) => r.id === rec.id);
            if (idx === -1) return [rec, ...prev];
            const next = [...prev];
            next[idx] = { ...prev[idx], ...rec };
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId]);

  const actualizarEstadoReserva = async (reservaId, nuevoEstado, motivoRechazo = null) => {
    try {
      const nowIso = new Date().toISOString();
      const updateData = {
        estado: nuevoEstado,
        updated_at: nowIso,
      };

      if (nuevoEstado === 'aceptada') {
        updateData.fecha_aceptacion = nowIso;
        updateData.fecha_rechazo = null;
        updateData.motivo_rechazo = null;
      } else if (nuevoEstado === 'rechazada') {
        updateData.fecha_rechazo = nowIso;
        updateData.motivo_rechazo = (motivoRechazo || '').trim() || null;
        updateData.fecha_aceptacion = null;
      }

      const { data, error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', reservaId)
        .select(`
          *,
          mini_bodegas (id, metraje, ciudad, zona, precio_mensual, imagen_url, cantidad)
        `)
        .single();

      if (error) throw error;

      // Upsert en local con lo devuelto por Supabase
      setReservas((prev) => {
        const idx = prev.findIndex((r) => r.id === reservaId);
        if (idx === -1) return data ? [data, ...prev] : prev;
        const next = [...prev];
        next[idx] = { ...prev[idx], ...data };
        return next;
      });

      return { success: true, data };
    } catch (err) {
      console.error('❌ actualizarEstadoReserva error:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    reservas,
    loading,
    error,
    actualizarEstadoReserva,
    refetch: fetchReservas,
  };
}
