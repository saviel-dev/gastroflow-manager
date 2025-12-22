import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { movimientosService } from '@/services/movimientos.service';
import { inventarioGeneralService } from '@/services/inventario-general.service';
import { inventarioDetalladoService } from '@/services/inventario-detallado.service';
import type { Movimiento, InsertMovimiento } from '@/types/database.types';
import { toast } from 'sonner';

// Interfaz para movimiento en el frontend
export interface Movement {
  id: string;
  date: string;
  time: string;
  product: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  quantity: number;
  unit: string;
  reason: string;
  user: string;
  reference?: string;
  location?: string; // Para transferencias
}

export interface MovementStats {
  todayEntries: number;
  todayExits: number;
  todayAdjustments: number;
  todayTransfers: number;
  totalMovements: number;
}

interface MovementsContextType {
  movements: Movement[];
  loading: boolean;
  error: string | null;
  statistics: MovementStats;
  refreshMovements: () => Promise<void>;
  getMovementsByType: (type: string) => Movement[];
  getMovementsToday: () => Movement[];
  deleteMovement: (id: string) => Promise<void>;
  updateMovement: (id: string, movement: Partial<InsertMovimiento>) => Promise<void>;
  createMovement: (movement: InsertMovimiento) => Promise<void>;
}

const MovementsContext = createContext<MovementsContextType | undefined>(undefined);

// Función para formatear fecha
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Función para formatear hora
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toTimeString().slice(0, 5); // HH:MM
};

// Cache para nombres de productos
const productCache = new Map<string, string>();
const userCache = new Map<string, string>();

export const MovementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<MovementStats>({
    todayEntries: 0,
    todayExits: 0,
    todayAdjustments: 0,
    todayTransfers: 0,
    totalMovements: 0,
  });

  // Cargar movimientos al montar
  useEffect(() => {
    loadMovements();
  }, []);

  // Cargar nombre de producto (con caché)
  const getProductName = async (productoId: string, tipoInventario: 'general' | 'detallado'): Promise<string> => {
    const cacheKey = `${tipoInventario}_${productoId}`;
    
    if (productCache.has(cacheKey)) {
      return productCache.get(cacheKey)!;
    }

    try {
      if (tipoInventario === 'general') {
        const producto = await inventarioGeneralService.obtenerPorId(productoId);
        if (producto) {
          productCache.set(cacheKey, producto.nombre);
          return producto.nombre;
        }
      } else {
        const producto = await inventarioDetalladoService.obtenerPorId(productoId);
        if (producto) {
          productCache.set(cacheKey, producto.nombre);
          return producto.nombre;
        }
      }
    } catch (error) {
      console.error('Error al cargar nombre de producto:', error);
    }

    return 'Producto desconocido';
  };

  // Cargar nombre de usuario (con caché)
  const getUserName = async (usuarioId: string | null): Promise<string> => {
    if (!usuarioId) return 'Sistema';
    
    if (userCache.has(usuarioId)) {
      return userCache.get(usuarioId)!;
    }

    // Por ahora retornamos "Usuario" ya que no tenemos servicio de usuarios
    // TODO: Implementar cuando tengamos el servicio
    return 'Usuario';
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener movimientos recientes
      const data = await movimientosService.obtenerRecientes();

      // Mapear a formato del frontend
      const mappedMovements = await Promise.all(
        data.map(async (mov: Movimiento) => {
          const productName = await getProductName(mov.producto_id, mov.tipo_inventario);
          const userName = await getUserName(mov.usuario_id);

          return {
            id: mov.id,
            date: formatDate(mov.fecha_movimiento),
            time: formatTime(mov.fecha_movimiento),
            product: productName,
            type: mov.tipo,
            quantity: Number(mov.cantidad),
            unit: mov.unidad,
            reason: mov.motivo || '',
            user: userName,
            reference: mov.referencia || undefined,
            location: mov.negocio_id || undefined,
          };
        })
      );

      setMovements(mappedMovements);
      
      // Calcular estadísticas
      calculateStatistics(mappedMovements);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar movimientos';
      setError(errorMsg);
      console.error('Error al cargar movimientos:', err);
      // No mostrar toast en carga inicial
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (movs: Movement[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayMovements = movs.filter(m => m.date === today);

    setStatistics({
      todayEntries: todayMovements.filter(m => m.type === 'entrada').length,
      todayExits: todayMovements.filter(m => m.type === 'salida').length,
      todayAdjustments: todayMovements.filter(m => m.type === 'ajuste').length,
      todayTransfers: todayMovements.filter(m => m.type === 'transferencia').length,
      totalMovements: movs.length,
    });
  };

  const refreshMovements = useCallback(async () => {
    await loadMovements();
  }, []);

  const getMovementsByType = useCallback((type: string): Movement[] => {
    if (type === 'all') return movements;
    return movements.filter(m => m.type === type);
  }, [movements]);

  const getMovementsToday = useCallback((): Movement[] => {
    const today = new Date().toISOString().split('T')[0];
    return movements.filter(m => m.date === today);
  }, [movements]);

  const createMovement = async (movement: InsertMovimiento) => {
    try {
      setLoading(true);
      await movimientosService.registrar(movement);
      await loadMovements();
      toast.success('Movimiento registrado exitosamente');
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      toast.error('Error al registrar movimiento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMovement = async (id: string, movement: Partial<InsertMovimiento>) => {
    try {
      setLoading(true);
      await movimientosService.actualizar(id, movement);
      await loadMovements();
      toast.success('Movimiento actualizado');
    } catch (error) {
      console.error('Error al actualizar movimiento:', error);
      toast.error('Error al actualizar movimiento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovement = async (id: string) => {
    try {
      setLoading(true);
      await movimientosService.eliminar(id);
      await loadMovements();
      toast.success('Movimiento eliminado');
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      toast.error('Error al eliminar movimiento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MovementsContext.Provider
      value={{
        movements,
        loading,
        error,
        statistics,
        refreshMovements,
        getMovementsByType,
        getMovementsToday,
        createMovement,
        updateMovement,
        deleteMovement,
      }}
    >
      {children}
    </MovementsContext.Provider>
  );
};

export const useMovements = () => {
  const context = useContext(MovementsContext);
  if (context === undefined) {
    throw new Error('useMovements must be used within a MovementsProvider');
  }
  return context;
};
