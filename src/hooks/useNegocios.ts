import { useState, useEffect } from 'react';
import { negociosService } from '@/services/negocios.service';
import type { Negocio, InsertNegocio, UpdateNegocio } from '@/types/database.types';

/**
 * Hook para obtener todos los negocios
 */
export const useNegocios = (soloActivos: boolean = true) => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, [soloActivos]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await negociosService.obtenerTodos(soloActivos);
      setNegocios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  const crear = async (negocio: InsertNegocio) => {
    try {
      setError(null);
      const nuevo = await negociosService.crear(negocio);
      setNegocios(prev => [...prev, nuevo]);
      return nuevo;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear negocio';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const actualizar = async (id: string, actualizacion: UpdateNegocio) => {
    try {
      setError(null);
      const actualizado = await negociosService.actualizar(id, actualizacion);
      setNegocios(prev => prev.map(n => n.id === id ? actualizado : n));
      return actualizado;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar negocio';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const eliminar = async (id: string) => {
    try {
      setError(null);
      await negociosService.eliminar(id);
      setNegocios(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar negocio';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return { negocios, loading, error, recargar: cargar, crear, actualizar, eliminar };
};

/**
 * Hook para obtener un negocio específico
 */
export const useNegocio = (id: string | null) => {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      cargar();
    } else {
      setNegocio(null);
      setLoading(false);
    }
  }, [id]);

  const cargar = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await negociosService.obtenerPorId(id);
      setNegocio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar negocio');
    } finally {
      setLoading(false);
    }
  };

  return { negocio, loading, error, recargar: cargar };
};
