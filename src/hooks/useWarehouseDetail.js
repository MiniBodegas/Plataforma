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

      if (!empresa) {
        setWarehouse(null)
        return
      }

      // Transformar datos (SIN FILTRAR NADA AÚN)
      const descripcion = empresa.empresa_descripcion?.[0]
      const carruselImagenes = empresa.carrusel_imagenes?.sort((a, b) => a.orden - b.orden) || []
      const miniBodegas = empresa.mini_bodegas || []

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

      console.log('📸 Imágenes del carrusel en BD:', imagenesCarrusel.length)

      // ✅ LIMITAR A MÁXIMO 3 IMÁGENES
      let imagenesPrincipal = imagenesCarrusel.slice(0, 3)

      // ✅ Si no hay suficientes, completar con imágenes de mini bodegas (máximo 3 total)
      if (imagenesPrincipal.length < 3) {
        const imagenesMiniBodegas = miniBodegas
          .filter(b => b.imagen_url)
          .map(b => b.imagen_url)
        
        const faltantes = 3 - imagenesPrincipal.length
        const imagenesExtra = imagenesMiniBodegas.slice(0, faltantes)
        
        imagenesPrincipal = [...imagenesPrincipal, ...imagenesExtra]
        
        console.log('📸 Agregadas imágenes de mini bodegas:', imagenesExtra.length)
      }

      // ✅ Si aún no hay imágenes, usar imagen por defecto
      if (imagenesPrincipal.length === 0) {
        imagenesPrincipal = ["https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"]
      }

      console.log('📸 Imágenes finales para carrusel:', {
        total: imagenesPrincipal.length,
        urls: imagenesPrincipal
      })

      // ✅ IMAGEN PRINCIPAL PARA LA CARD
      let companyImage = null
      if (imagenesCarrusel.length > 0) {
        companyImage = imagenesCarrusel[0]
      } else if (miniBodegas.length > 0 && miniBodegas[0].imagen_url) {
        companyImage = miniBodegas[0].imagen_url
      } else {
        companyImage = "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"
      }

      // ✅ EN EL WAREHOUSE, USAR LAS IMÁGENES LIMITADAS
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
        images: imagenesPrincipal, // ✅ SOLO MÁXIMO 3 IMÁGENES
        image: companyImage,
        companyImage: companyImage,
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        miniBodegas: miniBodegas,
        empresa: empresa,
        totalBodegas: miniBodegas.length,
        disponible: miniBodegas.some(b => b.disponible !== false),
        created_at: empresa.created_at
      }

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