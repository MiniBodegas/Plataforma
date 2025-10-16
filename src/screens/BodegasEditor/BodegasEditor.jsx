import { useEffect, useState } from "react";
import { Trash2, Save, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useProveedorProfile } from "../../hooks/useProveedorProfile";
import { BodegaCarruselEditor, DescriptionEditor, BodegasList } from "../../components/index";

export function BodegaEditorProveedorScreen() {
  const { user } = useAuth();
  const userId = user?.id;

  // Hook centralizado que trae empresa, imagenesCarrusel, descripcion y miniBodegas
  const {
    loading,
    empresa,
    setEmpresa,
    imagenesCarrusel,
    setImagenesCarrusel,
    descripcion,
    setDescripcion,
    miniBodegas,
    setMiniBodegas,
    refresh
  } = useProveedorProfile(userId);

  // Estados locales adicionales (form, UX)
  const [direccionGeneral, setDireccionGeneral] = useState("");
  const [descripcionGeneral, setDescripcionGeneral] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [imagenesDescripcion, setImagenesDescripcion] = useState([]);

  const [cargando, setCargando] = useState(loading);
  const [guardandoTodo, setGuardandoTodo] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });
  const [eliminandoBodega, setEliminandoBodega] = useState(null);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [empresaId, setEmpresaId] = useState(null);

  // Wrapper que acepta string o object y mantiene empresa como objeto en el estado
  const handleEmpresaChange = (value) => {
    if (value && typeof value === "object") {
      setEmpresa(value);
    } else {
      setEmpresa(prev => ({ ...(prev || {}), nombre: String(value || "") }));
    }
  };

  useEffect(() => {
    setCargando(loading);
  }, [loading]);

  // Cuando hook entrega datos, poblar los estados locales que usa DescriptionEditor
  useEffect(() => {
    if (!descripcion) return;
    setDireccionGeneral(descripcion.direccion_general || "");
    setDescripcionGeneral(descripcion.descripcion_general || "");
    setCaracteristicas(Array.isArray(descripcion.caracteristicas) ? descripcion.caracteristicas.join(", ") : (descripcion.caracteristicas || ""));
    setImagenesDescripcion(descripcion.imagenes_urls || []);
  }, [descripcion]);

  useEffect(() => {
    if (empresa) {
      setEmpresaId(empresa.id);
      setPerfilCompleto(true);
    }
  }, [empresa]);

  // Mensajes temporales
  const mostrarMensaje = (tipo, texto, duracion = 4000) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: null, texto: "" }), duracion);
  };

  const MensajeEstado = () => {
    if (!mensaje.tipo) return null;
    const estilos = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    };
    const iconos = {
      success: <CheckCircle className="h-5 w-5" />,
      error: <AlertTriangle className="h-5 w-5" />,
      info: <Loader2 className="h-5 w-5 animate-spin" />
    };
    return (
      <div className={`fixed top-4 right-4 z-50 p-3 border rounded-lg shadow-lg max-w-md ${estilos[mensaje.tipo]}`}>
        <div className="flex items-center gap-2">
          {iconos[mensaje.tipo]} <span className="font-medium">{mensaje.texto}</span>
        </div>
      </div>
    );
  };

  // Helpers de upload (locales, reuse fácil)
  const uploadFile = async (file, folder = "mini-bodegas") => {
    if (!file) return null;
    if (typeof file === "string") return file;
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${folder}/${name}`;
    const { data, error } = await supabase.storage.from("imagenes").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const uploadMultiple = async (files = [], folder = "carrusel") => {
    const promises = files.map(f => uploadFile(f, folder).catch(e => { console.error("upload err", e); return null; }));
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  };

  // Bodegas CRUD helpers
  const handleAgregarBodega = () => {
    setMiniBodegas(prev => [
      ...prev,
      {
        metraje: "",
        descripcion: "",
        contenido: "",
        imagen: null,
        direccion: "",
        ciudad: "",
        zona: "",
        precio_mensual: "",
        cantidad: 1,
        maxCantidad: 99,
        nombre_personalizado: ""
      }
    ]);
    mostrarMensaje("success", "✅ Nueva mini bodega agregada");
  };

  const handleEliminarBodega = async (idx) => {
    const b = miniBodegas[idx];
    if (!confirm("¿Eliminar esta mini bodega?")) return;
    setEliminandoBodega(idx);
    try {
      if (b.id) {
        const { error } = await supabase.from("mini_bodegas").delete().eq("id", b.id);
        if (error) throw error;
      }
      setMiniBodegas(prev => prev.filter((_, i) => i !== idx));
      mostrarMensaje("success", "✅ Mini bodega eliminada");
    } catch (e) {
      console.error(e);
      mostrarMensaje("error", `❌ ${e.message || "Error eliminando"}`);
    } finally {
      setEliminandoBodega(null);
    }
  };

  const handleUpdateBodega = (index, field, value) => {
    setMiniBodegas(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Guardar todo (empresa, carrusel, descripcion, mini_bodegas)
  const handleGuardarTodo = async () => {
    setGuardandoTodo(true);
    try {
      // Normalizar empresa a string (admite tanto objeto empresa como string)
      const empresaNombre = typeof empresa === "string" ? empresa : (empresa?.nombre ?? "");

      if (!user) { mostrarMensaje("error", "No autenticado"); setGuardandoTodo(false); return; }
      if (!empresaNombre || empresaNombre.trim() === "") { mostrarMensaje("error", "Nombre de empresa requerido"); setGuardandoTodo(false); return; }

      // validar al menos una bodega con campos completos
      const validas = miniBodegas.filter(b => b.metraje && b.descripcion && b.contenido && b.direccion && b.ciudad && b.zona && b.precio_mensual);
      if (validas.length === 0) { mostrarMensaje("error", "Completa al menos una mini bodega"); setGuardandoTodo(false); return; }

      mostrarMensaje("info", "Guardando empresa...", 10000);

      // Empresa: crear o actualizar (usar empresaNombre)
      let empresaData;
      if (empresaId) {
        const { data, error } = await supabase
          .from("empresas")
          .update({ nombre: empresaNombre.trim(), updated_at: new Date().toISOString() })
          .eq("id", empresaId)
          .select();
        if (error) throw error;
        empresaData = data[0];
      } else {
        const { data, error } = await supabase
          .from("empresas")
          .insert([{ nombre: empresaNombre.trim(), user_id: user.id }])
          .select();
        if (error) throw error;
        empresaData = data[0];
        setEmpresaId(empresaData.id);
      }

      // Carrusel
      mostrarMensaje("info", "Subiendo carrusel...", 10000);
      const urlsCarrusel = await uploadMultiple(imagenesCarrusel || [], "carrusel");
      // Reemplazar carrusel
      await supabase.from("carrusel_imagenes").delete().eq("empresa_id", empresaData.id);
      if (urlsCarrusel.length > 0) {
        const payload = urlsCarrusel.map((u, i) => ({ empresa_id: empresaData.id, imagen_url: u, orden: i }));
        const { error } = await supabase.from("carrusel_imagenes").insert(payload);
        if (error) throw error;
      }

      // Descripción
      mostrarMensaje("info", "Guardando descripción...", 10000);
      const urlsDesc = await uploadMultiple(imagenesDescripcion || [], "descripcion");
      const caracteristicasArray = caracteristicas ? caracteristicas.split(",").map(s => s.trim()).filter(Boolean) : [];
      const descripcionData = {
        empresa_id: empresaData.id,
        direccion_general: direccionGeneral || null,
        descripcion_general: descripcionGeneral || null,
        caracteristicas: caracteristicasArray,
        imagenes_urls: urlsDesc
      };
      const { data: descExist, error: descErr } = await supabase.from("empresa_descripcion").select("id").eq("empresa_id", empresaData.id).single();
      if (descErr && descErr.code !== "PGRST116") {
        // PGRST116 = no rows? keep going to insert
        console.warn("desc select error:", descErr.message);
      }
      if (descExist && descExist.id) {
        const { error } = await supabase.from("empresa_descripcion").update(descripcionData).eq("empresa_id", empresaData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresa_descripcion").insert(descripcionData);
        if (error) throw error;
      }

      // Mini bodegas: actualizar existentes / insertar nuevas
      mostrarMensaje("info", "Guardando mini bodegas...", 10000);
      // obtener ids reales en DB para esta empresa
      const { data: dbIdsData } = await supabase.from("mini_bodegas").select("id").eq("empresa_id", empresaData.id);
      const idsEnDB = (dbIdsData || []).map(d => d.id);

      const nuevas = [];
      for (let i = 0; i < miniBodegas.length; i++) {
        const b = miniBodegas[i];
        if (b.id && idsEnDB.includes(b.id)) {
          // actualizar
          const imagenUrl = b.imagen && typeof b.imagen !== "string" ? await uploadFile(b.imagen, "mini-bodegas") : (b.imagen || null);
          const payload = {
            metraje: b.metraje,
            descripcion: b.descripcion,
            contenido: b.contenido,
            direccion: b.direccion,
            ciudad: b.ciudad,
            zona: b.zona,
            precio_mensual: parseFloat(b.precio_mensual) || 0,
            cantidad: parseInt(b.cantidad, 10) || 1,
            nombre_personalizado: b.nombre_personalizado || null,
            imagen_url: imagenUrl,
            disponible: true,
            orden: i,
            updated_at: new Date().toISOString()
          };
          const { error } = await supabase.from("mini_bodegas").update(payload).eq("id", b.id);
          if (error) throw error;
        } else {
          // nueva
          const imagenUrl = b.imagen && typeof b.imagen !== "string" ? await uploadFile(b.imagen, "mini-bodegas") : (b.imagen || null);
          const payload = {
            empresa_id: empresaData.id,
            metraje: b.metraje,
            descripcion: b.descripcion,
            contenido: b.contenido,
            direccion: b.direccion,
            ciudad: b.ciudad,
            zona: b.zona,
            precio_mensual: parseFloat(b.precio_mensual) || 0,
            cantidad: parseInt(b.cantidad, 10) || 1,
            nombre_personalizado: b.nombre_personalizado || null,
            imagen_url: imagenUrl,
            disponible: true,
            orden: i
          };
          const { error } = await supabase.from("mini_bodegas").insert([payload]);
          if (error) throw error;
        }
      }

      // recargar datos desde hook
      await refresh();
      setPerfilCompleto(true);
      mostrarMensaje("success", "✅ Perfil guardado correctamente");
    } catch (error) {
      console.error("Error guardando:", error);
      mostrarMensaje("error", `❌ ${error.message || "Error guardando"}`, 8000);
    } finally {
      setGuardandoTodo(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-[#2C3A61]" />
          <p className="text-[#2C3A61]">Cargando perfil de proveedor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ No estás autenticado</p>
          <button onClick={() => (window.location.href = "/login")} className="bg-[#2C3A61] text-white px-6 py-2 rounded-lg">
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MensajeEstado />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2C3A61] mb-2">
            👋 Bienvenido, {empresa?.nombre || "Proveedor"}
          </h1>
          <p className="text-gray-600">{perfilCompleto ? "Edita tu perfil de proveedor" : "Completa tu perfil de proveedor de mini bodegas"}</p>
          {empresa?.nombre && <p className="text-sm text-gray-400 mt-1">{user?.email}</p>}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2C3A61]">🏢 Información de la Empresa</h2>
          <BodegaCarruselEditor
            empresaId={empresaId}
            empresa={empresa?.nombre || ""}              // pasar string para render seguro
            empresaRaw={empresa}                         // pasar el objeto completo si el componente lo necesita
            onEmpresaChange={handleEmpresaChange}        // wrapper que mantiene el objeto en estado
            imagenes={imagenesCarrusel}
            onImagenesChange={setImagenesCarrusel}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2C3A61]">📋 Descripción General</h2>
          <DescriptionEditor
            empresa={empresa?.nombre || ""}
            empresaRaw={empresa}
            onEmpresaChange={handleEmpresaChange}
            direccion={direccionGeneral}
            onDireccionChange={setDireccionGeneral}
            descripcion={descripcionGeneral}
            onDescripcionChange={setDescripcionGeneral}
            caracteristicas={caracteristicas}
            onCaracteristicasChange={setCaracteristicas}
            imagenes={imagenesDescripcion}
            onImagenesChange={setImagenesDescripcion}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2C3A61]">📦 Mini Bodegas</h2>
          <BodegasList
            bodegas={miniBodegas}
            onChangeField={handleUpdateBodega}
            onEliminar={handleEliminarBodega}
            onAgregar={handleAgregarBodega}
          />
        </div>

        <div className="flex justify-center mt-8">
          <button className={`font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg flex items-center justify-center min-w-[300px] ${guardandoTodo ? "bg-gray-400 cursor-not-allowed" : "bg-[#2C3A61] text-white hover:bg-[#4B799B] hover:scale-105"}`} onClick={handleGuardarTodo} disabled={guardandoTodo}>
            {guardandoTodo ? (<><Loader2 className="animate-spin h-5 w-5 mr-3" />Guardando...</>) : (<><Save className="h-5 w-5 mr-3" />{perfilCompleto ? "Actualizar Perfil" : "Guardar Todo"}</>)}
          </button>
        </div>
      </div>
    </div>
  );
}