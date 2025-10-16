import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function CrearSede({ empresaId, onCreate, className }) {
  const [nombre, setNombre] = useState("Principal");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [zona, setZona] = useState("");
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
        zona: zona?.trim() || null,
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
      setZona("");
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
    <form className={className || "space-y-3"} onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-[#2C3A61]">Nombre de sede</label>
      <input className="w-full p-2 border rounded bg-white" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Principal" />

      <label className="block text-sm font-medium text-[#2C3A61]">Ciudad *</label>
      <input className="w-full p-2 border rounded bg-white" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Bogotá" />

      <label className="block text-sm font-medium text-[#2C3A61]">Dirección *</label>
      <input className="w-full p-2 border rounded bg-white" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Cra 15 # 34-56" />

      <label className="block text-sm font-medium text-[#2C3A61]">Zona</label>
      <input className="w-full p-2 border rounded bg-white" value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Norte" />

      <label className="block text-sm font-medium text-[#2C3A61]">Teléfono</label>
      <input className="w-full p-2 border rounded bg-white" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="3001234567" />

      <label className="inline-flex items-center gap-2 mt-1">
        <input type="checkbox" checked={principal} onChange={(e) => setPrincipal(e.target.checked)} />
        <span className="text-sm">Marcar como sede principal</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={loading} className="bg-[#2C3A61] text-white px-4 py-2 rounded">
          {loading ? "Creando..." : "Crear sede"}
        </button>
        <button type="button" onClick={() => { setNombre("Principal"); setCiudad(""); setDireccion(""); setZona(""); setTelefono(""); setError(null); }} className="px-3 py-2 border rounded">Limpiar</button>
      </div>
    </form>
  );
}