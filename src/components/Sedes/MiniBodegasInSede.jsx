import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BodegasList } from "../index";

export function MiniBodegasInSede({ sede, onChange }) {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const load = async () => {
    if (!sede?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("mini_bodegas")
        .select("*")
        .eq("sede_id", sede.id)
        .order("orden", { ascending: true });
      setBodegas((data || []).map(b => ({
        ...b,
        imagen: b.imagen_url ?? b.imagen ?? null,
        precio_mensual: b.precio_mensual ?? b.precioMensual ?? ""
      })));
    } catch (e) {
      console.error("MiniBodegasInSede load", e);
      setBodegas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [sede?.id]);

  const handleChangeField = (index, field, value) => {
    setBodegas(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAgregar = () => {
    setBodegas(prev => ([
      ...prev,
      {
        metraje: "",
        descripcion: "",
        contenido: "",
        imagen: null,
        direccion: sede.direccion || "",
        ciudad: sede.ciudad || "",
        zona: sede.zona || "",
        precio_mensual: "",
        cantidad: 1,
        maxCantidad: 99,
        sede_id: sede.id
      }
    ]));
  };

  const handleEliminar = async (idx) => {
    const b = bodegas[idx];
    if (b?.id) {
      try {
        await supabase.from("mini_bodegas").delete().eq("id", b.id);
      } catch (e) {
        console.error("Error eliminando bodega", e);
      }
    }
    setBodegas(prev => prev.filter((_, i) => i !== idx));
    onChange && onChange();
  };

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

  const handleGuardarBodegas = async () => {
    setGuardando(true);
    try {
      for (let i = 0; i < bodegas.length; i++) {
        const b = bodegas[i];
        // subir imagen si es File
        let imagenUrl = b.imagen;
        if (b.imagen && typeof b.imagen !== "string") {
          try { imagenUrl = await uploadFile(b.imagen); } catch (e) { console.error("upload error", e); imagenUrl = null; }
        }

        const payload = {
          empresa_id: b.empresa_id || sede.empresa_id,
          sede_id: sede.id,
          metraje: b.metraje || "",
          descripcion: b.descripcion || "",
          contenido: b.contenido || "",
          direccion: b.direccion || "",
          ciudad: b.ciudad || "",
          zona: b.zona || "",
          precio_mensual: parseFloat(b.precio_mensual) || 0,
          cantidad: parseInt(b.cantidad, 10) || 1,
          nombre_personalizado: b.nombre_personalizado || null,
          imagen_url: imagenUrl || null,
          disponible: true,
          orden: i
        };

        if (b.id) {
          const { error } = await supabase.from("mini_bodegas").update(payload).eq("id", b.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("mini_bodegas").insert([payload]);
          if (error) throw error;
        }
      }

      await load();
      onChange && onChange();
    } catch (e) {
      console.error("Error guardando mini bodegas", e);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="border-t pt-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-[#2C3A61]">Mini bodegas en {sede.nombre || sede.ciudad}</h4>
        <div className="flex gap-2">
          <button onClick={handleAgregar} className="px-3 py-1 text-sm bg-[#eef6fb] rounded">+ Agregar</button>
          <button onClick={handleGuardarBodegas} className="px-3 py-1 text-sm bg-[#2C3A61] text-white rounded" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando mini bodegas...</p>
      ) : (
        <BodegasList
          bodegas={bodegas}
          onChangeField={handleChangeField}
          onEliminar={handleEliminar}
          onAgregar={handleAgregar}
        />
      )}
    </div>
  );
}