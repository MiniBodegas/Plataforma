import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CarruselImagenes } from "./index";

export function PopupSede({ sede, empresa, onClose, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: sede.nombre || "",
    direccion: sede.direccion || "",
    ciudad: sede.ciudad || "",
    telefono: sede.telefono || "",
    descripcion: sede.descripcion || "",
    caracteristicas: Array.isArray(sede.caracteristicas)
      ? sede.caracteristicas
      : sede.caracteristicas
      ? JSON.parse(sede.caracteristicas)
      : [],
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
    "Cámaras de seguridad"
  ];

  useEffect(() => {
    const fetchMiniBodegas = async () => {
      setLoadingMini(true);
      console.log("Consultando mini_bodegas para sede_id:", sede.id);
      const { data, error, status } = await supabase
        .from("mini_bodegas")
        .select("*")
        .eq("sede_id", sede.id);

      console.log("DEBUG respuesta Supabase:", { data, error, status });

      if (error) console.error("Error Supabase:", error);
      setMiniBodegas(data || []);
      setLoadingMini(false);
    };
    if (sede?.id) fetchMiniBodegas();
  }, [sede]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaracteristica = (car) => {
    setForm((prev) => ({
      ...prev,
      caracteristicas: prev.caracteristicas.includes(car)
        ? prev.caracteristicas.filter((c) => c !== car)
        : [...prev.caracteristicas, car],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("sedes")
      .update({
        nombre: form.nombre,
        direccion: form.direccion,
        ciudad: form.ciudad,
        telefono: form.telefono,
        descripcion: form.descripcion,
        caracteristicas: JSON.stringify(form.caracteristicas),
      })
      .eq("id", sede.id);
    setSaving(false);
    if (updateError) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } else {
      setEditMode(false);
      onClose();
      onUpdate && onUpdate();
    }
  };

  let imagenes = [];
  try {
    if (sede.imagen_url) {
      imagenes = JSON.parse(sede.imagen_url);
      if (!Array.isArray(imagenes)) imagenes = [imagenes];
    }
  } catch {
    imagenes = [];
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
              <h3 className="text-2xl font-bold text-[#2C3A61]">{sede.nombre}</h3>
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
                onClick={() => setEditMode(false)}
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
              <span>{sede.direccion || "Sin dirección"}</span>
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
              <span>{sede.ciudad}</span>
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
              <span>{sede.telefono || "Sin teléfono"}</span>
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
              <span>{sede.descripcion || "Sin descripción"}</span>
            )}
          </div>
          <div>
            <span className="font-semibold text-[#2C3A61]">Características:</span>{" "}
            {editMode ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {CARACTERISTICAS_DEFAULT.map((car, idx) => (
                  <label
                    key={idx}
                    className={`px-3 py-1 rounded-full border cursor-pointer text-sm
                      ${form.caracteristicas.includes(car)
                        ? "bg-[#2C3A61] text-white border-[#2C3A61]"
                        : "bg-white text-[#2C3A61] border-[#2C3A61]"}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.caracteristicas.includes(car)}
                      onChange={() => handleCaracteristica(car)}
                    />
                    {car}
                  </label>
                ))}
              </div>
            ) : form.caracteristicas && form.caracteristicas.length > 0 ? (
              form.caracteristicas.map((c, i) => (
                <span key={i} className="inline-block bg-blue-100 text-[#2C3A61] px-2 py-1 rounded-full text-xs mr-2 mb-1">{c}</span>
              ))
            ) : (
              <span className="text-gray-500">Sin características</span>
            )}
          </div>
          {editMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 bg-[#2C3A61] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1d2742] transition"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          )}
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div>
            <span className="font-semibold text-[#2C3A61]">MiniBodegas vinculadas:</span>
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