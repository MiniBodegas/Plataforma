import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/640x360?text=Sin+imagen';

const toPublicUrl = (maybePath) => {
  if (!maybePath) return PLACEHOLDER_IMG;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const { data } = supabase.storage.from('imagenes').getPublicUrl(maybePath);
  return data?.publicUrl || PLACEHOLDER_IMG;
};

export function useBodegasByEmpresa() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const fetchBodegas = async () => {
    try {
      setLoading(true);
      setError(null);

      if (authLoading || !user?.id) {
        setBodegas([]);
        setLoading(false);
        return;
      }

      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id, nombre, user_id')
        .eq('user_id', user.id)
        .single();

      if (empresaError) throw empresaError;
      if (!empresa?.id) throw new Error('Empresa no encontrada');

      setEmpresaData(empresa);

      const { data: miniBodegas, error: bodegasError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });

      if (bodegasError) throw bodegasError;

      if (!miniBodegas?.length) {
        setBodegas([]);
        return;
      }

      const sedeIds = Array.from(
        new Set(miniBodegas.map((b) => b?.sede_id).filter((x) => x != null))
      );

      let sedeById = {};
      if (sedeIds.length) {
        const { data: sedesData, error: sedesError } = await supabase
          .from('sedes')
          .select('id, nombre, ciudad')
          .in('id', sedeIds);

        if (sedesError) throw sedesError;
        sedeById = (sedesData || []).reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }

      const result = await Promise.all(
        miniBodegas.map(async (b) => {
          const { count: reservasActivas = 0 } = await supabase
            .from('reservas')
            .select('id', { count: 'exact', head: true })
            .eq('mini_bodega_id', b.id)
            .eq('estado', 'aceptada');

          let imagenPrincipal = PLACEHOLDER_IMG;
          if (Array.isArray(b.imagenes) && b.imagenes.length) {
            const first = b.imagenes[0];
            imagenPrincipal = toPublicUrl(first?.url || first?.path);
          } else if (b.imagen_url) {
            imagenPrincipal = toPublicUrl(b.imagen_url);
          }

          const estadoUi = b.estado || 'activa';
          const precioNumber = typeof b.precio_mensual === 'number' ? b.precio_mensual : Number(b.precio_mensual) || 0;

          const sedeRaw = sedeById[b.sede_id] || null;
          const sede = {
            id: sedeRaw?.id ?? b.sede_id ?? null,
            nombre: sedeRaw?.nombre || (b.zona ? `Sede ${b.zona}` : 'Sin sede'),
            ciudad: sedeRaw?.ciudad || b?.ciudad || '—'
          };

          return {
            id: b.id,
            created_at: b.created_at,
            empresa_id: b.empresa_id,
            descripcion: b.descripcion || 'Sin descripción',
            metraje: b.metraje ?? null,
            direccion: b.direccion || 'Sin dirección',
            ciudad: b.ciudad ?? null,
            zona: b.zona ?? null,
            sede_id: b.sede_id ?? null,
            orden: b.orden ?? null,
            estado: estadoUi,
            disponibilidad: b.disponibilidad ?? null,
            reservasActivas: reservasActivas || 0,
            precio_mensual: precioNumber,
            imagen_url: imagenPrincipal,
            imagenes: Array.isArray(b.imagenes)
              ? b.imagenes.map((it) => toPublicUrl(it?.url || it?.path)).filter(Boolean)
              : [imagenPrincipal],
            nombre_personalizado: b.nombre_personalizado ?? null,
            ubicacion_interna: b.ubicacion_interna ?? null,
            metros_cuadrados: b.metros_cuadrados === null || b.metros_cuadrados === undefined ? null : Number(b.metros_cuadrados),
            caracteristicas: Array.isArray(b.caracteristicas) ? b.caracteristicas : [],
            cantidad: b.cantidad ?? 1,
            sede
          };
        })
      );

      setBodegas(result);
    } catch (err) {
      setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchBodegas();
  }, [user?.id, authLoading]);

  const refetch = async () => {
    await fetchBodegas();
  };

  const actualizarEstadoBodega = async (bodegaId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('mini_bodegas')
        .update({ estado: nuevoEstado })
        .eq('id', bodegaId);

      if (error) throw error;

      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    bodegas,
    loading,
    error,
    refetch,
    actualizarEstadoBodega,
    empresa: empresaData
  };
}
