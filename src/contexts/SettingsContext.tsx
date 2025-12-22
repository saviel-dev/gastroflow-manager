import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { configuracionService } from '@/services/configuracion.service';
import { useAuth } from './AuthContext';
import type { Configuracion } from '@/types/database.types';
import { toast } from 'sonner';

// Interfaz para la información del negocio
export interface BusinessInfo {
  nombre: string;
  telefono: string;
  direccion: string;
}

// Interfaz para las preferencias de notificaciones
export interface NotificationPreferences {
  alertasStockBajo: boolean;
  resumenDiario: boolean;
  movimientosInventario: boolean;
  productosVencer: boolean;
}

// Tipo del contexto
interface SettingsContextType {
  // Estado
  businessInfo: BusinessInfo;
  notifications: NotificationPreferences;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Funciones
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
  updateNotifications: (preferences: Partial<NotificationPreferences>) => void;
  saveSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Valores por defecto
const defaultBusinessInfo: BusinessInfo = {
  nombre: 'Auto-eat',
  telefono: '+58 412 123 4567',
  direccion: 'Av. Bolívar, Caracas, Venezuela',
};

const defaultNotifications: NotificationPreferences = {
  alertasStockBajo: true,
  resumenDiario: true,
  movimientosInventario: true,
  productosVencer: true,
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuraciones desde la base de datos
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todas las configuraciones
      const configs = await configuracionService.obtenerTodas();

      // Mapear configuraciones a estado
      const configMap = new Map<string, Configuracion>();
      configs.forEach(config => configMap.set(config.clave, config));

      // Parsear business info
      const newBusinessInfo: BusinessInfo = {
        nombre: configMap.get('sistema.nombre')?.valor || defaultBusinessInfo.nombre,
        telefono: configMap.get('negocio_telefono')?.valor || defaultBusinessInfo.telefono,
        direccion: configMap.get('negocio_direccion')?.valor || defaultBusinessInfo.direccion,
      };

      setBusinessInfo(newBusinessInfo);

      // Parsear notification preferences
      const notifConfig = configMap.get('notificaciones_preferencias');
      if (notifConfig && notifConfig.tipo === 'json' && notifConfig.valor) {
        try {
          const parsed = JSON.parse(notifConfig.valor);
          setNotifications(parsed);
        } catch {
          setNotifications(defaultNotifications);
        }
      } else {
        setNotifications(defaultNotifications);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar configuraciones';
      setError(errorMsg);
      console.error('Error al cargar configuraciones:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar configuraciones al montar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Actualizar información del negocio (solo en memoria, no en DB todavía)
  const updateBusinessInfo = useCallback((info: Partial<BusinessInfo>) => {
    setBusinessInfo(prev => ({ ...prev, ...info }));
  }, []);

  // Actualizar preferencias de notificaciones (solo en memoria)
  const updateNotifications = useCallback((preferences: Partial<NotificationPreferences>) => {
    setNotifications(prev => ({ ...prev, ...preferences }));
  }, []);

  // Guardar todas las configuraciones en la base de datos
  const saveSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      // Guardar información del negocio
      await configuracionService.guardar({
        clave: 'sistema.nombre',
        valor: businessInfo.nombre,
        tipo: 'texto',
        descripcion: 'Nombre del sistema',
        categoria: 'sistema',
      });

      await configuracionService.guardar({
        clave: 'negocio_telefono',
        valor: businessInfo.telefono,
        tipo: 'texto',
        descripcion: 'Teléfono del negocio',
        categoria: 'negocio',
      });

      await configuracionService.guardar({
        clave: 'negocio_direccion',
        valor: businessInfo.direccion,
        tipo: 'texto',
        descripcion: 'Dirección del negocio',
        categoria: 'negocio',
      });

      // Guardar preferencias de notificaciones
      await configuracionService.guardar({
        clave: 'notificaciones_preferencias',
        valor: JSON.stringify(notifications),
        tipo: 'json',
        descripcion: 'Preferencias de notificaciones',
        categoria: 'notificaciones',
      });

      toast.success('Configuración guardada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar configuración';
      setError(errorMsg);
      console.error('Error al guardar configuración:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [businessInfo, notifications]);

  // Refrescar configuraciones
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  return (
    <SettingsContext.Provider
      value={{
        businessInfo,
        notifications,
        loading,
        saving,
        error,
        updateBusinessInfo,
        updateNotifications,
        saveSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
