import { useState, useEffect } from 'react';
import { configuracionService } from '@/services/configuracion.service';
import type { Configuracion } from '@/types/database.types';

/**
 * Hook para obtener todas las configuraciones
 */
export const useConfiguraciones = () => {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionService.obtenerTodas();
      setConfiguraciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  return { configuraciones, loading, error, recargar: cargarConfiguraciones };
};

/**
 * Hook para obtener una configuración específica por clave
 */
export const useConfiguracion = (clave: string) => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarConfiguracion();
  }, [clave]);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionService.obtenerPorClave(clave);
      setConfiguracion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const actualizar = async (valor: string) => {
    try {
      setError(null);
      const updated = await configuracionService.actualizarValor(clave, valor);
      setConfiguracion(updated);
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar configuración';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return { configuracion, loading, error, actualizar, recargar: cargarConfiguracion };
};

/**
 * Hook para obtener la tasa de cambio BCV
 */
export const useTasaBCV = () => {
  const [tasa, setTasa] = useState<number>(50.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarTasa();
  }, []);

  const cargarTasa = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasaActual = await configuracionService.obtenerTasaBCV();
      setTasa(tasaActual);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tasa BCV');
    } finally {
      setLoading(false);
    }
  };

  const actualizarTasa = async (nuevaTasa: number) => {
    try {
      setError(null);
      await configuracionService.actualizarTasaBCV(nuevaTasa);
      setTasa(nuevaTasa);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar tasa BCV';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return { tasa, loading, error, actualizarTasa, recargar: cargarTasa };
};
