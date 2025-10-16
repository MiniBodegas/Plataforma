import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CrearSede } from "./CrearSede";
import { MiniBodegasInSede } from "./MiniBodegasInSede";

export function SedesGrid({ empresaId, onSelectSede }) {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [justCreatedId, setJustCreatedId] = useState(null); // para abrir add tras crear

  const load = async () => {
    if (!empresaId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("sedes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("principal", { ascending: false })
        .order("created_at", { ascending: true });
      setSedes(data || []);
    } catch (e) {
      console.error("SedesGrid load", e);
      setSedes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [empresaId]);

  const handleCreate = (sede) => {
    setSedes((prev) => [sede, ...prev]);
    setExpandedId(sede.id);
    setJustCreatedId(sede.id);
    onSelectSede && onSelectSede(sede);
    // scroll card into view
    setTimeout(() => {
      const el = document.getElementById(`sede-${sede.id}`);
      if (el && el.scrollIntoView)
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 120);
  };

  const handleToggle = (sede) => {
    const next = expandedId === sede.id ? null : sede.id;
    setExpandedId(next);
    onSelectSede && onSelectSede(next ? sede : null);
  };

  return (
    <div className="space-y-4">
      {/* lista vertical: cada sede en su tarjeta (una abajo de otra) */}
      <div className="flex flex-col gap-4">
        {sedes.map((s) => (
          <div
            id={`sede-${s.id}`}
            key={s.id}
            className={`w-full p-4 rounded-lg border bg-white shadow-sm transition-all ${expandedId === s.id ? "ring-2 ring-[#4B799B]" : ""}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-[#2C3A61]">
                  {s.nombre || s.ciudad}
                </h3>
                <p className="text-sm text-gray-600">
                  {s.ciudad}
                  {s.direccion ? ` · ${s.direccion}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(s)}
                  className="text-sm px-3 py-1 rounded bg-[#eef6fb] text-[#2C3A61]"
                >
                  {expandedId === s.id ? "Cerrar" : "Abrir"}
                </button>
              </div>
            </div>

            {expandedId === s.id && (
              <div className="mt-3">
                {/* cuando la sede está abierta, mostrar mini bodegas en formato horizontal */}
                <MiniBodegasInSede
                  sede={s}
                  onChange={load}
                  autoOpenAdd={justCreatedId === s.id}
                  onOpened={() => setJustCreatedId(null)}
                  horizontal={true}
                />
              </div>
            )}
          </div>
        ))}

        {/* Card Crear Sede */}
        <div className="w-full p-4 rounded-lg border-dashed border-2 border-[#4B799B] bg-white">
          <div className="w-full">
            <h4 className="font-medium text-[#2C3A61] mb-2">Crear nueva sede</h4>
            <CrearSede empresaId={empresaId} onCreate={handleCreate} />
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500 mt-2">Cargando sedes...</p>}
    </div>
  );
}