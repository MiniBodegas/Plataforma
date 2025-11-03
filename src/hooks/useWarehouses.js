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
      
      // ✅ CONSULTA DIRECTA (DEBERÍA FUNCIONAR CON LAS NUEVAS POLÍTICAS)
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })

      if (empresasError) {
        console.error('❌ Error consultando empresas con RLS:', empresasError)
        throw new Error(`Error RLS: ${empresasError.message}`)
      }

      if (!empresas || empresas.length === 0) {
        console.log('⚠️ No se encontraron empresas')
        setWarehouses([])
        return
      }

      // --- Traer todas las reviews de una sola vez desde la tabla de reviews (empresa_review)
      const empresaIds = empresas.map(e => String(e.id)).filter(Boolean)
      let allReviews = []
      try {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('empresa_review')
          .select('empresa_id, rating')
          .in('empresa_id', empresaIds)

        if (reviewsError) {
          console.warn('⚠️ Error cargando reviews (empresa_review):', reviewsError)
        } else {
          allReviews = (reviewsData || []).map(r => ({
            empresa_id: String(r.empresa_id),
            rating: Number(r.rating)
          }))
        }
      } catch (e) {
        console.warn('⚠️ Excepción cargando reviews:', e)
      }

      // Mapear reviews por empresa_id (ya normalizados a string)
      const reviewMap = new Map()
      ;(allReviews || []).forEach(r => {
        const id = String(r.empresa_id)
        const val = Number(r.rating) || 0
        if (!reviewMap.has(id)) reviewMap.set(id, [])
        reviewMap.get(id).push(val)
      })

      // PROCESAR CADA EMPRESA (usando string key lookup)
      const warehousesPromises = empresas.map(async (empresa) => {

        // Consultar mini_bodegas
        const { data: miniBodegas, error: miniBodegasError } = await supabase
          .from('mini_bodegas')
          .select('*')
          .eq('empresa_id', empresa.id)

        if (miniBodegasError) {
          console.warn(`⚠️ Error mini_bodegas para ${empresa.nombre}:`, miniBodegasError)
          
          // Intentar con proveedor_id como alternativa
          const { data: miniBodegasAlt, error: altError } = await supabase
            .from('mini_bodegas')
            .select('*')
            .eq('proveedor_id', empresa.id)

          if (!altError && miniBodegasAlt?.length > 0) {
            console.log(`✅ Usando proveedor_id para ${empresa.nombre}`)
            miniBodegas = miniBodegasAlt
          } else {
            console.warn(`❌ No hay mini_bodegas para ${empresa.nombre}`)
            miniBodegas = []
          }
        }

        // Consultar carrusel_imagenes
        const { data: carruselImagenes, error: carruselError } = await supabase
          .from('carrusel_imagenes')
          .select('*')
          .eq('empresa_id', empresa.id)
          .order('orden', { ascending: true })

        if (carruselError) {
          console.warn(`⚠️ Error carrusel para ${empresa.nombre}:`, carruselError)
        }

        // Consultar empresa_descripcion
        const { data: descripcionArray, error: descripcionError } = await supabase
          .from('empresa_descripcion')
          .select('*')
          .eq('empresa_id', empresa.id)

        if (descripcionError) {
          console.warn(`⚠️ Error descripción para ${empresa.nombre}:`, descripcionError)
        }

        const descripcion = descripcionArray?.[0]

        // Filtrar bodegas disponibles
        const miniBodegasDisponibles = (miniBodegas || []).filter(b => 
          b.disponible !== false && b.estado !== 'inactiva'
        )

        // Calcular precios
        const precios = miniBodegasDisponibles
          .map(b => parseFloat(b.precio_mensual || b.precio || 0))
          .filter(p => !isNaN(p) && p > 0)

        const priceRange = precios.length > 0 ? {
          min: Math.min(...precios),
          max: Math.max(...precios)
        } : { min: 50000, max: 300000 }

        // Calcular tamaños
        const metrajes = miniBodegasDisponibles
          .map(b => parseFloat(b.metraje || b.tamaño || 0))
          .filter(m => !isNaN(m) && m > 0)

        const sizes = metrajes.length > 0 ? metrajes.map(m => `${m}m³`) : ['Consultar']

        // Imágenes
        const imagenesCarrusel = (carruselImagenes || [])
          .filter(img => img.imagen_url)
          .map(img => img.imagen_url)

        const imagenesMiniBodegas = miniBodegasDisponibles
          .filter(b => b.imagen_url)
          .map(b => b.imagen_url)

        const todasLasImagenes = [...imagenesCarrusel, ...imagenesMiniBodegas]
        const companyImage = todasLasImagenes[0] || "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"

        // Ubicaciones
        const ubicaciones = [...new Set(miniBodegasDisponibles.map(b => 
          b.zona && b.ciudad ? `${b.zona} - ${b.ciudad}` : (b.ciudad || b.zona || '')
        ).filter(Boolean))]

        const location = ubicaciones.length > 0 ? ubicaciones[0] : (empresa.ciudad || 'Ubicación no especificada')
        const ciudades = [...new Set(miniBodegasDisponibles.map(b => b.ciudad).filter(Boolean))]
        const zonas = [...new Set(miniBodegasDisponibles.map(b => b.zona).filter(Boolean))]

        // --- Obtener rating real y reviewCount desde reviewMap ---
        let ratingValue = 0
        let reviewCount = 0

        // Normaliza empresa.id a string para buscar en reviewMap
        const vals = reviewMap.get(String(empresa.id)) || []
        reviewCount = vals.length
        ratingValue = reviewCount > 0 ? vals.reduce((a,b) => a + b, 0) / reviewCount : 0

        // Construir objeto warehouse (manteniendo el resto de campos)
        const warehouse = {
          id: empresa.id,
          name: empresa.nombre,
          location: location,
          city: ciudades[0] || empresa.ciudad || '',
          zone: zonas[0] || '',
          cities: ciudades,
          zones: zonas,
          address: descripcion?.direccion_general || empresa.direccion || '',
          description: descripcion?.descripcion_general || `${empresa.nombre} ofrece espacios seguros para almacenamiento.`,
          features: descripcion?.caracteristicas || [
            "Vigilancia 24/7",
            "Acceso controlado",
            "Iluminación LED",
            "Fácil acceso vehicular"
          ],
          priceRange: priceRange,
          sizes: sizes,
          availableSizes: sizes,
          images: todasLasImagenes.length > 0 ? todasLasImagenes : [companyImage],
          image: companyImage,
          companyImage: companyImage,
          // <-- usar valores reales calculados
          rating: Number((ratingValue || 0).toFixed(1)),
          reviewCount: reviewCount || 0,
          miniBodegas: miniBodegasDisponibles,
          empresa: empresa,
          totalBodegas: miniBodegasDisponibles.length,
          disponible: miniBodegasDisponibles.length > 0,
          created_at: empresa.created_at
        }

        return warehouse
      })

      const warehousesResults = await Promise.all(warehousesPromises)
      const warehousesValidos = warehousesResults.filter(w => w !== null)

      setWarehouses(warehousesValidos)

    } catch (err) {
      console.error('❌ Error con RLS activado:', err)
      setError(`RLS Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return { 
    warehouses, 
    loading, 
    error, 
    refetch: fetchWarehouses
  }
}