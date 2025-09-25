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

      // Obtener descripción de la tabla empresa_descripcion CON imagenes_urls
      const { data: empresaDescripcion, error: descripcionError } = await supabase
        .from('empresa_descripcion')
        .select('*')
        .eq('empresa_id', empresaId)
        .single()

      if (descripcionError) {
        console.warn('⚠️ No se encontró descripción en empresa_descripcion:', descripcionError)
      }

      console.log('📝 Descripción de empresa_descripcion:', empresaDescripcion)
      console.log('🖼️ imagenes_urls de empresa_descripcion:', empresaDescripcion?.imagenes_urls)

      // Obtener mini bodegas de esta empresa
      const { data: miniBodegas, error: bodegasError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at')

      if (bodegasError) {
        console.error('❌ Error obteniendo mini bodegas:', bodegasError)
      }

      console.log('✅ Mini bodegas encontradas:', miniBodegas)

      // Obtener carrusel de imágenes (PARA EL CARRUSEL)
      const { data: carruselImagenes, error: carruselError } = await supabase
        .from('carrusel_imagenes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('orden')

      if (carruselError) {
        console.warn('⚠️ Error obteniendo carrusel:', carruselError)
      }

      console.log('✅ Carrusel encontrado:', carruselImagenes)

      // Procesar imagenes_urls si es un array o string
      const getCompanyImage = (imagenes_urls) => {
        if (!imagenes_urls) return null
        
        // Si es un array, tomar el primero
        if (Array.isArray(imagenes_urls)) {
          console.log('🖼️ imagenes_urls es array:', imagenes_urls)
          return imagenes_urls[0] || null
        }
        
        // Si es un string que parece JSON, intentar parsearlo
        if (typeof imagenes_urls === 'string') {
          try {
            const parsed = JSON.parse(imagenes_urls)
            if (Array.isArray(parsed)) {
              console.log('🖼️ imagenes_urls parseado como array:', parsed)
              return parsed[0] || null
            }
            // Si no es array después del parse, usar como string directo
            console.log('🖼️ imagenes_urls como string directo:', imagenes_urls)
            return imagenes_urls
          } catch {
            // Si no se puede parsear, usar como URL directa
            console.log('🖼️ imagenes_urls como URL directa:', imagenes_urls)
            return imagenes_urls
          }
        }
        
        return null
      }

      // Transformar datos al formato esperado
      const warehouseDetail = {
        id: empresa.id,
        name: empresa.nombre || 'Empresa sin nombre',
        description: empresaDescripcion?.descripcion_general || 'Sin descripción disponible',
        address: empresaDescripcion?.direccion_general || 'Dirección no disponible',
        features: empresaDescripcion?.caracteristicas || empresa.caracteristicas || [],
        
        // SEPARAR IMÁGENES:
        // 1. Imágenes del carrusel (para el componente Carrousel)
        images: carruselImagenes?.map(img => img.imagen_url) || [],
        
        // 2. Imagen específica para CompanyDescription desde empresa_descripcion.imagenes_urls
        companyImage: getCompanyImage(empresaDescripcion?.imagenes_urls) || 
                     carruselImagenes?.[0]?.imagen_url || // Fallback: primera del carrusel
                     "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop",
        
        // Mini bodegas disponibles
        availableSizes: miniBodegas?.map(bodega => ({
          id: bodega.id,
          size: `${bodega.metraje}m³`,
          price: parseFloat(bodega.precio_mensual) || 0,
          description: bodega.descripcion || 'Sin descripción',
          content: bodega.contenido || 'Sin especificar contenido',
          address: bodega.direccion || 'Dirección no disponible',
          city: bodega.ciudad || 'Ciudad no disponible',
          zone: bodega.zona || 'Zona no disponible',
          image: bodega.imagen_url,
          available: true
        })) || [],

        // Datos adicionales
        city: miniBodegas?.[0]?.ciudad || 'Ciudad no disponible',
        zone: miniBodegas?.[0]?.zona || 'Zona no disponible',
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        
        // Datos raw para otros componentes
        empresa: empresa,
        empresaDescripcion: empresaDescripcion,
        miniBodegas: miniBodegas || [],
        carruselImagenes: carruselImagenes || []
      }

      console.log('🎉 Warehouse detail completo:', warehouseDetail)
      console.log('📋 Descripción final:', warehouseDetail.description)
      console.log('🖼️ Imágenes carrusel:', warehouseDetail.images)
      console.log('🏢 Imagen company (de imagenes_urls):', warehouseDetail.companyImage)

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