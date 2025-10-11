// services/ProfileService.js
import { supabase } from '../lib/supabase';

export class ProfileService {
  // Trabajar solo con empresas - NO profiles
  static async getEmpresaByUserId(userId) {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error obteniendo empresa: ${error.message}`);
    }

    return data;
  }

  // Obtener minibodegas de la empresa
  static async getMinibodegasByEmpresa(empresaId) {
    const { data, error } = await supabase
      .from('mini_bodegas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo minibodegas: ${error.message}`);
    }

    return data || [];
  }

  // Contar minibodegas activas
  static async countMinibodegasActivas(empresaId) {
    const { count, error } = await supabase
      .from('mini_bodegas')
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId);

    if (error) {
      throw new Error(`Error contando minibodegas: ${error.message}`);
    }

    return count || 0;
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