import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useWarehouseDetail(id) {
  const [warehouse, setWarehouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    if (!id) {
      setLoading(false)
      setWarehouse(null)
      setError(null)
      return
    }

    const fetchWarehouseDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 useWarehouseDetail - Consultando empresa ID:', id)

        // ❗️LEFT JOINS (sin !inner) + maybeSingle
        const { data: empresa, error: empresaError } = await supabase
          .from('empresas')
          .select(`
            id,
            nombre,
            created_at,
            carrusel_imagenes ( imagen_url, orden ),
            empresa_descripcion (
              descripcion_general,
              direccion_general,
              caracteristicas,
              imagenes_urls
            ),
            mini_bodegas ( * )
          `)
          .eq('id', id)
          .maybeSingle()

        if (empresaError) {
          // Trata PGRST116 como “no encontrado”, no como crash
          if (empresaError?.code === 'PGRST116') {
            if (!alive) return
            setWarehouse(null)
            setError(null)
            return
          }
          console.error('❌ Error consultando empresa:', empresaError)
          throw empresaError
        }

        if (!empresa) {
          console.log('⚠️ No se encontró empresa con ID:', id)
          if (!alive) return
          setWarehouse(null)
          setError(null)
          return
        }

        // --- Datos relacionados seguros ---
        const descripcion = empresa.empresa_descripcion || null
        const todasLasBodegas = Array.isArray(empresa.mini_bodegas) ? empresa.mini_bodegas : []

        console.log('✅ DATOS CRUDOS:', {
          empresa: empresa?.nombre,
          totalMiniBodegas: todasLasBodegas.length,
          miniBodegasDetalle: todasLasBodegas.map(b => ({
            id: b.id, ciudad: b.ciudad, zona: b.zona,
            metraje: b.metraje, precio: b.precio_mensual, disponible: b.disponible
          }))
        })

        // Si no hay bodegas, retorna estructura mínima segura
        if (todasLasBodegas.length === 0) {
          const fallbackImages =
            (empresa.carrusel_imagenes || [])
              .sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0))
              .map(i => i?.imagen_url)
              .filter(Boolean)
              .slice(0, 3)

          const imagenesPrincipal = fallbackImages.length > 0
            ? fallbackImages
            : ["https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"]

          if (!alive) return
          setWarehouse({
            id: empresa.id,
            name: empresa.nombre,
            location: 'Ubicación no especificada',
            city: '',
            zone: '',
            cities: [],
            zones: [],
            address: descripcion?.direccion_general || '',
            description: descripcion?.descripcion_general || '',
            features: descripcion?.caracteristicas || ["Vigilancia 24/7", "Acceso controlado", "Iluminación LED", "Fácil acceso vehicular"],
            priceRange: { min: 0, max: 0 },
            sizes: [],
            availableSizes: [],
            images: imagenesPrincipal,
            image: imagenesPrincipal[0],
            companyImage: imagenesPrincipal[0],
            rating: 4.5,
            reviewCount: 20,
            miniBodegas: [],
            empresa,
            totalBodegas: 0,
            disponible: true,
            created_at: empresa.created_at
          })
          return
        }

        // --- Agregados ---
        const precios = todasLasBodegas
          .map(b => Number(b.precio_mensual))
          .filter(p => !Number.isNaN(p))

        const metrajes = todasLasBodegas
          .map(b => Number(b.metraje))
          .filter(m => !Number.isNaN(m))

        const priceRange = precios.length
          ? { min: Math.min(...precios), max: Math.max(...precios) }
          : { min: 0, max: 0 }

        const sizes = Array.from(new Set(metrajes))
          .sort((a, b) => a - b)
          .map(m => `${m}m³`)

        // Ubicaciones (evitar strings vacíos)
        const norm = v => (v ?? '').trim()
        const ciudades = Array.from(new Set(
          todasLasBodegas.map(b => norm(b.ciudad)).filter(Boolean)
        ))
        const zonas = Array.from(new Set(
          todasLasBodegas.map(b => norm(b.zona)).filter(Boolean)
        ))
        const ubicaciones = Array.from(new Set(
          todasLasBodegas.map(b => {
            const z = norm(b.zona)
            const c = norm(b.ciudad)
            if (!z && !c) return null
            return `${z || '—'} - ${c || '—'}`
          }).filter(Boolean)
        ))
        const location = ubicaciones[0] || 'Ubicación no especificada'

        // Imágenes del carrusel (orden tolerante)
        const imagenesCarrusel = (empresa.carrusel_imagenes || [])
          .sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0))
          .map(i => i?.imagen_url)
          .filter(Boolean)

        // Máximo 3 imágenes priorizando carrusel y luego mini_bodegas
        let imagenesPrincipal = imagenesCarrusel.slice(0, 3)
        if (imagenesPrincipal.length < 3) {
          const imagenesMiniBodegas = todasLasBodegas
            .map(b => b?.imagen_url)
            .filter(Boolean)
          const faltantes = 3 - imagenesPrincipal.length
          imagenesPrincipal = [...imagenesPrincipal, ...imagenesMiniBodegas.slice(0, faltantes)]
        }
        if (imagenesPrincipal.length === 0) {
          imagenesPrincipal = ["https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"]
        }
        const companyImage = imagenesPrincipal[0]

        const mapped = {
          id: empresa.id,
          name: empresa.nombre,
          location,
          city: ciudades[0] || '',
          zone: zonas[0] || '',
          cities: ciudades,
          zones: zonas,
          address: descripcion?.direccion_general || '',
          description: descripcion?.descripcion_general || '',
          features: descripcion?.caracteristicas || ["Vigilancia 24/7", "Acceso controlado", "Iluminación LED", "Fácil acceso vehicular"],
          priceRange,
          sizes,
          availableSizes: sizes,
          images: imagenesPrincipal,
          image: companyImage,
          companyImage,
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          miniBodegas: todasLasBodegas,  // ← TODAS (no filtramos disponibilidad aquí)
          empresa,
          totalBodegas: todasLasBodegas.length,
          disponible: true,
          created_at: empresa.created_at
        }

        console.log('✅ WAREHOUSE FINAL:', {
          id: mapped.id,
          name: mapped.name,
          totalMiniBodegas: mapped.miniBodegas.length,
          disponibles: mapped.miniBodegas.filter(b => b.disponible).length,
          noDisponibles: mapped.miniBodegas.filter(b => !b.disponible).length,
          cities: mapped.cities,
          zones: mapped.zones
        })

        if (!alive) return
        setWarehouse(mapped)
      } catch (err) {
        console.error('❌ Error en useWarehouseDetail:', err)
        if (!alive) return
        setError(err?.message || 'Error desconocido')
        setWarehouse(null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchWarehouseDetail()
    return () => { alive = false }
  }, [id])

  const refetchWarehouseDetail = async () => {
    // No setState si el componente se desmonta; el alive del effect se encarga
    // Reutilizamos la lógica del effect disparando un cambio artificial del id, pero
    // aquí podemos simplemente volver a llamar a la función internamente si lo prefieres:
    // Para simplicidad, forzamos el mismo fetch:
    try {
      // Repetimos la misma función que en el effect:
      // Podrías extraerla fuera del useEffect si quieres reutilizarla 1:1.
      // Para mantener tu API:
      // (opcional) podrías setear un estado "reloadTick" y colocarlo en deps.
      window.location.reload()
    } catch {}
  }

  return { warehouse, loading, error, refetch: refetchWarehouseDetail }
}
