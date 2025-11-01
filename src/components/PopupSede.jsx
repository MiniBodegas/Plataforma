// PopupSede.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CarruselImagenes } from "./index";

export function PopupSede({ sede, empresa, onClose, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: sede?.nombre || "",
    direccion: sede?.direccion || "",
    ciudad: sede?.ciudad || "",
    telefono: sede?.telefono || "",
    descripcion: sede?.descripcion || "",
    caracteristicas: Array.isArray(sede?.caracteristicas)
      ? sede.caracteristicas
      : sede?.caracteristicas
      ? safeParseArray(sede.caracteristicas)
      : [],
    nuevaImagen: null,
    nuevaImagenes: [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [miniBodegas, setMiniBodegas] = useState([]);
  const [loadingMini, setLoadingMini] = useState(true);

  const CARACTERISTICAS_DEFAULT = [
    "Acceso 24/7",
    "Vigilancia",
    "Parqueadero",
    "Montacargas",
    "Clima controlado",
    "Zona de carga",
    "Seguro incluido",
    "Cámaras de seguridad",
  ];

  useEffect(() => {
    const fetchMiniBodegas = async () => {
      if (!sede?.id) return;
      setLoadingMini(true);
      setError("");
      try {
        const { data, error: sbError, status } = await supabase
          .from("mini_bodegas")
          .select("*")
          .eq("sede_id", sede.id);

        if (sbError) {
          console.error("Error Supabase (mini_bodegas):", status, sbError);
          throw sbError;
        }
        setMiniBodegas(data || []);
      } catch (e) {
        console.error("Fallo cargando mini_bodegas:", e);
        setMiniBodegas([]);
      } finally {
        setLoadingMini(false);
      }
    };
    fetchMiniBodegas();
  }, [sede?.id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCaracteristica = (car) => {
    setForm((prev) => {
      const selected = new Set(prev.caracteristicas || []);
      if (selected.has(car)) selected.delete(car);
      else selected.add(car);
      return { ...prev, caracteristicas: Array.from(selected) };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      // 0) Verifica sesión
      const { data: authData, error: authErr } = await supabase.auth.getSession();
      if (authErr || !authData?.session) {
        throw new Error("Tu sesión expiró. Inicia sesión nuevamente e intenta de nuevo.");
      }

      let imagenUrl = sede?.imagen_url || "";

      // 1) Subir imagen (si hay nueva)
      if (form.nuevaImagen) {
        const file = form.nuevaImagen;

        // Asegura un nombre "limpio" y estable
        const safeName = normalizeFilename(file.name);
        const filePath = `${sede.id}/${Date.now()}-${safeName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("Sedes") // Asegúrate que el bucket se llama exactamente "Sedes"
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false, // Mejor fallo explícito si existe
            contentType: file.type || "image/jpeg",
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(
            `No se pudo subir la imagen: ${uploadError.message || "Error desconocido"}`
          );
        }

        const { data: pub } = supabase.storage.from("Sedes").getPublicUrl(uploadData.path);
        imagenUrl = pub?.publicUrl || "";
        if (!imagenUrl) {
          throw new Error("Imagen subida, pero no se pudo obtener la URL pública.");
        }
      }

      // 2) Actualiza la sede
      let imagenUrls = [];

      if (form.nuevaImagenes && form.nuevaImagenes.length > 0) {
        for (const file of form.nuevaImagenes) {
          const safeName = normalizeFilename(file.name);
          const filePath = `${sede.id}/${Date.now()}-${safeName}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("Sedes")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type || "image/jpeg",
            });
          if (uploadError) {
            setError(`No se pudo subir la imagen: ${uploadError.message || "Error desconocido"}`);
            setSaving(false);
            return;
          }
          const { data: pub } = supabase.storage.from("Sedes").getPublicUrl(uploadData.path);
          if (pub?.publicUrl) {
            imagenUrls.push(pub.publicUrl);
          }
        }
      } else if (sede?.imagen_url) {
        // Si ya hay imágenes previas, las conservamos
        if (Array.isArray(imagenes)) imagenUrls = imagenes;
        else if (typeof imagenes === "string") imagenUrls = [imagenes];
      }

      const { error: updateError } = await supabase
        .from("sedes")
        .update({
          nombre: form.nombre,
          direccion: form.direccion,
          ciudad: form.ciudad,
          telefono: form.telefono,
          descripcion: form.descripcion,
          caracteristicas: JSON.stringify(form.caracteristicas || []),
          imagen_url: JSON.stringify(imagenUrls),
        })
        .eq("id", sede.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("No se pudo guardar. Intenta de nuevo.");
      }

      setEditMode(false);
      onClose && onClose();
      onUpdate && onUpdate();
    } catch (e) {
      setError(e.message || "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  // Prepara arreglo de imágenes para el carrusel
  let imagenes = [];
  if (form.nuevaImagenes && form.nuevaImagenes.length > 0) {
    imagenes = form.nuevaImagenes.map(img => URL.createObjectURL(img));
  } else if (sede?.imagen_url) {
    const raw = sede.imagen_url;
    if (Array.isArray(raw)) {
      imagenes = raw;
    } else if (typeof raw === "string") {
      try {
        imagenes = raw.trim().startsWith("[") ? JSON.parse(raw) : [raw];
      } catch {
        imagenes = [raw];
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#2C3A61] text-2xl font-bold z-10"
          title="Cerrar"
        >
          ×
        </button>

        {/* Carrusel a la izquierda */}
        <div className="md:w-1/2 w-full p-6 flex items-center justify-center bg-blue-50">
          <CarruselImagenes imagenes={imagenes} />
        </div>

        {/* Info sede a la derecha */}
        <div className="md:w-1/2 w-full p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            {editMode ? (
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="text-2xl font-bold text-[#2C3A61] border-b border-[#2C3A61] outline-none w-full bg-white"
              />
            ) : (
              <h3 className="text-2xl font-bold text-[#2C3A61]">
                {sede?.nombre || "Sede"}
              </h3>
            )}
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-[#2C3A61] hover:underline text-sm font-semibold"
              >
                Editar
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm((prev) => ({ ...prev, nuevaImagen: null }));
                  setError("");
                }}
                className="text-gray-500 hover:text-[#2C3A61] text-sm font-semibold ml-2"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            <span className="font-semibold text-[#2C3A61]">Dirección:</span>{" "}
            {editMode ? (
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="border-b border-[#2C3A61] outline-none w-full bg-white"
              />
            ) : (
              <span>{sede?.direccion || "Sin dirección"}</span>
            )}
          </div>

          <div>
            <span className="font-semibold text-[#2C3A61]">Ciudad:</span>{" "}
            {editMode ? (
              <input
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                className="border-b border-[#2C3A61] outline-none w-full bg-white"
              />
            ) : (
              <span>{sede?.ciudad || "Sin ciudad"}</span>
            )}
          </div>

          <div>
            <span className="font-semibold text-[#2C3A61]">Teléfono:</span>{" "}
            {editMode ? (
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="border-b border-[#2C3A61] outline-none w-full bg-white"
              />
            ) : (
              <span>{sede?.telefono || "Sin teléfono"}</span>
            )}
          </div>

          <div>
            <span className="font-semibold text-[#2C3A61]">Descripción:</span>{" "}
            {editMode ? (
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="border-b border-[#2C3A61] outline-none w-full bg-white"
                rows={2}
              />
            ) : (
              <span>{sede?.descripcion || "Sin descripción"}</span>
            )}
          </div>

          <div>
            <span className="font-semibold text-[#2C3A61]">Características:</span>{" "}
            {editMode ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {CARACTERISTICAS_DEFAULT.map((car, idx) => (
                  <label
                    key={idx}
                    className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${
                      (form.caracteristicas || []).includes(car)
                        ? "bg-[#2C3A61] text-white border-[#2C3A61]"
                        : "bg-white text-[#2C3A61] border-[#2C3A61]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={(form.caracteristicas || []).includes(car)}
                      onChange={() => handleCaracteristica(car)}
                    />
                    {car}
                  </label>
                ))}
              </div>
            ) : (form.caracteristicas || []).length > 0 ? (
              (form.caracteristicas || []).map((c, i) => (
                <span
                  key={i}
                  className="inline-block bg-blue-100 text-[#2C3A61] px-2 py-1 rounded-full text-xs mr-2 mb-1"
                >
                  {c}
                </span>
              ))
            ) : (
              <span className="text-gray-500">Sin características</span>
            )}
          </div>

          {editMode && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
                Foto de la sede
              </label>
              <div className="flex items-center gap-3">
                {sede?.imagen_url && !form.nuevaImagen && (
                  <img
                    src={
                      Array.isArray(sede.imagen_url)
                        ? sede.imagen_url[0]
                        : typeof sede.imagen_url === "string"
                        ? (sede.imagen_url.trim().startsWith("[")
                            ? safeFirstFromJson(sede.imagen_url)
                            : sede.imagen_url)
                        : ""
                    }
                    alt="Foto sede"
                    className="h-16 w-16 object-cover rounded"
                  />
                )}

                {form.nuevaImagen && (
                  <img
                    src={URL.createObjectURL(form.nuevaImagen)}
                    alt="Previsualización"
                    className="h-16 w-16 object-cover rounded"
                  />
                )}

                {form.nuevaImagenes && form.nuevaImagenes.length > 0 ? (
                  form.nuevaImagenes.map((img, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      alt={`Previsualización ${idx + 1}`}
                      className="h-16 w-16 object-cover rounded mr-2"
                    />
                  ))
                ) : sede?.imagen_url ? (
                  Array.isArray(imagenes)
                    ? imagenes.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Imagen ${idx + 1}`}
                          className="h-16 w-16 object-cover rounded mr-2"
                        />
                      ))
                    : (
                      <img
                        src={imagenes[0]}
                        alt="Foto sede"
                        className="h-16 w-16 object-cover rounded"
                      />
                    )
                ) : null}

                <label className="text-xs text-[#2C3A61] cursor-pointer bg-white border border-[#BFD6EA] rounded px-2 py-1 hover:bg-blue-50 transition">
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length) {
                        setForm((prev) => ({
                          ...prev,
                          nuevaImagenes: files, // Cambia a un array
                        }));
                      }
                    }}
                  />
                </label>

                {form.nuevaImagen && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, nuevaImagen: null }))
                    }
                    className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          )}

          {editMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-4 px-6 py-2 rounded-lg font-semibold transition ${
                saving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#2C3A61] text-white hover:bg-[#1d2742]"
              }`}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          )}

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

          <div>
            <span className="font-semibold text-[#2C3A61]">
              MiniBodegas vinculadas:
            </span>
            {loadingMini ? (
              <span className="ml-2 text-gray-500">Cargando...</span>
            ) : miniBodegas.length === 0 ? (
              <span className="ml-2 text-gray-500">Ninguna</span>
            ) : (
              <ul className="ml-2 list-disc">
                {miniBodegas.map((mb) => (
                  <li key={mb.id} className="text-gray-700">
                    {mb.nombre_personalizado
                      ? mb.nombre_personalizado
                      : mb.metraje
                      ? `${mb.metraje} m²`
                      : mb.descripcion
                      ? mb.descripcion
                      : "Mini bodega"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Helpers ----------------- */

// Normaliza nombres de archivo para evitar 400 en Storage
function normalizeFilename(name = "") {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_") // reemplaza espacios/acentos/símbolos
    .toLowerCase();
}

// Parsea un string que podría ser JSON de array; si falla, retorna []
function safeParseArray(maybeJson) {
  if (Array.isArray(maybeJson)) return maybeJson;
  if (typeof maybeJson !== "string") return [];
  try {
    const parsed = JSON.parse(maybeJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Devuelve el primer elemento de un JSON array en string, si existe
function safeFirstFromJson(maybeJson) {
  try {
    const arr = JSON.parse(maybeJson);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : "";
  } catch {
    return "";
  }
}
