import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useWarehouseDetail(empresaId) {
  const [warehouse, setWarehouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!empresaId) {
      setLoading(false)
      return
    }

    fetchWarehouseDetail()
  }, [empresaId])

  const fetchWarehouseDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Obteniendo detalle de empresa:', empresaId)

      // Obtener empresa específica
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single()

      if (empresaError) {
        console.error('❌ Error obteniendo empresa:', empresaError)
        throw empresaError
      }

      if (!empresa) {
        throw new Error('Empresa no encontrada')
      }

      console.log('✅ Empresa encontrada:', empresa)

      // Obtener mini bodegas de esta empresa
      const { data: miniBodegas, error: bodegasError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at')

      if (bodegasError) {
        console.error('❌ Error obteniendo mini bodegas:', bodegasError)
        throw bodegasError
      }

      console.log('✅ Mini bodegas encontradas:', miniBodegas)

      // Obtener carrusel de imágenes
      const { data: carruselImagenes, error: carruselError } = await supabase
        .from('carrusel_imagenes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('orden')

      if (carruselError) {
        console.warn('⚠️ Error obteniendo carrusel:', carruselError)
      }

      console.log('✅ Carrusel encontrado:', carruselImagenes)

      // Obtener descripción adicional si existe
      const { data: descripcionEmpresa, error: descripcionError } = await supabase
        .from('empresa_descripcion')
        .select('*')
        .eq('empresa_id', empresaId)
        .single()

      if (descripcionError) {
        console.warn('⚠️ No hay descripción adicional:', descripcionError)
      }

      // Transformar datos al formato esperado
      const warehouseDetail = {
        id: empresa.id,
        name: empresa.nombre,
        description: empresa.descripcion_general || descripcionEmpresa?.descripcion_general || 'Sin descripción',
        address: descripcionEmpresa?.direccion_general || 'Dirección no disponible',
        features: empresa.caracteristicas || descripcionEmpresa?.caracteristicas || [],
        
        // Imágenes del carrusel
        images: carruselImagenes?.map(img => img.imagen_url) || [],
        
        // Mini bodegas disponibles
        availableSizes: miniBodegas?.map(bodega => ({
          id: bodega.id,
          size: `${bodega.metraje}m³`,
          price: parseFloat(bodega.precio_mensual) || 0,
          description: bodega.descripcion,
          content: bodega.contenido,
          address: bodega.direccion,
          city: bodega.ciudad,
          zone: bodega.zona,
          image: bodega.imagen_url,
          available: true // Puedes agregar lógica de disponibilidad
        })) || [],

        // Datos adicionales
        city: miniBodegas?.[0]?.ciudad || 'Ciudad no disponible',
        zone: miniBodegas?.[0]?.zona || 'Zona no disponible',
        rating: 4.5, // Temporal, implementar sistema de ratings
        reviewCount: Math.floor(Math.random() * 50) + 10,
        
        // Datos raw para otros componentes
        empresa: empresa,
        miniBodegas: miniBodegas || [],
        carruselImagenes: carruselImagenes || [],
        descripcionEmpresa: descripcionEmpresa
      }

      console.log('🎉 Warehouse detail completo:', warehouseDetail)
      setWarehouse(warehouseDetail)

    } catch (err) {
      console.error('💥 Error obteniendo detalle:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    warehouse,
    loading,
    error,
    refetch: fetchWarehouseDetail
  }
}