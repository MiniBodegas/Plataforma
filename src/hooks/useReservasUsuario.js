import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useReservasUsuario() {
  const [reservas, setReservas] = useState([]);
  const [miniBodegas, setMiniBodegas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      const user = supabase.auth.getUser && (await supabase.auth.getUser()).data.user;
      if (!user) {
        setReservas([]);
        setMiniBodegas({});
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setReservas(data || []);
      setLoading(false);

      // Traer nombres de mini bodegas solo si hay reservas
      if (data && data.length > 0) {
        // Obtener ids únicos, válidos y como string
        const ids = Array.from(
          new Set(
            data
              .map(r => r.mini_bodega_id)
              .filter(id => typeof id === "string" && id.length > 0)
          )
        );
        console.log("[useReservasUsuario] ids enviados a .in:", ids);
        if (ids.length > 0) {
          const { data: bodegas, error: errorBodegas } = await supabase
            .from("mini_bodegas")
            .select("id, nombre_personalizado, descripcion, metraje, ciudad, zona, direccion")
            .in("id", ids);

          console.log("[useReservasUsuario] respuesta mini_bodegas:", bodegas, errorBodegas);

          if (!errorBodegas && bodegas) {
            const map = {};
            bodegas.forEach(b => {
              map[b.id] = {
                nombre: b.nombre_personalizado || b.descripcion || "Mini bodega",
                metraje: b.metraje,
                ciudad: b.ciudad,
                zona: b.zona,
                direccion: b.direccion,
              };
            });
            setMiniBodegas(map);
          }
        }
      }
    };
    fetchReservas();
  }, []);

  return { reservas, miniBodegas, loading };
}