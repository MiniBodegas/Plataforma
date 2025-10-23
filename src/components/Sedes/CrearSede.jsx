import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function CrearSede({ empresaId, onCreate, className }) {
  const [nombre, setNombre] = useState("Principal");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [principal, setPrincipal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    try {
      const payload = {
        empresa_id: empresaId,
        nombre: nombre?.trim() || null,
        ciudad: ciudad.trim(),
        direccion: direccion.trim() || null,
        descripcion: descripcion?.trim() || null,
        telefono: telefono?.trim() || null,
        principal: !!principal,
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
        "bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
      }
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <label className="block text-sm font-semibold text-[#2C3A61]">Nombre de sede</label>
        <input
          className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Principal"
        />

        <label className="block text-sm font-semibold text-[#2C3A61] mt-2">Ciudad *</label>
        <input
          className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          placeholder="Bogotá"
        />

        <label className="block text-sm font-semibold text-[#2C3A61] mt-2">Dirección *</label>
        <input
          className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Cra 15 # 34-56"
        />

        <label className="block text-sm font-semibold text-[#2C3A61] mt-2">Teléfono</label>
        <input
          className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition text-base"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="3001234567"
        />
      </div>
      <div className="flex flex-col gap-4">
        <label className="block text-sm font-semibold text-[#2C3A61]">Descripción</label>
        <textarea
          className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#2C3A61] transition min-h-[100px] text-base"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción de la sede"
          rows={6}
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

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex items-center gap-2 mt-4">
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
              setError(null);
            }}
            className="px-6 py-3 border rounded-xl font-semibold bg-white hover:bg-gray-100 transition"
          >
            Limpiar
          </button>
        </div>
      </div>
    </form>
  );
}