import React, { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { CompanyRating } from './CompanyRating'
import { useCompanyReviews } from '../hooks/useCompanyReview'
import { useAuth } from '../contexts/AuthContext'
import { ProfileService } from '../services/ProfileService'
import useSedes from '../hooks/useSedes'
import { supabase } from '../lib/supabase'

export function CompanyDescriptionContainer({ warehouseId, user, sede: propSede = null }) {
  const location = useLocation()
  const incomingSede = propSede || location.state?.sede || null

  const [warehouse, setWarehouse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchWarehouse() {
      setLoading(true)
      try {
        const data = await ProfileService.getEmpresaById(warehouseId)
        if (mounted) setWarehouse(data)
      } catch (err) {
        console.error('[CompanyDescriptionContainer] fetch error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (warehouseId) fetchWarehouse()
    else setLoading(false)
    return () => { mounted = false }
  }, [warehouseId])

  if (loading) return <div>Cargando...</div>

  return (
    <CompanyDescription
      warehouse={warehouse}
      sede={incomingSede}
      user={user}
    />
  )
}

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
  const userCity = sede?.ciudad || ciudadFromState || null

  // Empresa para traer sedes
  const empresaIdToFetch = empresaIdFromState || empresaId || null

  // Traer sedes para la empresa relevante
  const { sedes: sedesHook = [], loading: loadingSedes } = useSedes({ empresaId: empresaIdToFetch, includeMinis: false })

  // Fallback: traer sede por id si el hook no devolvió aún
  const [fetchedSede, setFetchedSede] = useState(null)
  useEffect(() => {
    let mounted = true
    if (sede || !sedeIdFromState) return
    if (Array.isArray(sedesHook) && sedesHook.length > 0) return
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('sedes')
          .select('id, nombre, ciudad, direccion, zona, empresa_id, principal, telefono, lat, lng, created_at, updated_at')
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
  const rawCandidates = []
  if (sede) rawCandidates.push(sede)
  if (state?.sede) rawCandidates.push(state.sede)
  if (fetchedSede) rawCandidates.push(fetchedSede)
  if (Array.isArray(sedesHook) && sedesHook.length > 0) rawCandidates.push(...sedesHook)

  // --- Enriquecer / desduplicar por id (preferir con direccion > principal > zona) ---
  const score = (o) =>
    (o?.direccion ? 100 : 0) + (o?.principal ? 10 : 0) + (o?.zona ? 1 : 0)

  const candidatesMap = new Map()
  for (const c of rawCandidates) {
    const key = String(c?.id ?? '')
    if (!key) continue
    const prev = candidatesMap.get(key)
    if (!prev || score(c) > score(prev)) {
      candidatesMap.set(key, JSON.parse(JSON.stringify(c)))
    }
  }
  const candidates = Array.from(candidatesMap.values())

  // --- Selección robusta de sedeFinal ---
  let sedeFinal = null
  const preferById = (s) => (s ? candidates.find(x => String(x.id) === String(s.id)) || s : null)

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

  // --- Presentación ---
  const displayedTitle = sedeFinal?.nombre || warehouse?.name || 'Empresa sin nombre'
  const sedeAddress = (sedeFinal?.direccion && String(sedeFinal.direccion).trim().length > 0)
    ? String(sedeFinal.direccion).trim()
    : (sedeFinal?.ciudad && sedeFinal?.zona ? `${sedeFinal.ciudad} - ${sedeFinal.zona}` : (warehouse?.address || 'Dirección no disponible'))

  const mainImage = warehouse?.companyImage ||
    'https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop'

  const displayFeatures = Array.isArray(warehouse?.features) && warehouse.features.length > 0
    ? warehouse.features
    : [
        'Vigilancia 24/7 con cámaras de seguridad',
        'Acceso mediante código personalizado',
        'Iluminación LED eficiente y segura',
        'Fácil acceso en vehículo o a pie'
      ]

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 hover:text-[#2C3A61] transition-colors duration-200 cursor-pointer hover:decoration-[#2C3A61]">
          {displayedTitle}
        </h3>
        {/* Dirección debajo del título (desde useSedes / sedeFinal) */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <p className="text-lg text-gray-600">
            {sedeAddress}
          </p>
        </div>

        {/* Nombre de la empresa debajo de la dirección */}
        
        {warehouse?.name && (
          <Link to ={`/perfil-bodegas/${warehouse.id}`} className="text-sm text-gray-500 mt-1 inline-block underline decoration-2 underline-offset-4">
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
          {warehouse?.description && warehouse?.description !== 'Sin descripción disponible'
            ? warehouse.description
            : 'Esta empresa aún no ha proporcionado una descripción detallada de sus servicios.'}
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
              // @ts-ignore - fallback seguro
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
