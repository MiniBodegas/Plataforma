import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Star, MapPin, Ruler, Shield } from "lucide-react"
import { supabase } from "../../lib/supabase"

export function WarehouseCard({
  warehouse = {},
  sede = null,
  empresa = null,
  minis = [],
  filtroActivo = null
}) {
  // Debug: inspeccionar props / datos internos

  const navigate = useNavigate()
  // fallback: si no llega `sede`, intentar traerla por id desde la tabla `sedes`
  const [sedeFetched, setSedeFetched] = useState(null)
  const minisToRender = (Array.isArray(minis) && minis.length > 0) ? minis : (warehouse?.miniBodegas || [])
  const sedeIdToFetch = sede?.id ?? minisToRender?.[0]?.sede_id ?? minisToRender?.[0]?.sede

  useEffect(() => {
    let mounted = true
    if (sede || !sedeIdToFetch) {
      // si ya tenemos sede o no hay id, no hacer fetch
      return
    }
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from("sedes")
          .select("id, nombre, ciudad, imagen_url")
          .eq("id", sedeIdToFetch)
          .single()
        if (!error && mounted) setSedeFetched(data || null)
      } catch (err) {
        console.error("[WarehouseCard] fetch sede by id error:", err)
      }
    })()
    return () => { mounted = false }
  }, [sede, sedeIdToFetch])

  // Preferir datos pasados explícitamente: sede > sedeFetched > warehouse
  const sedeObj = sede || (warehouse && warehouse.sede) || null
  const sedeFinal = sedeObj || sedeFetched || null

  // Mostrar únicamente el nombre de la sede, tomado directamente de la prop `sedeFinal`
  const displayedSedeName = sedeFinal?.nombre ?? "Sede sin nombre"

  const empresaObj =
    empresa ||
    (warehouse && { id: warehouse.id, name: warehouse.name, image: warehouse.image }) ||
    {}

  // minisToRender ya definido arriba

  // título y ciudad: usar siempre el nombre de la SEDE (sedeFinal)
  const displayedCity = sedeFinal?.ciudad ?? minisToRender?.[0]?.ciudad ?? empresaObj.city ?? warehouse?.city ?? ""

  // Normaliza imagen_url: si es un array en string, toma la primera imagen
  let sedeImage = sedeFinal?.imagen_url;

  if (sedeImage && typeof sedeImage === "string" && sedeImage.startsWith("[")) {
    try {
      const arr = JSON.parse(sedeImage);
      if (Array.isArray(arr) && arr.length > 0) sedeImage = arr[0];
    } catch (e) {
      console.warn("[WarehouseCard] Error parsing imagen_url:", e, sedeImage);
    }
  } 

  // Usar imagen de sede, y si no existe, usar un placeholder de Unsplash
  const image =
    sedeImage ||
    "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop"

  // Normalizar campos
  const id = sedeObj?.id ?? empresaObj?.id ?? warehouse?.id ?? null
  const name = empresaObj?.name || warehouse?.name || displayedSedeName

  // priceRange: inferir de minis si no viene
  const priceRange =
    empresaObj?.priceRange ||
    warehouse?.priceRange ||
    (() => {
      if (minisToRender && minisToRender.length > 0) {
        const prices = minisToRender
          .map((m) => m?.precio_mensual ?? m?.price ?? m?.price_month)
          .filter((v) => v != null && !Number.isNaN(Number(v)))
          .map(Number)
        if (prices.length === 0) return { min: 0, max: 0 }
        return { min: Math.min(...prices), max: Math.max(...prices) }
      }
      return { min: 0, max: 0 }
    })()

  const sizes =
    empresaObj?.sizes || warehouse?.sizes || minisToRender.map((m) => m?.metraje ?? m?.size ?? m?.tamano).filter(Boolean)

  const description = empresaObj?.description || warehouse?.description || ""
  const features = empresaObj?.features || warehouse?.features || []

  // rating/reviews
  const average = parseFloat(empresaObj?.rating ?? warehouse?.rating ?? 0) || 0
  const count = parseInt(empresaObj?.reviewCount ?? warehouse?.reviewCount ?? 0, 10) || 0
  const loadingReviews = false

  const canNavigate = Boolean(id)

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)

  // ✅ Generar URL con filtros
  const generateUrlWithFilters = (basePath) => {
    let url = basePath
    if (filtroActivo && (filtroActivo.ciudad || filtroActivo.zona || filtroActivo.empresa)) {
      const params = new URLSearchParams()
      if (filtroActivo.ciudad) params.append("ciudad", filtroActivo.ciudad)
      if (filtroActivo.zona) params.append("zona", filtroActivo.zona)
      if (filtroActivo.empresa) params.append("empresa", filtroActivo.empresa)
      if (params.toString()) url += `?${params.toString()}`
    }
    return url
  }

  // DESTINO UNIFICADO: usar la misma URL para la card y para el botón de reservar
  const destinoUrl = generateUrlWithFilters(`/bodegas/${id}`)

  // ✅ Botón Reservar -> misma URL que la tarjeta (reserva)
  const handleReserve = (e) => {
    e.stopPropagation()
    if (!canNavigate) return
    navigate(destinoUrl, { state: { warehouse, sede: sedeFinal, empresa: empresaObj, minis: minisToRender } })
  }

  // ✅ Click en la card -> /perfil-bodegas/${id}
  // Ignorar clicks que vienen de botones/links/inputs/iconos para evitar navegación accidental
  const handleCardClick = (e) => {
    // si no hay id no navegamos
    if (!canNavigate) return
    const target = e?.target
    // si el click proviene de un enlace, botón, input, svg o elemento que contenga aria-label, no navegamos
    if (target && target.closest && target.closest('a, button, input, label, svg')) {
      return
    }
    // navegación principal: misma URL de reserva
    navigate(destinoUrl, { state: { warehouse, sede: sedeFinal, empresa: empresaObj, minis: minisToRender } })
  }

  const handleLinkClick = (e) => {
    e.stopPropagation()
  }

  // ✅ URL del perfil para el <Link>
  const SedeslUrl = canNavigate ? generateUrlWithFilters(`/bodegas/${id}`) : "#"

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full max-w-[500px] flex flex-col cursor-pointer"
      onClick={(e) => handleCardClick(e)}
      role="button"
      tabIndex={0}
      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') handleCardClick(ev) }}
    >
      {/* Imagen */}
      <div className="relative h-40 sm:h-56">
        <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover" />
        {priceRange.min > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <div className="text-xs font-semibold text-[#2C3A61]">
              {priceRange.min === priceRange.max
                ? formatPrice(priceRange.min)
                : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`}
            </div>
            <div className="text-xs text-gray-600">COP /mes</div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="mb-2 sm:mb-3">
          <div className="flex flex-col mb-1 sm:mb-2">
            <Link
              to={SedeslUrl}
              className="font-semibold text-base sm:text-lg text-[#2C3A61] line-clamp-1"
              title={`Ir a reserva de ${displayedSedeName}${displayedCity ? ` · ${displayedCity}` : ''}`}
              onClick={handleLinkClick}
            >
              {displayedSedeName}{displayedCity ? ` · ${displayedCity}` : ''}
            </Link>
            {empresaObj?.name && (
              <Link
                to={`/perfil-bodegas/${empresaObj.id}`}
                className="text-sm text-gray-500 mt-1 line-clamp-1 hover:underline"
                title={`Ver perfil de ${empresaObj.name}`}
                onClick={handleLinkClick}
              >
                {empresaObj.name}
              </Link>
            )}
          </div>

          {/* Rating real */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm text-[#2C3A61] font-medium">
                {loadingReviews ? "..." : Number(average).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({loadingReviews ? "..." : count} reseñas)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2 sm:mb-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-xs sm:text-sm text-[#2C3A61]">{displayedCity}</span>
        </div>

        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1 mb-1 sm:mb-2">
            <Ruler className="h-4 w-4 text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-[#2C3A61]">Tamaños disponibles:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sizes && sizes.length > 0 ? (
              sizes.map((size, index) => (
                <span
                  key={`${String(size)}-${index}`}
                  className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-[#2C3A61]"
                >
                  {size}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">Consultar tamaños disponibles</span>
            )}
          </div>
        </div>

        {description && (
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-[#2C3A61] line-clamp-3">{description}</p>
        )}

        {features.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 2).map((feature, index) => (
                <span
                  key={`${String(feature)}-${index}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-[#2C3A61]"
                >
                  <Shield className="h-3 w-3" />
                  {feature}
                </span>
              ))}
              {features.length > 2 && (
                <span className="text-xs px-2 py-1 text-[#2C3A61]">+{features.length - 2} más</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <button
            type="button"
            aria-label={`Reservar ${name}`}
            disabled={!canNavigate}
            onClick={handleReserve}
            className={`w-full py-2 sm:py-2.5 px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              canNavigate
                ? "bg-[#4B799B] hover:bg-[#3b5f7a] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Reservar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
