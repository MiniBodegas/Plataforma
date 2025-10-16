import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProveedorProfile(userId) {
  const [loading, setLoading] = useState(true)
  const [empresa, setEmpresa] = useState(null)
  const [imagenesCarrusel, setImagenesCarrusel] = useState([])
  const [descripcion, setDescripcion] = useState(null)
  const [miniBodegas, setMiniBodegas] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (!userId) {
        setEmpresa(null)
        setImagenesCarrusel([])
        setDescripcion(null)
        setMiniBodegas([])
        return
      }

      const { data: empresaData } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', userId)
        .single()

      setEmpresa(empresaData || null)
      const empresaId = empresaData?.id

      if (empresaId) {
        const { data: carrusel } = await supabase
          .from('carrusel_imagenes')
          .select('imagen_url, orden')
          .eq('empresa_id', empresaId)
          .order('orden')

        setImagenesCarrusel((carrusel || []).map(i => i.imagen_url))

        const { data: desc } = await supabase
          .from('empresa_descripcion')
          .select('*')
          .eq('empresa_id', empresaId)
          .single()

        setDescripcion(desc || null)

        const { data: mini } = await supabase
          .from('mini_bodegas')
          .select('*')
          .eq('empresa_id', empresaId)
          .order('orden')

        setMiniBodegas((mini || []).map(b => ({
          ...b,
          precioMensual: b.precio_mensual ? String(b.precio_mensual) : '',
          imagen: b.imagen_url || null,
          nombrePersonalizado: b.nombre_personalizado || ''
        })))
      } else {
        setImagenesCarrusel([])
        setDescripcion(null)
        setMiniBodegas([])
      }
    } catch (err) {
      console.error('useProveedorProfile load error', err)
      setEmpresa(null)
      setImagenesCarrusel([])
      setDescripcion(null)
      setMiniBodegas([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  return {
    loading,
    empresa,
    setEmpresa,
    imagenesCarrusel,
    setImagenesCarrusel,
    descripcion,
    setDescripcion,
    miniBodegas,
    setMiniBodegas,
    refresh: load
  }
}