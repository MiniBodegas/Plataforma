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

      console.log('🔍 Iniciando debug de warehouses...')

      // PASO 1: Verificar tabla empresas con todas las columnas
      console.log('📋 PASO 1: Verificando tabla empresas...')
      const { data: empresasTest, error: empresasTestError } = await supabase
        .from('empresas')
        .select('*')
        .limit(1)

      if (empresasTestError) {
        console.error('❌ Error en tabla empresas:', empresasTestError)
        throw new Error(`Error en empresas: ${empresasTestError.message}`)
      }

      console.log('✅ Empresas encontradas:', empresasTest)
      if (empresasTest && empresasTest.length > 0) {
        console.log('📊 Estructura de empresa (columnas disponibles):', Object.keys(empresasTest[0]))
      }

      if (!empresasTest || empresasTest.length === 0) {
        console.log('⚠️ No hay empresas en la base de datos')
        setWarehouses([])
        return
      }

      // PASO 2: Obtener todas las empresas con solo las columnas que sabemos que existen
      console.log('📋 PASO 2: Obteniendo todas las empresas...')
      
      // Usar solo las columnas básicas que seguro existen
      const { data: todasEmpresas, error: todasEmpresasError } = await supabase
        .from('empresas')
        .select('*') // Seleccionar todo para evitar errores de columnas

      if (todasEmpresasError) {
        console.error('❌ Error obteniendo todas las empresas:', todasEmpresasError)
        throw todasEmpresasError
      }

      console.log('✅ Todas las empresas obtenidas:', todasEmpresas.length)

      // PASO 3: Verificar mini_bodegas
      console.log('📋 PASO 3: Verificando mini_bodegas...')
      const { data: bodegasTest, error: bodegasTestError } = await supabase
        .from('mini_bodegas')
        .select('*')
        .limit(3)

      if (bodegasTestError) {
        console.error('❌ Error en mini_bodegas:', bodegasTestError)
      } else {
        console.log('✅ Mini bodegas:', bodegasTest)
        if (bodegasTest && bodegasTest.length > 0) {
          console.log('📊 Estructura mini_bodega:', Object.keys(bodegasTest[0]))
        }
      }

      // PASO 4: Verificar carrusel
      console.log('📋 PASO 4: Verificando carrusel...')
      const { data: carruselTest, error: carruselTestError } = await supabase
        .from('carrusel_imagenes')
        .select('*')
        .limit(3)

      if (carruselTestError) {
        console.error('❌ Error en carrusel:', carruselTestError)
      } else {
        console.log('✅ Carrusel:', carruselTest)
      }

      // PASO 5: Transformar datos
      const allWarehouses = []

      for (const empresa of todasEmpresas) {
        console.log(`🏢 Procesando empresa: ${empresa.nombre} (ID: ${empresa.id})`)

        // Obtener descripción de empresa_descripcion
        let empresaDescripcion = null
        try {
          const { data: descripcion } = await supabase
            .from('empresa_descripcion')
            .select('*')
            .eq('empresa_id', empresa.id)
            .single()
          
          empresaDescripcion = descripcion
          console.log(`  📝 Descripción encontrada: ${descripcion?.descripcion_general}`)
        } catch (error) {
          console.log(`  ⚠️ No hay descripción para empresa ${empresa.id}`)
        }

        // Obtener mini_bodegas de esta empresa
        let miniBodegas = []
        if (!bodegasTestError) {
          const { data: empresaBodegas } = await supabase
            .from('mini_bodegas')
            .select('*')
            .eq('empresa_id', empresa.id)

          miniBodegas = empresaBodegas || []
          console.log(`  📦 Bodegas encontradas: ${miniBodegas.length}`)
        }

        // Obtener carrusel de esta empresa
        let carruselImagenes = []
        if (!carruselTestError) {
          const { data: empresaCarrusel } = await supabase
            .from('carrusel_imagenes')
            .select('*')
            .eq('empresa_id', empresa.id)
            .order('orden')

          carruselImagenes = empresaCarrusel || []
          console.log(`  🖼️ Carrusel: ${carruselImagenes.length}`)
        }

        // Transformar datos usando las columnas que realmente existen
        const sizes = [...new Set(miniBodegas.map(b => `${b.metraje}m³`).filter(Boolean))]
        
        const precios = miniBodegas.map(b => parseFloat(b.precio_mensual)).filter(p => p > 0)
        const priceRange = precios.length > 0 
          ? { min: Math.min(...precios), max: Math.max(...precios) }
          : { min: 0, max: 0 }

        const ubicaciones = [...new Set(miniBodegas.map(b => {
          const parts = [b.ciudad, b.zona, b.direccion].filter(Boolean)
          return parts.join(', ')
        }).filter(Boolean))]

        const imagenPrincipal = carruselImagenes.length > 0 
          ? carruselImagenes[0]?.imagen_url
          : miniBodegas[0]?.imagen_url

        const warehouse = {
          id: empresa.id,
          name: empresa.nombre || 'Empresa sin nombre',
          location: ubicaciones[0] || 'Ubicación no disponible',
          sizes: sizes,
          priceRange: priceRange,
          image: imagenPrincipal || 'https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop',
          features: empresa.caracteristicas || [],
          rating: 4.5,
          // USAR DESCRIPCIÓN DE LA TABLA CORRECTA
          description: empresaDescripcion?.descripcion_general || 'Sin descripción',
          reviewCount: Math.floor(Math.random() * 50) + 10,
          miniBodegas: miniBodegas
        }

        console.log(`  ✅ Warehouse creado para ${empresa.nombre}`)
        allWarehouses.push(warehouse)
      }

      console.log('🎉 Total warehouses creados:', allWarehouses.length)
      setWarehouses(allWarehouses)

    } catch (err) {
      console.error('💥 Error general:', err)
      setError(err.message)
      
      // Usar datos de ejemplo
      setWarehouses([
        {
          id: 'demo-1',
          name: 'Bodega Demo',
          location: 'Cali, Colombia',
          sizes: ['10m³', '20m³'],
          priceRange: { min: 200000, max: 400000 },
          image: 'https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop',
          features: ['Seguridad 24/7'],
          rating: 4.5,
          description: 'Bodega de demostración',
          reviewCount: 25,
          miniBodegas: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const refreshWarehouses = () => {
    fetchWarehouses()
  }

  return {
    warehouses,
    loading,
    error,
    refreshWarehouses
  }
}