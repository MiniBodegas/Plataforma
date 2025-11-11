import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useEmpresasDocumentacion() {
  const [documentacion, setDocumentacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocumentacion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📄 Cargando documentación de empresas...');

      // Obtener empresas con su documentación
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select(`
          id,
          nombre,
          ciudad,
          celular,
          direccion_principal,
          rut,
          camara_comercio,
          estado_verificacion,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (empresasError) {
        console.error('❌ Error cargando documentación:', empresasError);
        throw empresasError;
      }

      console.log('📊 Empresas obtenidas:', empresasData?.length);

      // Formatear datos con información de documentación
      const documentacionFormateada = (empresasData || []).map((empresa) => {
        const documentos = [];
        
        // RUT - Obtener URL pública del storage
        if (empresa.rut) {
          try {
            const { data: publicURL } = supabase.storage
              .from('documentos-empresas')
              .getPublicUrl(empresa.rut);
            
            documentos.push({
              tipo: 'RUT',
              url: publicURL?.publicUrl || null,
              path: empresa.rut,
              estado: 'subido',
              extension: empresa.rut.split('.').pop()?.toLowerCase()
            });
            
            console.log('✅ RUT URL:', publicURL?.publicUrl);
          } catch (err) {
            console.error('❌ Error obteniendo URL de RUT:', err);
          }
        }
        
        // Cámara de Comercio
        if (empresa.camara_comercio) {
          try {
            const { data: publicURL } = supabase.storage
              .from('documentos-empresas')
              .getPublicUrl(empresa.camara_comercio);
            
            documentos.push({
              tipo: 'Cámara de Comercio',
              url: publicURL?.publicUrl || null,
              path: empresa.camara_comercio,
              estado: 'subido',
              extension: empresa.camara_comercio.split('.').pop()?.toLowerCase()
            });
            
            console.log('✅ Cámara URL:', publicURL?.publicUrl);
          } catch (err) {
            console.error('❌ Error obteniendo URL de Cámara:', err);
          }
        }

        return {
          id: empresa.id,
          nombre_empresa: empresa.nombre,
          ciudad: empresa.ciudad,
          direccion: empresa.direccion_principal,
          telefono: empresa.celular,
          email: empresa.email,
          fecha_registro: empresa.created_at,
          documentos: documentos,
          total_documentos: documentos.length,
          documentos_completos: documentos.length === 2,
          estado_verificacion: empresa.estado_verificacion || 'pendiente'
        };
      });

      setDocumentacion(documentacionFormateada);
      console.log('✅ Documentación cargada:', documentacionFormateada.length, 'empresas');
      
    } catch (err) {
      console.error('❌ Error en useEmpresasDocumentacion:', err);
      setError(err.message || 'Error al cargar documentación');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar automáticamente al montar
  useEffect(() => {
    loadDocumentacion();
  }, [loadDocumentacion]);

  // Función para actualizar estado de verificación
  const actualizarEstadoVerificacion = useCallback(async (empresaId, nuevoEstado) => {
    try {
      console.log('🔄 Intentando actualizar estado...');
      console.log('   Empresa ID:', empresaId);
      console.log('   Nuevo estado:', nuevoEstado);

      // Primero verificar que la empresa existe
      const { data: empresaExiste, error: checkError } = await supabase
        .from('empresas')
        .select('id, nombre, estado_verificacion')
        .eq('id', empresaId)
        .single();

      if (checkError) {
        console.error('❌ Error verificando empresa:', checkError);
        return { success: false, error: 'No se pudo verificar la empresa: ' + checkError.message };
      }

      if (!empresaExiste) {
        console.error('❌ Empresa no encontrada con ID:', empresaId);
        return { success: false, error: 'Empresa no encontrada' };
      }

      console.log('✅ Empresa encontrada:', empresaExiste);
      console.log('   Estado actual:', empresaExiste.estado_verificacion);

      // Ahora intentar actualizar
      const { data, error: updateError } = await supabase
        .from('empresas')
        .update({ estado_verificacion: nuevoEstado })
        .eq('id', empresaId)
        .select();

      if (updateError) {
        console.error('❌ Error de Supabase al actualizar:', updateError);
        console.error('   Código:', updateError.code);
        console.error('   Detalles:', updateError.details);
        console.error('   Hint:', updateError.hint);
        throw updateError;
      }

      console.log('📝 Respuesta de actualización:', data);

      if (!data || data.length === 0) {
        console.warn('⚠️ No se actualizó ninguna fila.');
        console.warn('   Esto probablemente es un problema de políticas RLS');
        return { 
          success: false, 
          error: 'No se pudo actualizar. Verifica las políticas de seguridad (RLS) en Supabase.' 
        };
      }

      // Recargar documentación
      await loadDocumentacion();
      
      console.log('✅ Estado de verificación actualizado correctamente');
      return { success: true, data };
    } catch (err) {
      console.error('❌ Error actualizando estado:', err);
      return { success: false, error: err.message };
    }
  }, [loadDocumentacion]);

  return {
    documentacion,
    loading,
    error,
    loadDocumentacion,
    actualizarEstadoVerificacion
  };
}
