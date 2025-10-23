import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function CrearSede({ empresaId, onCreate, className }) {
  const [nombre, setNombre] = useState("Principal");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [principal, setPrincipal] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejar selección de múltiples imágenes
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError(null);

    if (!empresaId) {
      setError("Empresa no definida");
      return;
    }
    if (!ciudad.trim() || !direccion.trim()) {
      setError("Ciudad y dirección son obligatorias");
      return;
    }

    setLoading(true);
    let imagenes_urls = [];

    try {
      let sedeFolder = `${empresaId}-${Date.now()}`;
      // Subir imágenes si hay
      if (imagenes.length > 0) {
        for (const imagen of imagenes) {
          const fileExt = imagen.name.split(".").pop();
          const fileName = `${sedeFolder}/${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const { error: uploadError } = await supabase
            .storage
            .from("Sedes")
            .upload(fileName, imagen, { cacheControl: "3600", upsert: false });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase
            .storage
            .from("Sedes")
            .getPublicUrl(fileName);

          imagenes_urls.push(publicUrlData.publicUrl);
        }
      }

      const payload = {
        empresa_id: empresaId,
        nombre: nombre?.trim() || null,
        ciudad: ciudad.trim(),
        direccion: direccion.trim() || null,
        descripcion: descripcion?.trim() || null,
        telefono: telefono?.trim() || null,
        principal: !!principal,
        imagen_url: imagenes_urls.length > 0 ? JSON.stringify(imagenes_urls) : null,
        created_at: new Date().toISOString()
      };

      const { data, error: insertErr } = await supabase
        .from("sedes")
        .insert([payload])
        .select()
        .single();

      if (insertErr) throw insertErr;

      onCreate && onCreate(data);

      // limpiar formulario
      setNombre("Principal");
      setDireccion("");
      setCiudad("");
      setDescripcion("");
      setTelefono("");
      setPrincipal(false);
      setImagenes([]);
      setPreviews([]);
    } catch (err) {
      console.error("CrearSede error", err);
      setError(err.message || "Error creando sede");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={
        className ||
        "bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg p-10 w-full"
      }
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna 1: datos básicos */}
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-semibold text-[#2C3A61]">
            Nombre de sede
          </label>
          <input
            className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Principal"
          />

          <label className="block text-sm font-semibold text-[#2C3A61] mt-2">
            Ciudad *
          </label>
          <input
            className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Bogotá"
          />

          <label className="block text-sm font-semibold text-[#2C3A61] mt-2">
            Dirección *
          </label>
          <input
            className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Cra 15 # 34-56"
          />

          <label className="block text-sm font-semibold text-[#2C3A61] mt-2">
            Teléfono
          </label>
          <input
            className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="3001234567"
          />

          <label className="inline-flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={principal}
              onChange={(e) => setPrincipal(e.target.checked)}
              className="accent-[#2C3A61]"
            />
            <span className="text-sm">Marcar como sede principal</span>
          </label>
        </div>
        {/* Columna 2: descripción y subir imágenes */}
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-semibold text-[#2C3A61]">
            Descripción
          </label>
          <textarea
            className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition min-h-[180px] text-base"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción de la sede"
            rows={8}
          />

          {/* Subir imágenes debajo de descripción */}
          <label className="block text-sm font-semibold text-[#2C3A61] mb-2">
            Imágenes de la sede
          </label>
          <div className="w-full flex flex-col items-center">
            <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-[#2C3A61] rounded-xl bg-white p-6 w-64 h-48 hover:bg-blue-50 transition">
              <span className="text-[#2C3A61] text-sm mb-2">
                Haz clic o arrastra para agregar imágenes
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagenesChange}
                className="hidden"
              />
              <span className="text-4xl">📷</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {previews.map((src, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={src}
                    alt={`Previsualización ${idx + 1}`}
                    className="rounded-lg border w-20 h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Errores y botones */}
      <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#2C3A61] text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-[#1d2742] transition"
        >
          {loading ? "Creando..." : "Crear sede"}
        </button>
        <button
          type="button"
          onClick={() => {
            setNombre("Principal");
            setCiudad("");
            setDireccion("");
            setDescripcion("");
            setTelefono("");
            setImagenes([]);
            setPreviews([]);
            setError(null);
          }}
          className="px-6 py-3 border rounded-xl font-semibold bg-white hover:bg-gray-100 transition"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}