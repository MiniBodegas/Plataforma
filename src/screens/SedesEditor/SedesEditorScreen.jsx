import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Loader2, Building2 } from "lucide-react";
import { CrearSede } from "../../components/Sedes/CrearSede";
import { CarruselImagenes } from "../../components/index";

export function SedesEditorScreen() {
  const { user } = useAuth();
  const [empresaId, setEmpresaId] = useState(null);
  const [todasSedes, setTodasSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupSede, setPopupSede] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [miniBodegas, setMiniBodegas] = useState([]);

  // Obtener empresaId y datos de empresa
  useEffect(() => {
    const fetchEmpresaId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("empresas")
        .select("id, nombre")
        .eq("user_id", user.id)
        .single();
      if (data?.id) setEmpresaId(data.id);
      setEmpresa(data);
    };
    fetchEmpresaId();
  }, [user]);

  // Traer sedes de la empresa activa
  useEffect(() => {
    const fetchTodasSedes = async () => {
      if (!empresaId) return;
      setLoading(true);
      const { data } = await supabase
        .from("sedes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });
      setTodasSedes(data || []);
      setLoading(false);
    };
    if (empresaId) fetchTodasSedes();
  }, [empresaId]);

  // Traer minibodegas vinculadas a la sede seleccionada
  useEffect(() => {
    const fetchMiniBodegas = async () => {
      if (!popupSede) return setMiniBodegas([]);
      const { data } = await supabase
        .from("minibodegas")
        .select("*")
        .eq("sede_id", popupSede.id);
      setMiniBodegas(data || []);
    };
    if (popupSede) fetchMiniBodegas();
  }, [popupSede]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-[#2C3A61]" />
        <p className="text-[#2C3A61]">Cargando sedes...</p>
      </div>
    );
  }

  // Pop-up modularizado
  const PopupSede = ({ sede, onClose }) => {
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden">
          {/* Carrusel a la izquierda */}
          <div className="md:w-1/2 w-full p-6 flex items-center justify-center bg-blue-50">
            <CarruselImagenes imagenes={imagenes} />
          </div>
          {/* Info sede a la derecha */}
          <div className="md:w-1/2 w-full p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-[#2C3A61]">{sede.nombre}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#2C3A61] text-2xl font-bold"
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">Empresa:</span>{" "}
              <span>{empresa?.nombre || "Sin nombre"}</span>
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">Dirección:</span>{" "}
              <span>{sede.direccion || "Sin dirección"}</span>
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">Ciudad:</span>{" "}
              <span>{sede.ciudad}</span>
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">Teléfono:</span>{" "}
              <span>{sede.telefono || "Sin teléfono"}</span>
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">Descripción:</span>{" "}
              <span>{sede.descripcion || "Sin descripción"}</span>
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">Características:</span>{" "}
              {sede.caracteristicas
                ? (Array.isArray(sede.caracteristicas)
                    ? sede.caracteristicas
                    : JSON.parse(sede.caracteristicas)
                  ).map((c, i) => (
                    <span key={i} className="inline-block bg-blue-100 text-[#2C3A61] px-2 py-1 rounded-full text-xs mr-2 mb-1">{c}</span>
                  ))
                : <span className="text-gray-500">Sin características</span>
              }
            </div>
            <div>
              <span className="font-semibold text-[#2C3A61]">MiniBodegas vinculadas:</span>
              {miniBodegas.length === 0 ? (
                <span className="ml-2 text-gray-500">Ninguna</span>
              ) : (
                <ul className="ml-2 list-disc">
                  {miniBodegas.map((mb) => (
                    <li key={mb.id} className="text-gray-700">{mb.nombre}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            onCreate={() => window.location.reload()}
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
                  className="border rounded-xl p-6 bg-blue-50/30 shadow-sm transition hover:shadow-lg cursor-pointer"
                  style={{ minWidth: "100%", maxWidth: "100%" }}
                  onClick={() => setPopupSede(sede)}
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
        {/* Popup sede */}
        {popupSede && (
          <PopupSede sede={popupSede} onClose={() => setPopupSede(null)} />
        )}
      </div>
    </div>
  );
}