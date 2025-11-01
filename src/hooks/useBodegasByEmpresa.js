// src/hooks/useBodegasByEmpresa.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/640x360?text=Sin+imagen';

// Convierte un path de Storage a URL pública; si ya es URL, la retorna tal cual
const toPublicUrl = (maybePath) => {
  if (!maybePath) return PLACEHOLDER_IMG;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  // 🔧 Ajusta 'bodegas' al nombre real de tu bucket de Storage
  const { data } = supabase.storage.from('bodegas').getPublicUrl(maybePath);
  return data?.publicUrl || PLACEHOLDER_IMG;
};

export function useBodegasByEmpresa() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Asegúrate que tu AuthContext exponga { user, loading }
  const { user, loading: authLoading } = useAuth();

  const fetchBodegas = async () => {
    try {
      setLoading(true);
      setError(null);

      if (authLoading) {
        setLoading(false);
        return;
      }
      if (!user?.id) {
        setBodegas([]);
        setLoading(false);
        return;
      }

      // 1) Empresa del usuario
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id, nombre, user_id')
        .eq('user_id', user.id)
        .single();

      if (empresaError) throw empresaError;
      if (!empresa?.id) throw new Error('Empresa no encontrada');

      // 2) Mini-bodegas de la empresa (SIN comentarios en select)
      const { data: miniBodegas, error: bodegasError } = await supabase
        .from('mini_bodegas')
        .select(`
          id,
          created_at,
          empresa_id,
          descripcion,
          metraje,
          ciudad,
          precio_mensual,
          imagen_url,
          sede_id,
          orden
        `)
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });

      if (bodegasError) throw bodegasError;

      if (!miniBodegas?.length) {
        setBodegas([]);
        return;
      }

      // 3) Lookup de sedes (sin joins): obtenemos todas las sedes usadas
      const sedeIds = Array.from(
        new Set(
          miniBodegas
            .map((b) => b?.sede_id)
            .filter((x) => x !== null && x !== undefined)
        )
      );

      let sedeById = {};
      if (sedeIds.length) {
        const { data: sedesData, error: sedesError } = await supabase
          .from('sedes') // 🔧 ajusta el nombre si tu tabla es distinta
          .select('id, nombre, ciudad')
          .in('id', sedeIds);

        if (sedesError) throw sedesError;
        sedeById = (sedesData || []).reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }

      // 4) Normalización + conteo de reservas activas
      const result = await Promise.all(
        miniBodegas.map(async (b) => {
          const { count: reservasActivas = 0 } = await supabase
            .from('reservas')
            .select('id', { count: 'exact', head: true })
            .eq('mini_bodega_id', b.id)
            .eq('estado', 'aceptada');

          // Imagen principal: soporta JSON [{url}] o [{path}] y/o imagen_url directa
          let imagenPrincipal = PLACEHOLDER_IMG;
          if (Array.isArray(b.imagenes) && b.imagenes.length) {
            const first = b.imagenes[0];
            imagenPrincipal = toPublicUrl(first?.url || first?.path);
          } else if (b.imagen_url) {
            imagenPrincipal = toPublicUrl(b.imagen_url);
          }

          const imagenes = Array.isArray(b.imagenes)
            ? b.imagenes
                .map((it) => toPublicUrl(it?.url || it?.path))
                .filter(Boolean)
            : [imagenPrincipal];

          // Estado derivado
          let estado = 'disponible';
          if (b.disponibilidad === false) estado = 'mantenimiento';
          else if ((reservasActivas || 0) > 0) estado = 'ocupada';

          // Precio
          const precio =
            typeof b.precio_mensual === 'number'
              ? b.precio_mensual
              : Number(b.precio_mensual) || 0;

          const precioTexto = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
          }).format(precio);

          // Sede compuesta: desde lookup o con fallbacks
          const sedeRaw = sedeById[b.sede_id] || null;
          const sede = {
            id: sedeRaw?.id ?? b.sede_id ?? null,
            nombre:
              sedeRaw?.nombre ||
              (b.zona ? `Sede ${b.zona}` : 'Sin sede'),
            ciudad: sedeRaw?.ciudad || b?.ciudad || '—'
          };

          return {
            id: b.id,
            titulo: `Mini bodega de ${b.metraje ?? 'N/A'}`,
            descripcion: b.descripcion || 'Sin descripción',
            direccion: b.direccion || 'Sin dirección',
            metraje: b.metraje ?? null,
            ciudad: b.ciudad ?? null,
            zona: b.zona ?? null,
            empresaId: b.empresa_id,
            created_at: b.created_at,
            orden: b.orden ?? null,

            estado,
            disponibilidad: b.disponibilidad ?? null,
            reservasActivas: reservasActivas || 0,

            precio,
            precioTexto,

            sede,

            imagen: imagenPrincipal,
            imagenPrincipal,
            imagenes
          };
        })
      );

      setBodegas(result);
    } catch (err) {
      console.error('❌ Error completo:', err);
      setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchBodegas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  const refetch = fetchBodegas;

  const actualizarEstadoBodega = async (bodegaId, nuevoEstado) => {
    try {
      let nuevaDisponibilidad;
      if (nuevoEstado === 'disponible') nuevaDisponibilidad = true;
      else if (nuevoEstado === 'mantenimiento') nuevaDisponibilidad = false;
      else if (nuevoEstado === 'ocupada')
        throw new Error('El estado "ocupada" se determina por reservas activas');
      else throw new Error('Estado no válido');

      const { error } = await supabase
        .from('mini_bodegas')
        .update({ disponibilidad: nuevaDisponibilidad })
        .eq('id', bodegaId);

      if (error) throw error;

      await refetch();
      return { success: true };
    } catch (err) {
      console.error('❌ Error actualizando bodega:', err);
      return { success: false, error: err.message };
    }
  };

  return { bodegas, loading, error, refetch, actualizarEstadoBodega };
}
