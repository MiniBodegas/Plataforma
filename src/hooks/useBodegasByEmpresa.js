// src/hooks/useBodegasByEmpresa.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/640x360?text=Sin+imagen';

// Convierte un path de Storage a URL pública; si ya es URL, la retorna tal cual
const toPublicUrl = (maybePath) => {
  if (!maybePath) return PLACEHOLDER_IMG;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  // Cambiar a 'imagenes' según tu estructura
  const { data } = supabase.storage.from('imagenes').getPublicUrl(maybePath);
  return data?.publicUrl || PLACEHOLDER_IMG;
};

export function useBodegasByEmpresa() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaData, setEmpresaData] = useState(null); // Agregar estado para empresa
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

      // 1) Obtener la empresa del usuario
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id, nombre, user_id')
        .eq('user_id', user.id)
        .single();

      if (empresaError) throw empresaError;
      if (!empresa?.id) throw new Error('Empresa no encontrada');

      // Guardar empresa en estado
      setEmpresaData(empresa);

      // 2) Obtener mini-bodegas de la empresa (trae TODOS los campos que usas luego)
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
          orden,
          estado,
          cantidad,
          nombre_personalizado,
          caracteristicas,
          updated_at,
          metros_cuadrados,
          ubicacion_interna,
          sede:sede_id (
            id,
            nombre,
            ciudad
          )
        `)
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });

      if (bodegasError) throw bodegasError;

      if (!miniBodegas?.length) {
        setBodegas([]);
        return;
      }

      // 3) Lookup de sedes (sin joins)
      const sedeIds = Array.from(
        new Set(miniBodegas.map((b) => b?.sede_id).filter((x) => x != null))
      );

      let sedeById = {};
      if (sedeIds.length) {
        const { data: sedesData, error: sedesError } = await supabase
          .from('sedes') // 🔧 cambia si tu tabla se llama distinto
          .select('id, nombre, ciudad')
          .in('id', sedeIds);

        if (sedesError) throw sedesError;
        sedeById = (sedesData || []).reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }

      // 4) Normalización + reservas activas
      const result = await Promise.all(
        miniBodegas.map(async (b) => {
          // Conteo de reservas activas
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

          // Estado que tu UI espera
          // - mantenimiento: disponibilidad === false
          // - ocupada: hay reservas activas
          // - activa: disponible y sin reservas
          let estadoUi = b.estado || 'activa';  // Ya está correcto

          // Precio en número y dejar el campo que usa la Card: precio_mensual
          const precioNumber =
            typeof b.precio_mensual === 'number'
              ? b.precio_mensual
              : Number(b.precio_mensual) || 0;

          // Sede normalizada
          const sedeRaw = sedeById[b.sede_id] || null;
          const sede = {
            id: sedeRaw?.id ?? b.sede_id ?? null,
            nombre: sedeRaw?.nombre || (b.zona ? `Sede ${b.zona}` : 'Sin sede'),
            ciudad: sedeRaw?.ciudad || b?.ciudad || '—'
          };

          return {
            // Base
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

            // Lo que consume tu UI actualmente:
            estado: estadoUi,
            disponibilidad: b.disponibilidad ?? null,
            reservasActivas: reservasActivas || 0,

            // 🔑 Claves que usa BodegaInfo:
            precio_mensual: precioNumber,

            // 🔑 Clave que usa BodegaImage:
            imagen_url: imagenPrincipal,

            // Extra útil si luego quieres carrusel
            imagenes: Array.isArray(b.imagenes)
              ? b.imagenes
                  .map((it) => toPublicUrl(it?.url || it?.path))
                  .filter(Boolean)
              : [imagenPrincipal],

            // Objeto sede para mostrar nombre/ciudad
            sede
          };
        })
      );

      setBodegas(result);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchBodegas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  // Refetch corregido
  const refetch = async () => {
    console.log('🔄 Refetch iniciado...');
    await fetchBodegas(); // Simplemente llamar fetchBodegas que ya maneja todo
  };

  const actualizarEstadoBodega = async (bodegaId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('mini_bodegas')
        .update({ estado: nuevoEstado })  // Usar 'estado' directamente
        .eq('id', bodegaId);

      if (error) throw error;

      await refetch();
      return { success: true };
    } catch (err) {
      console.error('❌ Error actualizando bodega:', err);
      return { success: false, error: err.message };
    }
  };

  return { 
    bodegas, 
    loading, 
    error, 
    refetch, 
    actualizarEstadoBodega,
    empresa: empresaData // Opcional: exponer empresa si la necesitas
  };
}
