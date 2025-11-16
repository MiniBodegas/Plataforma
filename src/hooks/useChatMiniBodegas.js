import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useChatMiniBodegas() {
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState(null);

  // Por si quieres mostrar la lista filtrada que se usó
  const [miniBodegasUsadas, setMiniBodegasUsadas] = useState([]);

  const preguntar = async (mensajeUsuario) => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Traer mini bodegas activas/disponibles desde Supabase
      const { data, error: dbError } = await supabase
        .from("mini_bodegas")
        .select("*")
        .eq("estado", "activa")
        .eq("disponible", true);

      if (dbError) throw dbError;
      if (!data || data.length === 0) {
        throw new Error("No hay mini bodegas disponibles en este momento.");
      }

      setMiniBodegasUsadas(data);

      // 2️⃣ Llamar al endpoint del chatbot con mensaje + productos
      const res = await fetch("/api/chat-minibodegas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensajeUsuario,
          productos: data,
        }),
      });

      if (!res.ok) {
        console.error("Respuesta no OK:", await res.text());
        throw new Error("Error consultando el chatbot de MiniBodegas");
      }

      const json = await res.json();
      setRespuesta(json);
      return json;
    } catch (e) {
      console.error("Error en useChatMiniBodegas:", e);
      setError(e.message || "Error desconocido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { preguntar, loading, respuesta, error, miniBodegasUsadas };
}
