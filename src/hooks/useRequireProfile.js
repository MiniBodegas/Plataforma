import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useRequireProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkProfile() {
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('nombre')
          .eq('id', user.id)
          .single();
        if (!data || !data.nombre) {
          navigate("/completar-perfil");
        }
      }
    }
    checkProfile();
  }, [user, navigate]);
}