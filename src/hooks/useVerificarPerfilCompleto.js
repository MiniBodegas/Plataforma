// hooks/useVerificarPerfilCompleto.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ProfileService } from "../services/ProfileService";

export function useVerificarPerfilCompleto() {
  const { user, loading: authLoading, isProveedor } = useAuth(); // ✅ Agregar isProveedor
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      // ✅ SOLO ejecutar para proveedores
      if (isProveedor()) {
        verificarPerfil();
      } else {
        // ✅ Para usuarios normales, no verificar empresa
        console.log('ℹ️ Usuario es cliente, no necesita verificación de empresa');
        setPerfilCompleto(true); // Los clientes siempre tienen "perfil completo"
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
      console.log('🔍 useVerificarPerfilCompleto: Verificando perfil de PROVEEDOR para:', user.id);
      
      const empresa = await ProfileService.getEmpresaByUserId(user.id);

      if (!empresa) {
        console.log('ℹ️ Proveedor no tiene empresa creada');
        setPerfilCompleto(false);
        return;
      }

      console.log('✅ Empresa encontrada, verificando campos...');

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

      console.log('📊 Perfil de proveedor completo:', completo);
      setPerfilCompleto(completo);
    } catch (error) {
      console.error('❌ Error verificando perfil de proveedor:', error);
      setPerfilCompleto(false);
    } finally {
      setLoading(false);
    }
  };

  return { perfilCompleto, loading, refrescarPerfil: verificarPerfil };
}