import { useCallback, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useSedes({ empresaId = null, empresaIds = null, includeMinis = false } = {}) {
  const [sedes, setSedes] = useState([])
  const [miniPorSede, setMiniPorSede] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSedes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[useSedes] fetchSedes -> empresaId:", empresaId, "empresaIds:", empresaIds, "includeMinis:", includeMinis)
      // preparar filtro por ids (empresaId single o empresaIds array)
      let query = supabase.from("sedes").select("id, nombre, ciudad, direccion, empresa_id, principal, telefono, lat, lng, created_at, updated_at, imagen_url")
      if (empresaId) {
        query = query.eq("empresa_id", empresaId)
      } else if (Array.isArray(empresaIds) && empresaIds.length > 0) {
        query = query.in("empresa_id", empresaIds)
      }
      const { data: sedesData, error: sedesErr } = await query
      console.log("[useSedes] query result sedes:", sedesData, "error:", sedesErr)
      if (sedesErr) throw sedesErr
      setSedes(sedesData || [])

      if (includeMinis) {
        // traer mini_bodegas para las sedes/empresas retornadas
        // preferimos filtrar por empresa_id si hay, sino por sede ids
        const empresaIdsToQuery = empresaId ? [empresaId] : (empresaIds || (sedesData || []).map(s => s.empresa_id).filter(Boolean))
        const sedeIdsToQuery = (sedesData || []).map(s => s.id).filter(Boolean)

        let minisQuery = supabase.from("mini_bodegas").select("*")
        if (sedeIdsToQuery.length > 0) {
          minisQuery = minisQuery.in("sede_id", sedeIdsToQuery)
        } else if (empresaIdsToQuery.length > 0) {
          minisQuery = minisQuery.in("empresa_id", empresaIdsToQuery)
        }

        const { data: minisData, error: minisErr } = await minisQuery
        console.log("[useSedes] query result minis:", minisData, "error:", minisErr)
        if (minisErr) throw minisErr

        const grouped = {}
        ;(minisData || []).forEach(m => {
          const sid = m.sede_id || m.sede || "sin_sede"
          if (!grouped[sid]) grouped[sid] = []
          grouped[sid].push(m)
        })
        setMiniPorSede(grouped)
      } else {
        setMiniPorSede({})
      }
    } catch (err) {
      console.error("[useSedes] fetch error:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, empresaIds, includeMinis])

  useEffect(() => {
    fetchSedes()
  }, [fetchSedes])

  return { sedes, miniPorSede, loading, error, refresh: fetchSedes }
}

export default useSedes