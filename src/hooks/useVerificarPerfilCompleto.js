// hooks/useVerificarPerfilCompleto.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ProfileService } from "../services/ProfileService";

export function useVerificarPerfilCompleto() {
  const { user, loading: authLoading, isProveedor } = useAuth();
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (isProveedor()) {
        verificarPerfil();
      } else {
        setPerfilCompleto(true);
        setLoading(false);
      }
    } else if (!authLoading && !user) {
      setLoading(false);
      setPerfilCompleto(false);
    }
  }, [user, authLoading, isProveedor]);

  const verificarPerfil = async () => {
    try {
      setLoading(true);
      const empresa = await ProfileService.getEmpresaByUserId(user.id);

      if (!empresa) {
        setPerfilCompleto(false);
        return;
      }

      const camposObligatorios = [
        'nombre', 
        'descripcion', 
        'ciudad', 
        'direccion_principal', 
        'camara_comercio',
        'rut'
      ];

      const completo = camposObligatorios.every(campo => {
        const valor = empresa[campo];
        return valor && valor.toString().trim() !== '';
      });

      setPerfilCompleto(completo);
    } catch (error) {
      setPerfilCompleto(false);
    } finally {
      setLoading(false);
    }
  };

  return { perfilCompleto, loading, refrescarPerfil: verificarPerfil };
}