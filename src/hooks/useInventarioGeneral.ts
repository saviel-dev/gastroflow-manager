import { useState, useEffect, useCallback } from 'react';
import { inventarioGeneralService } from '@/services/inventario-general.service';
import type { InventarioGeneral, InsertInventarioGeneral, UpdateInventarioGeneral } from '@/types/database.types';

/**
 * Hook para obtener todos los productos del inventario general
 */
export const useInventarioGeneral = (soloActivos: boolean = true) => {
  const [productos, setProductos] = useState<InventarioGeneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioGeneralService.obtenerTodos(soloActivos);
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [soloActivos]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (producto: InsertInventarioGeneral) => {
    try {
      setError(null);
      const nuevo = await inventarioGeneralService.crear(producto);
      setProductos(prev => [...prev, nuevo]);
      return nuevo;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear producto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const actualizar = async (id: string, actualizacion: UpdateInventarioGeneral) => {
    try {
      setError(null);
      const actualizado = await inventarioGeneralService.actualizar(id, actualizacion);
      setProductos(prev => prev.map(p => p.id === id ? actualizado : p));
      return actualizado;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const eliminar = async (id: string) => {
    try {
      setError(null);
      await inventarioGeneralService.eliminar(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return { productos, loading, error, recargar: cargar, crear, actualizar, eliminar };
};

/**
 * Hook para buscar productos
 */
export const useBuscarProductos = () => {
  const [resultados, setResultados] = useState<InventarioGeneral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = async (termino: string) => {
    if (!termino.trim()) {
      setResultados([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await inventarioGeneralService.buscarPorNombre(termino);
      setResultados(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  return { resultados, loading, error, buscar };
};

/**
 * Hook para obtener productos con bajo stock
 */
export const useProductosBajoStock = () => {
  const [productos, setProductos] = useState<InventarioGeneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioGeneralService.obtenerBajoStock();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos con bajo stock');
    } finally {
      setLoading(false);
    }
  };

  return { productos, loading, error, recargar: cargar };
};

/**
 * Hook para obtener estadísticas del inventario
 */
export const useEstadisticasInventario = () => {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioGeneralService.obtenerEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  return { estadisticas, loading, error, recargar: cargar };
};
