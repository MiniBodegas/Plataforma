import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    totalSedes: 0,
    totalMiniBodegas: 0,
    totalReservas: 0,
    reservasPendientes: 0,
    reservasAceptadas: 0,
    totalUsuarios: 0,
    ingresosMensuales: 0
  });

  const [empresas, setEmpresas] = useState([]);
  const [reservasRecientes, setReservasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      console.log('📊 Cargando datos del dashboard...');
      setLoading(true);

      // Estadísticas principales
      const [
        empresasCountRes,
        sedesCountRes,
        miniBodegasCountRes,
        reservasCountRes,
        reservasPendCountRes,
        reservasAcepCountRes,
      ] = await Promise.all([
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('sedes').select('*', { count: 'exact', head: true }),
        supabase.from('mini_bodegas').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'aceptada'),
      ]);

      const totalEmpresas = empresasCountRes.count ?? 0;
      const totalSedes = sedesCountRes.count ?? 0;
      const totalMiniBodegas = miniBodegasCountRes.count ?? 0;
      const totalReservas = reservasCountRes.count ?? 0;
      const reservasPendientes = reservasPendCountRes.count ?? 0;
      const reservasAceptadas = reservasAcepCountRes.count ?? 0;

      // Empresas recientes
      const { data: empresasRaw, error: empresasErr } = await supabase
        .from('empresas')
        .select(`
          id,
          nombre,
          ciudad,
          created_at,
          sedes ( id ),
          mini_bodegas ( id )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (empresasErr) {
        console.error('Error cargando empresas:', empresasErr);
      }

      const empresasData = (empresasRaw ?? []).map((e) => ({
        ...e,
        _counts: {
          sedes: e.sedes ? e.sedes.length : 0,
          mini_bodegas: e.mini_bodegas ? e.mini_bodegas.length : 0,
        },
      }));

      // Reservas recientes
      const { data: reservasRaw, error: reservasErr } = await supabase
        .from('reservas')
        .select(`
          id,
          created_at,
          estado,
          numero_documento
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reservasErr) {
        console.error('Error cargando reservas recientes:', reservasErr);
      }

      // Usuarios
      let totalUsuarios = 0;
      try {
        const { count: rolesCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });
        totalUsuarios = rolesCount ?? 0;
      } catch {
        totalUsuarios = 0;
      }

      setStats({
        totalEmpresas,
        totalSedes,
        totalMiniBodegas,
        totalReservas,
        reservasPendientes,
        reservasAceptadas,
        totalUsuarios,
        ingresosMensuales: 0
      });

      setEmpresas(empresasData || []);
      setReservasRecientes(reservasRaw || []);

      console.log('✅ Datos del dashboard cargados');
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    empresas,
    reservasRecientes,
    loading,
    loadData
  };
}
