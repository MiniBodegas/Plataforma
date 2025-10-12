// services/ProfileService.js
import { supabase } from '../lib/supabase';

export class ProfileService {
  static async getEmpresaByUserId(userId) {
    try {
      // Verificar sesión primero
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Usuario no autenticado');
      }

      // Query MÁS SIMPLE - usar select('*') primero
      const { data, error } = await supabase
        .from('empresas')
        .select('*') // Cambiar a select todo en lugar de campos específicos
        .eq('user_id', userId)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error) {
        throw new Error(`Error obteniendo empresa: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        return null;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  static async getMinibodegasByEmpresa(empresaId) {
    try {
      const { data, error } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo minibodegas: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      throw err;
    }
  }

  static async countMinibodegasActivas(empresaId) {
    try {
      const { count, error } = await supabase
        .from('mini_bodegas')
        .select('*', { count: 'exact' })
        .eq('empresa_id', empresaId);

      if (error) {
        // No fallar por esto, retornar 0
        return 0;
      }

      return count || 0;
    } catch (err) {
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