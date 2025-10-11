// hooks/useProgresoProveedor.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useProgresoProveedor() {
  const { user } = useAuth();
  const [progreso, setProgreso] = useState({
    perfilCompleto: false,
    primerMinibodega: false,
    pagosConfigurados: false,
    loading: true
  });

  useEffect(() => {
    if (user) {
      verificarProgreso();
    }
  }, [user]);

  const verificarProgreso = async () => {
    try {
      const [perfilResult, minibodegaResult, pagosResult] = await Promise.all([
        verificarPerfilCompleto(),
        verificarPrimerMinibodega(),
        verificarPagosConfigurados()
      ]);

      setProgreso({
        perfilCompleto: perfilResult,
        primerMinibodega: minibodegaResult,
        pagosConfigurados: pagosResult,
        loading: false
      });
    } catch (error) {
      console.error('Error verificando progreso:', error);
      setProgreso(prev => ({ ...prev, loading: false }));
    }
  };

  const verificarPerfilCompleto = async () => {
    try {
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('nombre, descripcion, ciudad, direccion_principal, nombre_representante, celular, camara_comercio, rut')
        .eq('user_id', user.id)
        .single();

      if (error || !empresa) return false;

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

      return camposObligatorios.every(campo => {
        const valor = empresa[campo];
        return valor && valor.toString().trim() !== '';
      });
    } catch (error) {
      console.error('Error verificando perfil:', error);
      return false;
    }
  };

  const verificarPrimerMinibodega = async () => {
    try {
      console.log('🔍 Verificando minibodegas para usuario:', user.id);
      
      // Primero obtener la empresa del usuario
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (empresaError) {
        console.error('❌ Error obteniendo empresa:', empresaError);
        return false;
      }

      if (!empresa) {
        console.log('❌ No se encontró empresa para el usuario');
        return false;
      }

      console.log('🏢 Empresa encontrada con ID:', empresa.id);

      // CORREGIR: Usar mini_bodegas en ambas consultas
      const { data: todasMinibodegas, error: errorTodas } = await supabase
        .from('mini_bodegas') // ✅ Cambiar de 'minibodegas' a 'mini_bodegas'
        .select('id, metraje, descripcion')
        .eq('empresa_id', empresa.id);

      console.log('📦 Todas las mini_bodegas:', todasMinibodegas);

      if (errorTodas) {
        console.error('❌ Error consultando mini_bodegas:', errorTodas);
        return false;
      }

      // Como no veo columna 'activa' en la tabla, contar todas las minibodegas
      const tieneMinibodegas = todasMinibodegas && todasMinibodegas.length > 0;
      console.log('📊 Resultado final - Tiene minibodegas:', tieneMinibodegas);
      console.log('📊 Cantidad de minibodegas:', todasMinibodegas?.length || 0);
      
      return tieneMinibodegas;
    } catch (error) {
      console.error('💥 Error verificando minibodega:', error);
      return false;
    }
  };        

  const verificarPagosConfigurados = async () => {
    try {
      // Por ahora retornar false hasta que implementes la funcionalidad de pagos
      // Puedes crear una tabla 'configuracion_pagos' cuando implementes esto
      return false;
      
      /* Cuando implementes pagos, usar algo así:
      const { data: configPagos, error } = await supabase
        .from('configuracion_pagos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') return false;
      return !!configPagos;
      */
    } catch (error) {
      console.error('Error verificando pagos:', error);
      return false;
    }
  };

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
    refrescarProgreso: verificarProgreso
  };
}