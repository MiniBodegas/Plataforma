import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { CrearSede } from "../index";

export function SedeSelector({ empresaId, value, onChange }) {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCrear, setShowCrear] = useState(false);

  useEffect(() => {
    if (!empresaId) return;
    setLoading(true);
    supabase
      .from("sedes")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("principal", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setSedes(data || []);
      })
      .finally(() => setLoading(false));
  }, [empresaId]);

  const handleCreate = (sede) => {
    setSedes(prev => [sede, ...prev]);
    onChange && onChange(sede);
    setShowCrear(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#2C3A61]">Sede</label>

      {sedes.length > 0 && !showCrear && (
        <select className="w-full p-2 border rounded bg-white" value={value?.id ?? ""} onChange={(e) => {
          const s = sedes.find(x => x.id === e.target.value) || null;
          onChange && onChange(s);
        }}>
          <option value="">-- Seleccionar sede --</option>
          {sedes.map(s => (
            <option key={s.id} value={s.id}>
              {s.nombre ?? `${s.ciudad} ${s.direccion ?? ""}`.trim()}
            </option>
          ))}
        </select>
      )}

      {loading && <p className="text-sm text-gray-500">Cargando sedes...</p>}

      <div className="flex gap-2">
        <button type="button" className="px-3 py-2 bg-[#2C3A61] text-white rounded" onClick={() => setShowCrear(prev => !prev)}>
          {showCrear ? "Cancelar" : "Crear nueva sede"}
        </button>
        {value && (
          <button type="button" className="px-3 py-2 border rounded" onClick={() => onChange && onChange(null)}>
            Quitar selección
          </button>
        )}
      </div>

      {showCrear && <CrearSede empresaId={empresaId} onCreate={handleCreate} />}
    </div>
  );
}