import { supabase } from '@/lib/supabase';
import type { Notificacion, InsertNotificacion } from '@/types/database.types';

class NotificationService {
  private tabla = 'notificaciones';

  // Obtener todas las notificaciones de un usuario
  async obtenerTodas(usuarioId?: string): Promise<Notificacion[]> {
    let query = supabase
      .from('notificaciones')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Crear una nueva notificación
  async crear(notificacion: InsertNotificacion): Promise<Notificacion> {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert(notificacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Marcar una notificación como leída
  async marcarComoLeida(id: string): Promise<void> {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true, fecha_lectura: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas(usuarioId?: string): Promise<void> {
    let query = supabase
      .from('notificaciones')
      .update({ leida: true, fecha_lectura: new Date().toISOString() })
      .eq('leida', false);

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { error } = await query;

    if (error) throw error;
  }
}

export const notificationService = new NotificationService();
