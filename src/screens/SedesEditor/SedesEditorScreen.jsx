import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Loader2, Building2, Trash2 } from "lucide-react";
import { CrearSede } from "../../components/Sedes/CrearSede";
import { PopupSede } from "../../components/index";
import { useNavigate } from "react-router-dom";

export function SedesEditorScreen() {
  const { user } = useAuth();
  const [empresaId, setEmpresaId] = useState(null);
  const [todasSedes, setTodasSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupSede, setPopupSede] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [miniBodegas, setMiniBodegas] = useState([]);
  const [sedeAEliminar, setSedeAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const navigate = useNavigate();

  // ✅ Obtener empresaId y datos de empresa
  useEffect(() => {
    const fetchEmpresaId = async () => {
      console.log("🔍 Buscando empresa para user:", user);
      console.log("📋 User ID:", user?.id);
      
      if (!user?.id) {
        console.warn("⚠️ No hay usuario autenticado o no tiene ID");
        setLoading(false);
        return;
      }

      try {
        // Primero, verificar TODAS las empresas
        const { data: todasEmpresas, error: errorTodas } = await supabase
          .from("empresas")
          .select("*");
        
        console.log("🏢 TODAS las empresas en la BD:", todasEmpresas);
        console.log("❓ Error al obtener todas:", errorTodas);

        // Ahora buscar la empresa del usuario
        const { data, error } = await supabase
          .from("empresas")
          .select("*")
          .eq("user_id", user.id);

        console.log("📊 Resultado empresa (query completa):", { data, error });
        console.log("🔑 Buscando con user_id:", user.id);

        if (error) {
          console.error("❌ Error obteniendo empresa:", error);
          setLoading(false);
          return;
        }

        // Verificar si data es un array o un objeto
        const empresaData = Array.isArray(data) ? data[0] : data;

        console.log("📦 Empresa parseada:", empresaData);

        if (empresaData?.id) {
          console.log("✅ Empresa encontrada:", empresaData);
          setEmpresaId(empresaData.id);
          setEmpresa(empresaData);
        } else {
          console.warn("⚠️ No se encontró empresa para este usuario");
          console.log("🔍 Data recibida:", data);
          console.log("🔍 Tipo de data:", typeof data, Array.isArray(data));
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error inesperado:", err);
        setLoading(false);
      }
    };

    fetchEmpresaId();
  }, [user?.id]);

  // ✅ Traer sedes cuando cambie empresaId
  useEffect(() => {
    const fetchTodasSedes = async () => {
      console.log("🔍 Buscando sedes para empresaId:", empresaId);
      
      if (!empresaId) {
        console.warn("⚠️ No hay empresaId, saltando búsqueda de sedes");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("sedes")
          .select("*")
          .eq("empresa_id", empresaId)
          .order("created_at", { ascending: false });

        console.log("📊 Resultado sedes:", { 
          empresaId, 
          cantidad: data?.length || 0, 
          data, 
          error 
        });

        if (error) {
          console.error("❌ Error obteniendo sedes:", error);
          setTodasSedes([]);
        } else {
          console.log("✅ Sedes cargadas:", data?.length || 0);
          setTodasSedes(data || []);
        }
      } catch (err) {
        console.error("❌ Error inesperado:", err);
        setTodasSedes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodasSedes();
  }, [empresaId]);

  // ✅ Traer minibodegas cuando cambie popupSede
  useEffect(() => {
    const fetchMiniBodegas = async () => {
      if (!popupSede) {
        setMiniBodegas([]);
        return;
      }

      console.log("🔍 Buscando minibodegas para sede:", popupSede.id);

      try {
        const { data, error } = await supabase
          .from("mini_bodegas")
          .select("*")
          .eq("sede_id", popupSede.id);

        console.log("📊 Minibodegas encontradas:", data?.length || 0);

        if (error) {
          console.error("❌ Error obteniendo minibodegas:", error);
          setMiniBodegas([]);
        } else {
          setMiniBodegas(data || []);
        }
      } catch (err) {
        console.error("❌ Error inesperado:", err);
        setMiniBodegas([]);
      }
    };

    fetchMiniBodegas();
  }, [popupSede?.id]);

  // ✅ Función para refrescar sedes
  const refrescarSedes = async () => {
    console.log("🔄 Refrescando sedes...");
    
    if (!empresaId) {
      console.warn("⚠️ No se puede refrescar, no hay empresaId");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("sedes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      console.log("📊 Sedes refrescadas:", data?.length || 0);

      if (error) {
        console.error("❌ Error refrescando sedes:", error);
        setTodasSedes([]);
      } else {
        setTodasSedes(data || []);
      }
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      setTodasSedes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para eliminar sede
  const handleEliminarSede = async (sedeId) => {
    try {
      setEliminando(true);

      const { data: minibodegasVinculadas, error: checkError } = await supabase
        .from("mini_bodegas")
        .select("id")
        .eq("sede_id", sedeId);

      if (checkError) throw checkError;

      if (minibodegasVinculadas && minibodegasVinculadas.length > 0) {
        alert(
          `No se puede eliminar esta sede porque tiene ${minibodegasVinculadas.length} minibodega(s) vinculada(s). Elimina primero las minibodegas.`
        );
        setSedeAEliminar(null);
        setEliminando(false);
        return;
      }

      const sede = todasSedes.find((s) => s.id === sedeId);
      if (sede?.imagen_url) {
        try {
          const imagenes = JSON.parse(sede.imagen_url);
          for (const imageUrl of imagenes) {
            const urlParts = imageUrl.split("/");
            const fileName = urlParts[urlParts.length - 1];
            const folderPath = urlParts[urlParts.length - 2];
            const filePath = `${folderPath}/${fileName}`;

            const { error: deleteStorageError } = await supabase.storage
              .from("Sedes")
              .remove([filePath]);

            if (deleteStorageError) {
              console.warn("Error eliminando imagen:", deleteStorageError);
            }
          }
        } catch (parseError) {
          console.warn("Error procesando imágenes:", parseError);
        }
      }

      const { error: deleteError } = await supabase
        .from("sedes")
        .delete()
        .eq("id", sedeId);

      if (deleteError) throw deleteError;

      setTodasSedes((prev) => prev.filter((s) => s.id !== sedeId));
      setSedeAEliminar(null);
      alert("Sede eliminada exitosamente");
    } catch (error) {
      console.error("Error eliminando sede:", error);
      alert("Error al eliminar la sede: " + error.message);
    } finally {
      setEliminando(false);
    }
  };

  console.log("📌 Estado actual:", {
    user: user?.id,
    empresaId,
    empresa: empresa?.nombre,
    cantidadSedes: todasSedes.length,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 mb-4 text-[#2C3A61]" />
        <p className="text-[#2C3A61]">Cargando sedes...</p>
        <p className="text-xs text-gray-500 mt-2">
          {empresaId ? `Empresa ID: ${empresaId}` : 'Buscando empresa...'}
        </p>
      </div>
    );
  }

  if (!empresaId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-[#2C3A61] mb-2">
            No tienes una empresa registrada
          </h2>
          <p className="text-gray-600 mb-4">
            Necesitas registrar una empresa antes de crear sedes.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Debug Info:</strong>
            </p>
            <p className="text-xs text-gray-500">
              User ID: {user?.id || 'No disponible'}
            </p>
            <p className="text-xs text-gray-500">
              Email: {user?.email || 'No disponible'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("🔍 Reintentando búsqueda de empresa...");
                window.location.reload();
              }}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-100 transition"
            >
              Recargar
            </button>
            <button
              onClick={() => navigate("/empresa")}
              className="flex-1 px-6 py-3 bg-[#2C3A61] text-white rounded-xl font-semibold hover:bg-[#1d2742] transition"
            >
              Ir a Empresas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] to-[#f8fafc] py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-12">
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

        <div className="flex items-center gap-3 mb-10">
          <Building2 className="h-8 w-8 text-[#2C3A61]" />
          <h1 className="text-3xl font-bold text-[#2C3A61]">Mis Sedes</h1>
          {empresa && (
            <span className="text-sm text-gray-500 ml-2">({empresa.nombre})</span>
          )}
        </div>

        <div className="bg-blue-50/60 rounded-xl p-8 shadow-sm mb-14">
          <h2 className="text-xl font-semibold mb-4 text-[#2C3A61]">
            Agregar nueva sede
          </h2>
          <CrearSede empresaId={empresaId} onCreate={refrescarSedes} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#2C3A61]">
            Sedes registradas ({todasSedes.length})
          </h2>
          {todasSedes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No hay sedes registradas.</p>
              <p className="text-sm mt-1">Crea tu primera sede arriba ⬆️</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {todasSedes.map((sede) => (
                <li
                  key={sede.id}
                  className="border rounded-xl p-6 bg-blue-50/30 shadow-sm transition hover:shadow-lg relative group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSedeAEliminar(sede);
                    }}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Eliminar sede"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="cursor-pointer" onClick={() => setPopupSede(sede)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-lg text-[#2C3A61]">
                        {sede.nombre}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(sede.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {sede.ciudad}
                      {sede.direccion && ` - ${sede.direccion}`}
                    </div>
                    {sede.descripcion && (
                      <div className="text-xs text-gray-500 mb-1">
                        {sede.descripcion}
                      </div>
                    )}
                    {sede.telefono && (
                      <div className="text-xs text-gray-500">Tel: {sede.telefono}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {sedeAEliminar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C3A61] mb-2">
                  ¿Eliminar sede?
                </h3>
                <p className="text-gray-600 mb-4">Estás a punto de eliminar la sede:</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-[#2C3A61]">{sedeAEliminar.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {sedeAEliminar.ciudad}
                    {sedeAEliminar.direccion && ` - ${sedeAEliminar.direccion}`}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ Esta acción no se puede deshacer
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSedeAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEliminarSede(sedeAEliminar.id)}
                  disabled={eliminando}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {eliminando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {popupSede && (
          <PopupSede
            sede={popupSede}
            empresa={empresa}
            miniBodegas={miniBodegas}
            onClose={() => setPopupSede(null)}
            onUpdate={refrescarSedes}
          />
        )}
      </div>
    </div>
  );
}