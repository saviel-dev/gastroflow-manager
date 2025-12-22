import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notification.service';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import type { Notificacion } from '@/types/database.types';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notificacion[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (title: string, message: string, type: Notificacion['tipo']) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { notifications: preferences } = useSettings(); // Notification preferences from SettingsContext
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [audio] = useState(new Audio('/sound/tono.mp3'));

  // Calcular conteo de no leídas
  const unreadCount = notifications.filter(n => !n.leida).length;

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.obtenerTodas(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Helper to check if sound should play based on preferences
  const shouldPlaySound = (title: string, message: string): boolean => {
    const text = (title + " " + message).toLowerCase();
    
    // Alertas de stock bajo
    if (text.includes('stock bajo') || text.includes('agotado')) {
      return preferences.alertasStockBajo;
    }
    
    // Resumen diario
    if (text.includes('resumen') && text.includes('ventas')) {
      return preferences.resumenDiario;
    }
    
    // Movimientos de inventario
    if (text.includes('entrada') || text.includes('salida') || text.includes('ajuste') || text.includes('transferencia')) {
      return preferences.movimientosInventario;
    }
    
    // Productos por vencer
    if (text.includes('vence') || text.includes('vencido') || text.includes('caduc')) {
      return preferences.productosVencer;
    }

    // Default: play sound for other notifications
    return true; 
  };

  // Solicitar permisos de notificación nativa al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Suscripción a Realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:notificaciones')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.id}`, // Solo notificaciones para este usuario
        },
        payload => {
          const newNotification = payload.new as Notificacion;
          
          // Actualizar estado local
          setNotifications(prev => [newNotification, ...prev]);
          
          const allowed = shouldPlaySound(newNotification.titulo, newNotification.mensaje);

          if (allowed) {
            // Reproducir sonido
            audio.currentTime = 0;
            audio.play().catch(e => console.error('Error playing sound:', e));

            // Mostrar toast
            toast(newNotification.titulo, {
              description: newNotification.mensaje,
            });

            // Enviar notificación del sistema (celular/desktop)
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                // Registrar Service Worker para notificaciones móviles mas robustas si es necesario,
                // pero new Notification() funciona bien en apps activas/pwa
                new Notification(newNotification.titulo, {
                  body: newNotification.mensaje,
                  icon: '/icon-192x192.png', // Asegúrate de tener un icono o usar uno por defecto
                  tag: 'auto-eat-notification'
                });
              } catch (e) {
                console.error('Error sending system notification:', e);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, audio, preferences]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
      await notificationService.marcarComoLeida(id);
    } catch (error) {
      console.error('Error marking as read:', error);
      loadNotifications(); // Rollback on error
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
      await notificationService.marcarTodasComoLeidas(user.id);
    } catch (error) {
      console.error('Error marking all as read:', error);
      loadNotifications();
    }
  };

  const addNotification = async (title: string, message: string, type: Notificacion['tipo']) => {
    if (!user) return;
    try {
      await notificationService.crear({
        usuario_id: user.id,
        titulo: title,
        mensaje: message,
        tipo: type,
        leida: false,
      });
      // La suscripción realtime se encargará de actualizar el estado y sonar
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        addNotification,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
