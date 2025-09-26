import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Consultando empresas desde la DB...')

      // Consultar empresas con sus datos relacionados
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select(`
          *,
          carrusel_imagenes(imagen_url, orden),
          empresa_descripcion(*),
          mini_bodegas(*)
        `)
        .order('created_at', { ascending: false })

      if (empresasError) {
        console.error('❌ Error consultando empresas:', empresasError)
        throw empresasError
      }

      console.log('✅ Empresas encontradas:', empresas?.length || 0)
      
      if (!empresas || empresas.length === 0) {
        console.log('⚠️ No se encontraron empresas en la DB')
        setWarehouses([])
        return
      }

      // Transformar datos de empresas a formato warehouse (VERSIÓN ORIGINAL)
      const warehousesTransformados = empresas.map(empresa => {
        const descripcion = empresa.empresa_descripcion?.[0]
        const carruselImagenes = empresa.carrusel_imagenes?.sort((a, b) => a.orden - b.orden) || []
        const miniBodegas = empresa.mini_bodegas || []

        // Debug: Ver qué imágenes llegan
        console.log(`🖼️ Imágenes para ${empresa.nombre}:`, {
          carruselImagenes: carruselImagenes.length,
          primeraImagenCarrusel: carruselImagenes[0]?.imagen_url,
          miniBodegasConImagen: miniBodegas.filter(b => b.imagen_url).length
        })

        // Calcular datos agregados de las mini bodegas
        const precios = miniBodegas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p))
        const metrajes = miniBodegas.map(b => parseFloat(b.metraje)).filter(m => !isNaN(m))
        
        const priceRange = precios.length > 0 ? {
          min: Math.min(...precios),
          max: Math.max(...precios)
        } : { min: 0, max: 0 }

        const sizes = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : []

        // Obtener ubicaciones únicas de las mini bodegas
        const ubicaciones = [...new Set(miniBodegas.map(b => `${b.zona} - ${b.ciudad}`).filter(Boolean))]
        const location = ubicaciones.length > 0 ? ubicaciones[0] : (empresa.ciudad || 'Ubicación no especificada')

        // Extraer ciudades y zonas únicas
        const ciudades = [...new Set(miniBodegas.map(b => b.ciudad).filter(Boolean))]
        const zonas = [...new Set(miniBodegas.map(b => b.zona).filter(Boolean))]

        // Características por defecto o desde descripcion
        const features = descripcion?.caracteristicas || [
          "Vigilancia 24/7",
          "Acceso controlado",
          "Iluminación LED",
          "Fácil acceso vehicular"
        ]

        // Obtener imágenes con fallbacks múltiples
        const imagenesCarrusel = carruselImagenes
          .filter(img => img.imagen_url)
          .map(img => img.imagen_url)

        const imagenesMiniBodegas = miniBodegas
          .filter(b => b.imagen_url)
          .map(b => b.imagen_url)

        // Combinar todas las imágenes disponibles
        const todasLasImagenes = [...imagenesCarrusel, ...imagenesMiniBodegas]

        // Imagen principal con múltiples fallbacks
        let companyImage = null

        if (carruselImagenes.length > 0 && carruselImagenes[0]?.imagen_url) {
          companyImage = carruselImagenes[0].imagen_url
          console.log(`✅ Usando imagen carrusel para ${empresa.nombre}:`, companyImage)
        } else if (imagenesMiniBodegas.length > 0) {
          companyImage = imagenesMiniBodegas[0]
          console.log(`✅ Usando imagen mini bodega para ${empresa.nombre}:`, companyImage)
        } else {
          companyImage = "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"
          console.log(`⚠️ Usando imagen por defecto para ${empresa.nombre}`)
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
          description: descripcion?.descripcion_general || `${empresa.nombre} ofrece espacios seguros y accesibles para almacenamiento.`,
          features: features,
          priceRange: priceRange,
          sizes: sizes,
          availableSizes: sizes,
          images: todasLasImagenes.length > 0 ? todasLasImagenes : [companyImage],
          image: companyImage, // Para compatibilidad con WarehouseCard
          companyImage: companyImage,
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          miniBodegas: miniBodegas,
          empresa: empresa,
          totalBodegas: miniBodegas.length,
          disponible: miniBodegas.some(b => b.disponible !== false),
          created_at: empresa.created_at
        }

        console.log(`📦 Warehouse transformado: ${warehouse.name}`, {
          location: warehouse.location,
          cities: warehouse.cities,
          zones: warehouse.zones,
          totalBodegas: warehouse.totalBodegas,
          priceRange: warehouse.priceRange,
          companyImage: warehouse.companyImage,
          totalImages: warehouse.images.length
        })

        return warehouse
      })

      console.log('✅ Total warehouses transformados:', warehousesTransformados.length)
      setWarehouses(warehousesTransformados)

    } catch (err) {
      console.error('❌ Error en fetchWarehouses:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { warehouses, loading, error, refetch: fetchWarehouses }
}