// hooks/useVerificarPerfilCompleto.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useVerificarPerfilCompleto() {
  const { user } = useAuth();
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      verificarPerfil();
    } else {
      setLoading(false);
    }
  }, [user]);

  const verificarPerfil = async () => {
    try {
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('nombre, descripcion, ciudad, direccion_principal, nombre_representante, celular, camara_comercio, rut')
        .eq('user_id', user.id)
        .single();

      if (error || !empresa) {
        setPerfilCompleto(false);
        setLoading(false);
        return;
      }

      const camposObligatorios = [
        'nombre', 
        'descripcion', 
        'ciudad', 
        'direccion_principal', 
        'nombre_representante', 
        'celular',
        'camara_comercio',
        'rut'
      ];

      const completo = camposObligatorios.every(campo => {
        const valor = empresa[campo];
        return valor && valor.toString().trim() !== '';
      });

      setPerfilCompleto(completo);
      setLoading(false);
    } catch (error) {
      console.error('Error verificando perfil:', error);
      setPerfilCompleto(false);
      setLoading(false);
    }
  };

  return { perfilCompleto, loading, refrescarPerfil: verificarPerfil };
}