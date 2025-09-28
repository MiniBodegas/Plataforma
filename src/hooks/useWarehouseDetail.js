import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useWarehouseDetail(id) {
  const [warehouse, setWarehouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    fetchWarehouseDetail()
  }, [id])

  const fetchWarehouseDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 useWarehouseDetail - Consultando empresa ID:', id)

      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select(`
          *,
          carrusel_imagenes(imagen_url, orden),
          empresa_descripcion!inner(
            descripcion_general,
            direccion_general,
            caracteristicas,
            imagenes_urls
          ),
          mini_bodegas!inner(*)
        `)
        .eq('id', id)
        // ✅ FILTRAR SOLO DISPONIBLES (si la columna existe)
        .eq('mini_bodegas.disponible', true)
        .single()

      if (empresaError) {
        console.error('❌ Error consultando empresa:', empresaError)
        throw empresaError
      }

      console.log('✅ DATOS CRUDOS (solo disponibles):', {
        empresa: empresa?.nombre,
        totalMiniBodegas: empresa?.mini_bodegas?.length || 0,
        miniBodegasDetalle: empresa?.mini_bodegas?.map(b => ({
          id: b.id,
          ciudad: b.ciudad,
          zona: b.zona,
          metraje: b.metraje,
          precio: b.precio_mensual,
          disponible: b.disponible
        })) || []
      })

      if (!empresa) {
        console.log('⚠️ No se encontró empresa con ID:', id)
        setWarehouse(null)
        return
      }

      const descripcion = empresa.empresa_descripcion

      // ✅ SOLO MINI BODEGAS DISPONIBLES (ya vienen filtradas)
      const miniBodegas = empresa.mini_bodegas || []
      
      console.log('📦 Mini bodegas disponibles:', {
        total: miniBodegas.length,
        todas: miniBodegas.map(b => ({
          id: b.id,
          ciudad: b.ciudad,
          disponible: b.disponible
        }))
      })

      // Si no hay bodegas disponibles, devolver empresa sin bodegas
      if (miniBodegas.length === 0) {
        console.log('⚠️ No hay mini bodegas disponibles para esta empresa')
        setWarehouse({
          id: empresa.id,
          name: empresa.nombre,
          miniBodegas: [],
          totalBodegas: 0
        })
        return
      }

      // Calcular datos agregados solo de bodegas DISPONIBLES
      const precios = miniBodegas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
      const metrajes = miniBodegas.map(b => parseFloat(b.metraje)).filter(m => !isNaN(m))
      
      const priceRange = precios.length > 0 ? {
        min: Math.min(...precios),
        max: Math.max(...precios)
      } : { min: 0, max: 0 }

      const sizes = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : []

      // Obtener ubicaciones únicas
      const ubicaciones = [...new Set(miniBodegas.map(b => `${b.zona} - ${b.ciudad}`).filter(Boolean))]
      const location = ubicaciones.length > 0 ? ubicaciones[0] : (empresa.ciudad || 'Ubicación no especificada')

      // Extraer ciudades y zonas únicas
      const ciudades = [...new Set(miniBodegas.map(b => b.ciudad).filter(Boolean))]
      const zonas = [...new Set(miniBodegas.map(b => b.zona).filter(Boolean))]

      console.log('🌍 UBICACIONES PROCESADAS (disponibles):', {
        ciudadesUnicas: ciudades,
        zonasUnicas: zonas,
        totalUbicaciones: ubicaciones.length
      })

      // Características
      const features = descripcion?.caracteristicas || [
        "Vigilancia 24/7",
        "Acceso controlado",
        "Iluminación LED",
        "Fácil acceso vehicular"
      ]

      // Imágenes del carrusel
      const carruselImagenes = empresa.carrusel_imagenes?.sort((a, b) => a.orden - b.orden) || []
      const imagenesCarrusel = carruselImagenes
        .filter(img => img.imagen_url)
        .map(img => img.imagen_url)

      // Limitar a máximo 3 imágenes
      let imagenesPrincipal = imagenesCarrusel.slice(0, 3)

      // Si no hay suficientes, completar con imágenes de mini bodegas
      if (imagenesPrincipal.length < 3) {
        const imagenesMiniBodegas = miniBodegas
          .filter(b => b.imagen_url)
          .map(b => b.imagen_url)
        
        const faltantes = 3 - imagenesPrincipal.length
        const imagenesExtra = imagenesMiniBodegas.slice(0, faltantes)
        
        imagenesPrincipal = [...imagenesPrincipal, ...imagenesExtra]
      }

      // Si aún no hay imágenes, usar imagen por defecto
      if (imagenesPrincipal.length === 0) {
        imagenesPrincipal = ["https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"]
      }

      // Imagen principal para la card
      let companyImage = null
      if (imagenesCarrusel.length > 0) {
        companyImage = imagenesCarrusel[0]
      } else if (miniBodegas.length > 0 && miniBodegas[0].imagen_url) {
        companyImage = miniBodegas[0].imagen_url
      } else {
        companyImage = "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"
      }

      const warehouse = {
        id: empresa.id,
        name: empresa.nombre,
        location: location,
        city: ciudades[0] || empresa.ciudad || '',
        zone: zonas[0] || '',
        cities: ciudades,
        zones: zonas,
        address: descripcion?.direccion_general || '',
        description: descripcion?.descripcion_general,
        features: features,
        priceRange: priceRange,
        sizes: sizes,
        availableSizes: sizes,
        images: imagenesPrincipal,
        image: companyImage,
        companyImage: companyImage,
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        miniBodegas: miniBodegas, // ✅ SOLO BODEGAS DISPONIBLES
        empresa: empresa,
        totalBodegas: miniBodegas.length,
        disponible: miniBodegas.length > 0, // ✅ TRUE si hay al menos una disponible
        created_at: empresa.created_at
      }

      console.log('✅ WAREHOUSE FINAL (solo disponibles):', {
        id: warehouse.id,
        name: warehouse.name,
        totalMiniBodegas: warehouse.miniBodegas.length,
        cities: warehouse.cities,
        disponible: warehouse.disponible
      })

      setWarehouse(warehouse)

    } catch (err) {
      console.error('❌ Error en useWarehouseDetail:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const refetchWarehouseDetail = async () => {
    await fetchWarehouseDetail();
  };

  return { 
    warehouse, 
    loading, 
    error, 
    refetch: refetchWarehouseDetail 
  }
}