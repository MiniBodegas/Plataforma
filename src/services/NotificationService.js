// services/NotificationService.js
import { supabase } from '../lib/supabase';

export class NotificationService {
  static async getUserNotifications(userId, limit = 50) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error obteniendo notificaciones: ${error.message}`);
    }

    return data || [];
  }

  static async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('leida', false);

    if (error) {
      console.error('Error obteniendo conteo de no leídas:', error);
      return 0;
    }

    return count || 0;
  }

  static async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leida: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Error marcando notificación como leída: ${error.message}`);
    }
  }

  static async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leida: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('leida', false);

    if (error) {
      throw new Error(`Error marcando todas como leídas: ${error.message}`);
    }
  }

  static subscribeToUserNotifications(userId, onNotification) {
    return supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${userId}`
        },
        onNotification
      )
      .subscribe();
  }

  static async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([{
        ...notificationData,
        created_at: new Date().toISOString(),
        leida: false
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando notificación: ${error.message}`);
    }

    return data;
  }
}