// hooks/useProgresoProveedor.js
import { useState, useEffect } from "react";
import { useUserProfile } from "../contexts/UserProfileContext";

export function useProgresoProveedor() {
  const { 
    empresa, 
    hasMinibodegas, 
    isProfileComplete, 
    loading: profileLoading 
  } = useUserProfile();
  
  const [progreso, setProgreso] = useState({
    perfilCompleto: false,
    primerMinibodega: false,
    pagosConfigurados: false,
    loading: true
  });

  useEffect(() => {
    if (!profileLoading) {
      setProgreso({
        perfilCompleto: isProfileComplete(),
        primerMinibodega: hasMinibodegas(),
        pagosConfigurados: false, // Implementar cuando tengas sistema de pagos
        loading: false
      });
    }
  }, [empresa, profileLoading, isProfileComplete, hasMinibodegas]);

  const porcentajeProgreso = () => {
    const total = 3;
    const completados = [
      progreso.perfilCompleto,
      progreso.primerMinibodega,
      progreso.pagosConfigurados
    ].filter(Boolean).length;

    return Math.round((completados / total) * 100);
  };

  return {
    ...progreso,
    porcentajeProgreso: porcentajeProgreso(),
  };
}