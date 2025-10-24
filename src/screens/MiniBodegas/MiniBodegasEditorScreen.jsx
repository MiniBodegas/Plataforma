import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { MiniBodegasInSede } from "../../components/Sedes/MiniBodegasInSede";

export function MiniBodegasEditorScreen() {
  const navigate = useNavigate();

  const [empresaId, setEmpresaId] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Obtener empresa_id del usuario actual
  const resolveEmpresaId = async () => {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) throw authErr;
    const user = authData?.user;
    if (!user) return null;

    // Busca la empresa donde el user_id coincide con el usuario actual
    const { data, error } = await supabase
      .from("empresas")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data?.id || null;
  };

  // 🔹 Cargar empresaId una vez
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const id = await resolveEmpresaId();
        if (active) setEmpresaId(id);
      } catch (e) {
        if (active) setErrorMsg(e.message || "Error obteniendo empresa.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // 🔹 Cargar sedes
  useEffect(() => {
    let active = true;

    const fetchSedes = async () => {
      if (!empresaId) return;
      try {
        setLoading(true);
        setErrorMsg("");
        const { data, error } = await supabase
          .from("sedes")
          .select("id, nombre, ciudad, empresa_id")
          .eq("empresa_id", empresaId)
          .order("nombre", { ascending: true });

        if (error) throw error;
        if (active) setSedes(data || []);
      } catch (e) {
        if (active) setErrorMsg(e.message || "Error cargando sedes.");
        if (active) setSedes([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSedes();

    return () => {
      active = false;
    };
  }, [empresaId]);

  const cuerpo = useMemo(() => {
    if (loading) {
      return <div className="text-center text-gray-500 py-10">Cargando...</div>;
    }

    if (errorMsg) {
      return <div className="text-center text-red-600 py-10">{errorMsg}</div>;
    }

    if (!empresaId) {
      return (
        <div className="text-center text-gray-500 py-10">
          No se encontró una empresa asociada a tu usuario.
        </div>
      );
    }

    if (sedes.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          No tienes sedes registradas.
        </div>
      );
    }

    return (
      <>
        {sedes.map((sede) => (
          <div key={sede.id} className="mb-10">
            <h2 className="text-xl font-semibold text-[#2C3A61] mb-2">
              {sede.nombre || sede.ciudad || "Sede sin nombre"}
            </h2>
            <MiniBodegasInSede sede={sede} />
          </div>
        ))}
      </>
    );
  }, [loading, errorMsg, empresaId, sedes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] to-[#f8fafc] py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-[#2C3A61] hover:underline font-semibold"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold text-[#2C3A61] mb-6">
          Mini bodegas por sede
        </h1>

        {cuerpo}
      </div>
    </div>
  );
}
