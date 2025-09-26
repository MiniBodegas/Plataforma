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

      // Consultar empresa específica con sus datos relacionados
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select(`
          *,
          carrusel_imagenes(imagen_url, orden),
          empresa_descripcion(*),
          mini_bodegas(*)
        `)
        .eq('id', id)
        .single()

      if (empresaError) {
        console.error('❌ Error consultando empresa:', empresaError)
        throw empresaError
      }

      console.log('✅ DATOS CRUDOS DE LA BASE DE DATOS:', {
        empresa: empresa.nombre,
        totalMiniBodegas: empresa.mini_bodegas?.length || 0,
        miniBodegasDetalle: empresa.mini_bodegas?.map(b => ({
          id: b.id,
          ciudad: b.ciudad,
          zona: b.zona,
          metraje: b.metraje,
          precio: b.precio_mensual,
          disponible: b.disponible,
          descripcion: b.descripcion,
          direccion: b.direccion,
          imagen_url: b.imagen_url
        })) || []
      })

      if (!empresa) {
        console.log('⚠️ No se encontró empresa con ID:', id)
        setWarehouse(null)
        return
      }

      // Transformar datos (SIN FILTRAR NADA AÚN)
      const descripcion = empresa.empresa_descripcion?.[0]
      const carruselImagenes = empresa.carrusel_imagenes?.sort((a, b) => a.orden - b.orden) || []
      const miniBodegas = empresa.mini_bodegas || []

      console.log('📋 TRANSFORMACIÓN DE DATOS:', {
        empresaNombre: empresa.nombre,
        descripcionEncontrada: !!descripcion,
        imagenesCarrusel: carruselImagenes.length,
        miniBodegasOriginales: miniBodegas.length
      })

      // Calcular datos agregados de TODAS las mini bodegas (sin filtrar)
      const precios = miniBodegas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
      const metrajes = miniBodegas.map(b => parseFloat(b.metraje)).filter(m => !isNaN(m))
      
      const priceRange = precios.length > 0 ? {
        min: Math.min(...precios),
        max: Math.max(...precios)
      } : { min: 0, max: 0 }

      // ✅ CORREGIR EL TYPO AQUÍ
      const sizes = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : []

      // Obtener ubicaciones únicas
      const ubicaciones = [...new Set(miniBodegas.map(b => `${b.zona} - ${b.ciudad}`).filter(Boolean))]
      const location = ubicaciones.length > 0 ? ubicaciones[0] : (empresa.ciudad || 'Ubicación no especificada')

      // Extraer ciudades y zonas únicas
      const ciudades = [...new Set(miniBodegas.map(b => b.ciudad).filter(Boolean))]
      const zonas = [...new Set(miniBodegas.map(b => b.zona).filter(Boolean))]

      console.log('🌍 UBICACIONES PROCESADAS:', {
        ciudadesUnicas: ciudades,
        zonasUnicas: zonas,
        ubicacionPrincipal: location,
        totalUbicaciones: ubicaciones.length
      })

      // Características
      const features = descripcion?.caracteristicas || [
        "Vigilancia 24/7",
        "Acceso controlado",
        "Iluminación LED",
        "Fácil acceso vehicular"
      ]

      // Imágenes
      const imagenesCarrusel = carruselImagenes
        .filter(img => img.imagen_url)
        .map(img => img.imagen_url)

      const imagenesMiniBodegas = miniBodegas
        .filter(b => b.imagen_url)
        .map(b => b.imagen_url)

      const todasLasImagenes = [...imagenesCarrusel, ...imagenesMiniBodegas]

      let companyImage = null
      if (carruselImagenes.length > 0 && carruselImagenes[0]?.imagen_url) {
        companyImage = carruselImagenes[0].imagen_url
      } else if (imagenesMiniBodegas.length > 0) {
        companyImage = imagenesMiniBodegas[0]
      } else {
        companyImage = "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"
      }

      // ✅ CREAR WAREHOUSE CON TODOS LOS DATOS SIN FILTRAR
      const warehouse = {
        id: empresa.id,
        name: empresa.nombre,
        location: location,
        city: ciudades[0] || empresa.ciudad || '',
        zone: zonas[0] || '',
        cities: ciudades,
        zones: zonas,
        address: descripcion?.direccion_general || '',
        description: descripcion?.descripcion_general || `${empresa.nombre} ofrece espacios seguros y accesibles para almacenamiento.`,
        features: features,
        priceRange: priceRange,
        sizes: sizes,
        availableSizes: sizes,
        images: todasLasImagenes.length > 0 ? todasLasImagenes : [companyImage],
        image: companyImage,
        companyImage: companyImage,
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        miniBodegas: miniBodegas, // ✅ TODAS LAS MINI BODEGAS SIN FILTRAR
        empresa: empresa,
        totalBodegas: miniBodegas.length,
        disponible: miniBodegas.some(b => b.disponible !== false),
        created_at: empresa.created_at
      }

      console.log('✅ WAREHOUSE FINAL CREADO:', {
        id: warehouse.id,
        name: warehouse.name,
        totalMiniBodegas: warehouse.miniBodegas.length,
        cities: warehouse.cities,
        zones: warehouse.zones,
        priceRange: warehouse.priceRange,
        miniBodegasCompletas: warehouse.miniBodegas.map(b => ({
          id: b.id,
          ciudad: b.ciudad,
          zona: b.zona,
          metraje: b.metraje,
          precio: b.precio_mensual
        }))
      })

      setWarehouse(warehouse)

    } catch (err) {
      console.error('❌ Error en useWarehouseDetail:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { warehouse, loading, error, refetch: fetchWarehouseDetail }
}