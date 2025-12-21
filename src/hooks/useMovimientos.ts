import { useState, useEffect } from 'react';
import { movimientosService } from '@/services/movimientos.service';
import type { Movimiento } from '@/types/database.types';

/**
 * Hook para obtener movimientos recientes
 */
export const useMovimientosRecientes = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movimientosService.obtenerRecientes();
      setMovimientos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  return { movimientos, loading, error, recargar: cargar };
};

/**
 * Hook para obtener movimientos por producto
 */
export const useMovimientosProducto = (productoId: string | null, tipoInventario: 'general' | 'detallado') => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productoId) {
      cargar();
    } else {
      setMovimientos([]);
      setLoading(false);
    }
  }, [productoId, tipoInventario]);

  const cargar = async () => {
    if (!productoId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await movimientosService.obtenerPorProducto(productoId, tipoInventario);
      setMovimientos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos del producto');
    } finally {
      setLoading(false);
    }
  };

  return { movimientos, loading, error, recargar: cargar };
};

/**
 * Hook para obtener estadísticas de movimientos
 */
export const useEstadisticasMovimientos = (dias: number = 30) => {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, [dias]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movimientosService.obtenerEstadisticas(dias);
      setEstadisticas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de movimientos');
    } finally {
      setLoading(false);
    }
  };

  return { estadisticas, loading, error, recargar: cargar };
};
