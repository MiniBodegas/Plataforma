import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useBodegasByEmpresa() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ CAMBIAR A user PARA MANTENER CONSISTENCIA
  const { user, loading: authLoading } = useAuth();

  const fetchBodegas = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ DEBUG: Revisar qué campos tiene realmente el AuthContext
      console.log('🔍 DEBUG AUTH COMPLETO:', {
        user: user,
        authLoading: authLoading,
        userId: user?.id,
        userKeys: user ? Object.keys(user) : 'no user',
        typeof: typeof user
      });

      // ✅ VERIFICAR SI EL USUARIO ESTÁ CARGANDO AÚN
      if (authLoading) {
        console.log('⏳ Auth aún está cargando...');
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('❌ No hay usuario logueado');
        setBodegas([]);
        setLoading(false);
        return;
      }

      if (!user.id) {
        console.log('❌ user.id no existe. Campos disponibles:', Object.keys(user));
        setBodegas([]);
        setLoading(false);
        return;
      }

      console.log('✅ Usuario ID válido:', user.id);

      // 1. Obtener la empresa del usuario
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id, nombre, user_id')
        .eq('user_id', user.id)
        .single();

      console.log('🏢 Consulta empresa resultado:', { empresa, empresaError });

      if (empresaError) {
        console.error('❌ Error en consulta de empresa:', empresaError);
        
        // ✅ SI NO ENCUENTRA EMPRESA, MOSTRAR TODAS LAS EMPRESAS PARA DEBUG
        const { data: todasEmpresas } = await supabase
          .from('empresas')
          .select('id, nombre, user_id')
          .limit(5);
        
        console.log('🔍 DEBUG: Algunas empresas en BD:', todasEmpresas);
        console.log('🔍 Buscando user_id:', user.id);
        
        throw new Error(`No se encontró empresa para user_id: ${user.id}`);
      }

      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }

      console.log('✅ Empresa encontrada:', empresa);

      // 2. Obtener las mini bodegas de la empresa
      const { data: miniBodegas, error: bodegasError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });

      console.log('📦 Bodegas encontradas:', { 
        empresaId: empresa.id,
        count: miniBodegas?.length || 0, 
        miniBodegas, 
        bodegasError 
      });

      if (bodegasError) {
        console.error('❌ Error obteniendo mini bodegas:', bodegasError);
        throw bodegasError;
      }

      if (!miniBodegas || miniBodegas.length === 0) {
        console.log('⚠️ No hay bodegas para empresa_id:', empresa.id);
        setBodegas([]);
        return;
      }

      // 3. Para cada bodega, obtener el número de reservas activas
      const bodegasConEstados = await Promise.all(
        miniBodegas.map(async (bodega) => {
          // Contar reservas activas (aceptadas)
          const { count: reservasActivas } = await supabase
            .from('reservas')
            .select('id', { count: 'exact' })
            .eq('mini_bodega_id', bodega.id)
            .eq('estado', 'aceptada');

          // Determinar estado basado en disponibilidad + reservas
          let estado = 'disponible';
          
          if (bodega.disponibilidad === false) {
            estado = 'mantenimiento';
          } else if (reservasActivas > 0) {
            estado = 'ocupada';
          } else {
            estado = 'disponible';
          }

          return {
            id: bodega.id,
            titulo: `Mini bodega de ${bodega.metraje || 'N/A'}`,
            direccion: bodega.direccion || 'Sin dirección',
            sede: `${bodega.zona || ''} - ${bodega.ciudad || ''}`.trim() || 'Sin ubicación',
            precio: parseFloat(bodega.precio_mensual || 0),
            estado: estado,
            disponibilidad: bodega.disponibilidad,
            descripcion: bodega.descripcion || 'Sin descripción',
            imagen: bodega.imagen_url || "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400",
            fechaCreacion: new Date(bodega.created_at).toLocaleDateString('es-ES'),
            // Datos adicionales útiles
            metraje: bodega.metraje,
            contenido: bodega.contenido,
            ciudad: bodega.ciudad,
            zona: bodega.zona,
            reservasActivas: reservasActivas || 0,
            empresaId: bodega.empresa_id,
            orden: bodega.orden,
            created_at: bodega.created_at
          };
        })
      );

      console.log('✅ Bodegas procesadas finales:', bodegasConEstados);
      setBodegas(bodegasConEstados);

    } catch (err) {
      console.error('❌ Error completo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ SOLO EJECUTAR SI NO ESTÁ CARGANDO EL AUTH
    if (!authLoading) {
      fetchBodegas();
    }
  }, [user?.id, authLoading]);

  const actualizarEstadoBodega = async (bodegaId, nuevoEstado) => {
    try {
      // Mapear el estado visual al valor de disponibilidad
      let nuevaDisponibilidad;
      switch (nuevoEstado) {
        case 'disponible':
          nuevaDisponibilidad = true;
          break;
        case 'mantenimiento':
          nuevaDisponibilidad = false;
          break;
        case 'ocupada':
          throw new Error('El estado "ocupada" se determina automáticamente por las reservas activas');
        default:
          throw new Error('Estado no válido');
      }

      const { error } = await supabase
        .from('mini_bodegas')
        .update({ disponibilidad: nuevaDisponibilidad })
        .eq('id', bodegaId);

      if (error) throw error;

      // Recargar los datos para reflejar el cambio
      await fetchBodegas();

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
    refetch: fetchBodegas,
    actualizarEstadoBodega
  };
}