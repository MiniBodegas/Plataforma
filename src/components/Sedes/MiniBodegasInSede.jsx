import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BodegasList } from "../BodegasList";
import { CardBodegas } from "../index";

export function MiniBodegasInSede({ sede, onChange, autoOpenAdd = false, onOpened, horizontal = false }) {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

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

  const handleDragStart = (e, b) => {
    if (!b?.id) return; // solo dragables persistentes
    try {
      e.dataTransfer.setData("application/json", JSON.stringify({ bodegaId: b.id, fromSedeId: sede.id }));
      e.dataTransfer.effectAllowed = "move";
      setDraggingId(b.id);
    } catch (err) {
      console.error("drag start error", err);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  // si la sede fue creada justo ahora, abrir formulario de agregar automáticamente
  useEffect(() => {
    if (!autoOpenAdd) return;
    // esperar que load termine
    const t = setTimeout(() => {
      // si no hay bodegas, abrir una nueva entrada para editar
      handleAgregar();
      onOpened && onOpened();
    }, 250);
    return () => clearTimeout(t);
  }, [autoOpenAdd]);

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
        <>
          {Array.isArray(bodegas) && bodegas.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-600 mb-3">No hay mini bodegas en esta sede todavía.</p>
              <button onClick={handleAgregar} className="px-4 py-2 bg-[#2C3A61] text-white rounded">Crear primera mini bodega</button>
            </div>
          ) : horizontal ? (
            // render horizontal: cada CardBodegas dentro de un contenedor con scroll horizontal
            <div className="overflow-x-auto -mx-4 px-4 py-2">
              <div className="flex gap-4 items-start">
                {bodegas.map((b, idx) => (
                  <div
                    key={b.id ?? idx}
                    className={`min-w-[340px] max-w-[460px] flex-shrink-0 rounded-lg border-2 border-gray-200 bg-white shadow-sm overflow-hidden box-border ${draggingId === b.id ? "opacity-60" : ""}`}
                    draggable={!!b.id}
                    onDragStart={(e) => handleDragStart(e, b)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* padding interno mayor para despegar card del borde */}
                    <div className="p-6 h-full flex items-start justify-center">
                      <div className="w-full max-w-[420px] flex flex-col">
                        <div className="flex-1 overflow-hidden">
                          <div className="w-full h-full overflow-hidden break-words">
                            <div className="p-3 bg-transparent w-full h-full box-border">
                              <CardBodegas
                                metraje={b.metraje}
                                descripcion={b.descripcion}
                                contenido={b.contenido}
                                imagen={b.imagen_url ?? b.imagen}
                                direccion={b.direccion}
                                ciudad={b.ciudad}
                                zona={b.zona}
                                precioMensual={b.precio_mensual ?? b.precioMensual}
                                cantidad={b.cantidad}
                                maxCantidad={b.maxAmount ?? 99}
                                nombrePersonalizado={b.nombre_personalizado ?? b.nombrePersonalizado}
                                hideGuardarButton={true}
                                onImagenChange={(img) => handleChangeField(idx, "imagen", img)}
                                onMetrajeChange={(val) => handleChangeField(idx, "metraje", val)}
                                onDescripcionChange={(val) => handleChangeField(idx, "descripcion", val)}
                                onContenidoChange={(val) => handleChangeField(idx, "contenido", val)}
                                onDireccionChange={(val) => handleChangeField(idx, "direccion", val)}
                                onCiudadChange={(val) => handleChangeField(idx, "ciudad", val)}
                                onZonaChange={(val) => handleChangeField(idx, "zona", val)}
                                onPrecioMensualChange={(val) => handleChangeField(idx, "precio_mensual", val)}
                                onCantidadChange={(val) => handleChangeField(idx, "cantidad", val)}
                                onNombrePersonalizadoChange={(val) => handleChangeField(idx, "nombre_personalizado", val)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-center">
                          <button onClick={() => handleEliminar(idx)} className="text-red-600 text-sm">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                 ))}
               </div>
             </div>
           ) : (
             // render en cuadrícula responsive: las mini bodegas comparten espacio y no estiran la tarjeta
             <div>
              {/* Fuerzo 3 cards por fila en md+; gap un poco mayor para separar del wrapper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {bodegas.map((b, idx) => (
                  <div
                    key={b.id ?? idx}
                    className={`w-full rounded-lg border-2 border-gray-200 bg-white shadow-sm overflow-hidden box-border ${draggingId === b.id ? "opacity-60" : ""}`}
                    draggable={!!b.id}
                    onDragStart={(e) => handleDragStart(e, b)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* wrapper: padding interno para despegar la CardBodegas del borde */}
                    <div className="p-4 w-full h-full flex items-start justify-center">
                      <div className="w-full flex flex-col">
                        <div className="flex-1 overflow-hidden">
                          <div className="p-3 w-full h-full overflow-hidden break-words">
                            {/* CardBodegas está contenido dentro del wrapper y ocupa todo el ancho */}
                            <div className="w-full h-full">
                              <CardBodegas
                                metraje={b.metraje}
                                descripcion={b.descripcion}
                                contenido={b.contenido}
                                imagen={b.imagen_url ?? b.imagen}
                                direccion={b.direccion}
                                ciudad={b.ciudad}
                                zona={b.zona}
                                precioMensual={b.precio_mensual ?? b.precioMensual}
                                cantidad={b.cantidad}
                                maxCantidad={b.maxAmount ?? 99}
                                nombrePersonalizado={b.nombre_personalizado ?? b.nombrePersonalizado}
                                hideGuardarButton={true}
                                onImagenChange={(img) => handleChangeField(idx, "imagen", img)}
                                onMetrajeChange={(val) => handleChangeField(idx, "metraje", val)}
                                onDescripcionChange={(val) => handleChangeField(idx, "descripcion", val)}
                                onContenidoChange={(val) => handleChangeField(idx, "contenido", val)}
                                onDireccionChange={(val) => handleChangeField(idx, "direccion", val)}
                                onCiudadChange={(val) => handleChangeField(idx, "ciudad", val)}
                                onZonaChange={(val) => handleChangeField(idx, "zona", val)}
                                onPrecioMensualChange={(val) => handleChangeField(idx, "precio_mensual", val)}
                                onCantidadChange={(val) => handleChangeField(idx, "cantidad", val)}
                                onNombrePersonalizadoChange={(val) => handleChangeField(idx, "nombre_personalizado", val)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <button onClick={() => handleEliminar(idx)} className="text-red-600 text-sm">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                 ))}
              </div>

              <div className="pt-3">
                <button onClick={handleAgregar} className="px-3 py-1 text-sm bg-[#eef6fb] rounded">+ Agregar</button>
              </div>
            </div>
           )}
         </>
       )}
     </div>
   );
 }