// services/ProfileService.js
import { supabase } from '../lib/supabase';

export class ProfileService {
  static async getEmpresaByUserId(userId) {
    console.log('🔍 ProfileService: Buscando empresa para userId:', userId);
    
    try {
      // Verificar sesión primero
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔑 Sesión actual:', session?.user?.id);
      
      if (sessionError || !session) {
        throw new Error('Usuario no autenticado');
      }

      // Query MÁS SIMPLE - usar select('*') primero
      const { data, error } = await supabase
        .from('empresas')
        .select('*') // Cambiar a select todo en lugar de campos específicos
        .eq('user_id', userId)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      console.log('📊 Respuesta completa:', { data, error, userId });

      if (error) {
        console.error('❌ Error en consulta empresas:', error);
        throw new Error(`Error obteniendo empresa: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        console.log('ℹ️ No se encontró empresa para el usuario');
        return null;
      }

      console.log('✅ Empresa encontrada:', data);
      return data;
    } catch (err) {
      console.error('💥 Error en ProfileService.getEmpresaByUserId:', err);
      throw err;
    }
  }

  static async getMinibodegasByEmpresa(empresaId) {
    console.log('🔍 ProfileService: Buscando minibodegas para empresaId:', empresaId);
    
    try {
      const { data, error } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo minibodegas:', error);
        throw new Error(`Error obteniendo minibodegas: ${error.message}`);
      }

      console.log('✅ Minibodegas encontradas:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('💥 Error en getMinibodegasByEmpresa:', err);
      throw err;
    }
  }

  static async countMinibodegasActivas(empresaId) {
    console.log('🔢 ProfileService: Contando minibodegas para empresaId:', empresaId);
    
    try {
      const { count, error } = await supabase
        .from('mini_bodegas')
        .select('*', { count: 'exact' })
        .eq('empresa_id', empresaId);

      if (error) {
        console.error('❌ Error contando minibodegas:', error);
        // No fallar por esto, retornar 0
        return 0;
      }

      console.log('✅ Conteo de minibodegas:', count);
      return count || 0;
    } catch (err) {
      console.error('💥 Error en countMinibodegasActivas:', err);
      return 0;
    }
  }

  static async createEmpresa(empresaData) {
    this.validateEmpresaData(empresaData);

    const { data, error } = await supabase
      .from('empresas')
      .insert([{
        ...empresaData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rating: "0.0"
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando empresa: ${error.message}`);
    }

    return data;
  }

  static async updateEmpresa(empresaId, empresaData) {
    this.validateEmpresaData(empresaData);

    const { data, error } = await supabase
      .from('empresas')
      .update({
        ...empresaData,
        updated_at: new Date().toISOString()
      })
      .eq('id', empresaId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando empresa: ${error.message}`);
    }

    return data;
  }

  static validateEmpresaData(data) {
    const required = ['nombre', 'descripcion', 'ciudad', 'direccion_principal'];
    
    for (const field of required) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.telefono && !this.isValidPhone(data.telefono)) {
      throw new Error('Teléfono inválido');
    }
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}