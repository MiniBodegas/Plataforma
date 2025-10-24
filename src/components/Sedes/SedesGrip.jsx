import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CrearSede } from "./CrearSede";
import { MiniBodegasInSede } from "./MiniBodegasInSede";

export function SedesGrid({ empresaId, onSelectSede, selectedSedeId, onExpandChange, onDeleteSede }) {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [justCreatedId, setJustCreatedId] = useState(null); // para abrir add tras crear
  const [dragOverId, setDragOverId] = useState(null);

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

  // Drop handler: mover mini bodega a esta sede
  const handleDropOnSede = async (e, targetSede) => {
    e.preventDefault();
    setDragOverId(null);
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const { bodegaId, fromSedeId } = JSON.parse(raw);
      if (!bodegaId) return;
      if (fromSedeId === targetSede.id) return; // mismo sitio

      const { error } = await supabase.from("mini_bodegas").update({ sede_id: targetSede.id }).eq("id", bodegaId);
      if (error) throw error;
      await load();
      // opcional: seleccionar la sede destino al soltar
      setExpandedId(targetSede.id);
      onSelectSede && onSelectSede(targetSede);
    } catch (err) {
      console.error("Error moviendo mini bodega:", err);
      window.alert("No se pudo mover la mini bodega. Revisa la consola.");
    }
  };

  const handleDragEnter = (sedeId) => setDragOverId(sedeId);
  const handleDragLeave = () => setDragOverId(null);

  useEffect(() => {
    load();
  }, [empresaId]);

  // Si el padre controla la sede seleccionada, sincronizar
  useEffect(() => {
    if (selectedSedeId) {
      setExpandedId(selectedSedeId);
    }
  }, [selectedSedeId]);

  const handleCreate = (sede) => {
    setSedes((prev) => [sede, ...prev]);
    setExpandedId(sede.id);
    setJustCreatedId(sede.id);
    onSelectSede && onSelectSede(sede);
    onExpandChange && onExpandChange(sede?.id ?? null);
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
    onExpandChange && onExpandChange(next);
  };

  const handleDelete = async (sede) => {
    if (!sede || !sede.id) return;
    const ok = window.confirm(`¿Eliminar sede "${sede.nombre || sede.ciudad}"?\nSe eliminarán también sus mini bodegas.`);
    if (!ok) return;
    setLoading(true);
    try {
      // primero eliminamos mini_bodegas vinculadas (si quieres mantener, quita esta línea)
      await supabase.from("mini_bodegas").delete().eq("sede_id", sede.id);
      const { error } = await supabase.from("sedes").delete().eq("id", sede.id);
      if (error) throw error;
      setSedes(prev => prev.filter(s => s.id !== sede.id));
      // si estaba expandida/seleccionada, limpiar selección
      if (expandedId === sede.id) {
        setExpandedId(null);
        onSelectSede && onSelectSede(null);
        onExpandChange && onExpandChange(null);
      }
      onDeleteSede && onDeleteSede(sede);
    } catch (e) {
      console.error("Error eliminando sede", e);
      window.alert("No se pudo eliminar la sede. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sedes.map((s) => (
        <div
          id={`sede-${s.id}`}
          key={s.id}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => handleDragEnter(s.id)}
          onDragLeave={() => handleDragLeave()}
          onDrop={(e) => handleDropOnSede(e, s)}
          className={`w-full px-8 py-6 rounded-lg border bg-white shadow-sm transition-all
            ${expandedId === s.id ? "ring-2 ring-[#4B799B]" : ""}
            ${dragOverId === s.id ? "border-2 border-blue-400 bg-blue-50" : ""}`}
          style={{
            transition: "border 0.2s, background 0.2s",
            zIndex: dragOverId === s.id ? 10 : 1
          }}
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(s)}
                  className="text-sm px-3 py-1 rounded bg-[#eef6fb] text-[#2C3A61]"
                >
                  {expandedId === s.id ? "Cerrar" : "Abrir"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                  title="Eliminar sede"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          {expandedId === s.id && (
            <div className="mt-3">
              <MiniBodegasInSede
                sede={s}
                onChange={load}
                autoOpenAdd={justCreatedId === s.id}
                onOpened={() => setJustCreatedId(null)}
                horizontal={false}
              />
            </div>
          )}
        </div>
      ))}

      {/* Card Crear Sede */}
      <div className="w-full p-4 rounded-lg border-dashed border-2 border-[#4B799B] bg-white flex flex-col justify-center">
        <div className="w-full">
          <h4 className="font-medium text-[#2C3A61] mb-2">Crear nueva sede</h4>
          <CrearSede empresaId={empresaId} onCreate={handleCreate} />
        </div>
      </div>

      {loading && (
        <div className="col-span-2">
          <p className="text-sm text-gray-500 mt-2">Cargando sedes...</p>
        </div>
      )}
    </div>
  );
}