import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Loader2, Building2 } from "lucide-react";
import { CrearSede } from "../../components/Sedes/CrearSede";

export function SedesEditorScreen() {
  const { user } = useAuth();
  const [empresaId, setEmpresaId] = useState(null);
  const [todasSedes, setTodasSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener empresaId del usuario actual
  useEffect(() => {
    const fetchEmpresaId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("empresas")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data?.id) setEmpresaId(data.id);
    };
    fetchEmpresaId();
  }, [user]);

  // Traer solo las sedes de la empresa activa
  useEffect(() => {
    const fetchTodasSedes = async () => {
      if (!empresaId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("sedes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });
      setTodasSedes(data || []);
      setLoading(false);
    };
    if (empresaId) fetchTodasSedes();
  }, [empresaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-[#2C3A61]" />
        <p className="text-[#2C3A61]">Cargando sedes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] to-[#f8fafc] py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-12">
        <div className="flex items-center gap-3 mb-10">
          <Building2 className="h-8 w-8 text-[#2C3A61]" />
          <h1 className="text-3xl font-bold text-[#2C3A61]">Mis Sedes</h1>
        </div>
        {/* Formulario para agregar nueva sede */}
        <div className="bg-blue-50/60 rounded-xl p-8 shadow-sm mb-14">
          <h2 className="text-xl font-semibold mb-4 text-[#2C3A61]">Agregar nueva sede</h2>
          <CrearSede
            empresaId={empresaId}
            onCreate={() => window.location.reload()} // refresca para ver la nueva sede
          />
        </div>
        {/* Lista de todas las sedes de la empresa activa */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#2C3A61]">Sedes registradas</h2>
          {todasSedes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              No hay sedes registradas.
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {todasSedes.map((sede) => (
                <li
                  key={sede.id}
                  className="border rounded-xl p-6 bg-blue-50/30 shadow-sm transition hover:shadow-lg md:col-span-2 w-full"
                  style={{ minWidth: "100%", maxWidth: "100%" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-lg text-[#2C3A61]">{sede.nombre}</div>
                    <span className="text-xs text-gray-400">
                      {new Date(sede.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    {sede.ciudad} {sede.direccion && `- ${sede.direccion}`}
                  </div>
                  {sede.descripcion && (
                    <div className="text-xs text-gray-500 mb-1">{sede.descripcion}</div>
                  )}
                  {sede.telefono && (
                    <div className="text-xs text-gray-500">Tel: {sede.telefono}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}