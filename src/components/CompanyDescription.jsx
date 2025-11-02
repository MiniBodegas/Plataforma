import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { CompanyRating } from './CompanyRating'
import { useCompanyReviews } from '../hooks/useCompanyReview'
import { useAuth } from '../contexts/AuthContext'
import useSedes from '../hooks/useSedes'
import { supabase } from '../lib/supabase'

export function CompanyDescription({
  warehouse = {},
  sede = null,
  onRate,
  user
}) {
  const empresaId = warehouse?.id
  const { user: authUser } = useAuth()
  const { average, count, addReview, yaCalifico } = useCompanyReviews(empresaId)

  // Contexto navegación / query
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = location.state || {}

  // Prioridades entrada
  const empresaIdFromState = state?.empresa?.id || state?.empresaId || null
  const sedeIdFromState = state?.sede?.id
    || state?.sedeId
    || searchParams.get('sede')
    || searchParams.get('sedeId')
    || null
  const ciudadFromState = state?.ciudad || searchParams.get('ciudad') || null

  // Empresa para traer sedes
  const empresaIdToFetch = empresaIdFromState || empresaId || null

  // Traer sedes para la empresa relevante (el hook puede NO traer descripcion)
  const { sedes: sedesHook = [], loading: loadingSedes } = useSedes({ empresaId: empresaIdToFetch, includeMinis: false })

  // Fallback: traer sede por id si el hook aún no devolvió o no tenemos prop
  const [fetchedSede, setFetchedSede] = useState(null)
  useEffect(() => {
    let mounted = true
    if (sede || !sedeIdFromState) return
    if (Array.isArray(sedesHook) && sedesHook.length > 0) return
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('sedes')
          // ⬇️ AQUI incluimos descripcion + imagen_url + features
          .select('id, nombre, ciudad, direccion, zona, empresa_id, principal, telefono, lat, lng, imagen_url, features, descripcion, created_at, updated_at')
          .eq('id', sedeIdFromState)
          .single()
        if (!error && mounted) setFetchedSede(data ? JSON.parse(JSON.stringify(data)) : null)
        if (error) console.debug('[CompanyDescription] fetch sede by id error', error)
      } catch (err) {
        console.error('[CompanyDescription] fetch sede by id throw', err)
      }
    })()
    return () => { mounted = false }
  }, [sede, sedeIdFromState, sedesHook])

  // --- Construir candidatas crudas ---
  const rawCandidates = useMemo(() => {
    const arr = []
    if (sede) arr.push(sede)
    if (state?.sede) arr.push(state.sede)
    if (fetchedSede) arr.push(fetchedSede)
    if (Array.isArray(sedesHook) && sedesHook.length > 0) arr.push(...sedesHook)
    return arr
  }, [sede, state?.sede, fetchedSede, sedesHook])

  // --- Enriquecer / desduplicar por id (preferir con direccion > principal > zona > descripcion) ---
  const score = (o) =>
    (o?.direccion ? 100 : 0) +
    (o?.principal ? 10 : 0) +
    (o?.zona ? 1 : 0) +
    // dar puntos extra si trae descripcion definida (no undefined)
    (typeof o?.descripcion !== 'undefined' ? 5 : 0)

  const candidates = useMemo(() => {
    const map = new Map()
    for (const c of rawCandidates) {
      const key = String(c?.id ?? '')
      if (!key) continue
      const prev = map.get(key)
      if (!prev || score(c) > score(prev)) {
        map.set(key, JSON.parse(JSON.stringify(c)))
      }
    }
    return Array.from(map.values())
  }, [rawCandidates])

  // --- Selección robusta de sedeFinal ---
  const preferById = (s) => (s ? candidates.find(x => String(x.id) === String(s.id)) || s : null)

  let sedeFinal = null

  // 1) Prop o state explícito
  if (sede) {
    sedeFinal = preferById(sede)
  } else if (state?.sede) {
    sedeFinal = preferById(state.sede)
  }

  // 2) Si viene sedeId en state/query
  if (!sedeFinal && sedeIdFromState) {
    sedeFinal = candidates.find(s => String(s?.id) === String(sedeIdFromState)) || null
  }

  // 3) Buscar por ciudad (si aplica), priorizando las que tengan dirección
  if (!sedeFinal && ciudadFromState) {
    sedeFinal =
      candidates.find(s => s?.direccion && String(s.ciudad).toLowerCase() === String(ciudadFromState).toLowerCase()) ||
      candidates.find(s => String(s.ciudad).toLowerCase() === String(ciudadFromState).toLowerCase()) ||
      null
  }

  // 4) Fallbacks: con dirección > principal > primera
  if (!sedeFinal) {
    sedeFinal = candidates.find(s => s?.direccion) || candidates.find(s => s?.principal) || candidates[0] || null
  }

  // 5) Mejorar si existe otra versión del mismo id con dirección
  if (sedeFinal && !sedeFinal?.direccion) {
    const upgraded = rawCandidates.find(
      s => String(s?.id) === String(sedeFinal.id) && s?.direccion
    )
    if (upgraded) sedeFinal = upgraded
  }

  // --- HIDRATACIÓN DE EMERGENCIA: si tenemos sedeFinal pero su descripcion es undefined, la traemos directo de DB ---
  const [hydrated, setHydrated] = useState({})
  const hydratingRef = useRef(false)

  useEffect(() => {
    let mounted = true
    const needsHydration =
      sedeFinal &&
      typeof sedeFinal.descripcion === 'undefined' && // undefined (no vino del hook)
      sedeFinal.id &&
      !hydrated[sedeFinal.id] && // no la hemos hidratado
      !hydratingRef.current

    if (!needsHydration) return

    hydratingRef.current = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('sedes')
          .select('id, descripcion, imagen_url, features')
          .eq('id', sedeFinal.id)
          .single()

        if (!mounted) return

        if (error) {
          console.debug('[CompanyDescription] hydration error', error)
        } else if (data) {
          // inyectamos en fetchedSede si coincide el id para que entre en candidates
          setFetchedSede(prev => {
            // si ya teníamos fetched de otro caso, mezclamos
            if (prev?.id === data.id) {
              return { ...prev, ...data }
            }
            // si no, devolvemos data (así participa en rawCandidates)
            return { ...data }
          })
          setHydrated(prev => ({ ...prev, [data.id]: true }))
        }
      } catch (e) {
        console.error('[CompanyDescription] hydration throw', e)
      } finally {
        hydratingRef.current = false
      }
    })()

    return () => { mounted = false }
  }, [sedeFinal, hydrated])

  // --- Presentación ---
  const displayedTitle = sedeFinal?.nombre || warehouse?.name || 'Empresa sin nombre'

  // Dirección
  const sedeAddress = (sedeFinal?.direccion && String(sedeFinal.direccion).trim().length > 0)
    ? String(sedeFinal.direccion).trim()
    : (sedeFinal?.ciudad && sedeFinal?.zona
        ? `${sedeFinal.ciudad} - ${sedeFinal.zona}`
        : (warehouse?.address || 'Dirección no disponible'))

  // Imagen de sede (puede venir como string o JSON string con array)
  let sedeImage = sedeFinal?.imagen_url
  if (sedeImage && typeof sedeImage === 'string' && sedeImage.startsWith('[')) {
    try {
      const arr = JSON.parse(sedeImage)
      if (Array.isArray(arr) && arr.length > 0) sedeImage = arr[0]
    } catch {
      // si falla el parse, dejamos el string tal cual
    }
  }
  const mainImage =
    sedeImage ||
    'https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop'

  // Características
  const displayFeatures = Array.isArray(warehouse?.features) && warehouse.features.length > 0
    ? warehouse.features
    : (Array.isArray(sedeFinal?.features) && sedeFinal.features.length > 0
        ? sedeFinal.features
        : [
            'Vigilancia 24/7 con cámaras de seguridad',
            'Acceso mediante código personalizado',
            'Iluminación LED eficiente y segura',
            'Fácil acceso en vehículo o a pie'
          ])

  // 📌 DESCRIPCIÓN: “obligatoriamente” usar la de la sede.
  // - Si la sede tiene descripcion !== undefined:
  //     * Si es null o vacía => mostramos mensaje por defecto.
  // - Si es undefined (no vino), el hidratador hará un fetch y re-renderá con ese valor.
  const displayedDescription = (() => {
    // Si sedeFinal no existe
    if (!sedeFinal) {
      return 'Información de la sede no disponible.'
    }

    const desc = sedeFinal.descripcion

    // Si es undefined (no vino del hook/fetch inicial), intentamos hidratar
    if (typeof desc === 'undefined') {
      return 'Cargando descripción de la sede…'
    }

    // Si es null, string vacío, o el texto por defecto
    if (!desc || desc.trim() === '' || desc === 'Sin descripción disponible') {
      return 'Esta sede aún no ha proporcionado una descripción detallada de sus servicios.'
    }

    // Tiene descripción válida
    return desc
  })()

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 hover:text-[#2C3A61] transition-colors duration-200 cursor-pointer hover:decoration-[#2C3A61]">
          {displayedTitle}
        </h3>

        {/* Dirección debajo del título */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <p className="text-lg text-gray-600">
            {sedeAddress}
          </p>
        </div>

        {/* Nombre de la empresa debajo de la dirección */}
        {warehouse?.name && (
          <Link
            to={`/perfil-bodegas/${warehouse.id}`}
            className="text-sm text-gray-500 mt-1 inline-block underline decoration-2 underline-offset-4"
          >
            {warehouse.name}
          </Link>
        )}

        {/* ⭐️ Sistema de calificación */}
        <CompanyRating
          value={average}
          reviewCount={count}
          user={authUser}
          onRate={async (val, comentario) => {
            const { error } = await addReview(val, comentario)
            if (error) {
              alert(error.message || error)
            } else {
              alert('¡Gracias por tu calificación!')
            }
          }}
        />
        {user && yaCalifico && (
          <div className="text-xs text-green-600 mt-2">
            Ya calificaste esta empresa.
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className="bg-[#4B799B] text-white rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2">Descripción</h3>
        <p className="leading-relaxed">
          {displayedDescription}
        </p>
      </div>

      {/* Imagen + Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Imagen */}
        <div>
          <img
            src={mainImage}
            alt={`Imagen de ${displayedTitle}`}
            className="rounded-2xl shadow-md w-full object-cover h-64 md:h-80"
            loading="lazy"
            onError={(e) => {
              // @ts-ignore
              e.target.src = 'https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop'
            }}
          />
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl shadow p-6 h-full">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Características</h3>
          {displayFeatures.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {displayFeatures.map((feature, index) => (
                <li key={`${String(feature)}-${index}`} className="leading-relaxed">
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No hay características específicas disponibles para esta empresa.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
