import { supabase, handleSupabaseError } from '@/lib/supabase';
import { movimientosService } from './movimientos.service';
import type { Movimiento } from '@/types/database.types';

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  recentMovements: Movimiento[];
}

class DashboardService {
  private readonly tablaInventario = 'inventario_general';

  /**
   * Obtener todas las estadísticas del dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const [totalResult, lowStockResult, valueResult, recentMovements] = await Promise.all([
        // 1. Total Productos (count)
        supabase
          .from(this.tablaInventario)
          .select('*', { count: 'exact', head: true }),

        // 2. Bajo Stock (count filtrado)
        supabase
          .from(this.tablaInventario)
          .select('*', { count: 'exact', head: true })
          .or('estado.eq.bajo,estado.eq.agotado'),

        // 3. Valor Total (fetch minimal fields: stock, precio)
        // Nota: Idealmente esto sería un RPC, pero fetch parcial es eficiente
        supabase
          .from(this.tablaInventario)
          .select('stock, precio'),

        // 4. Movimientos Recientes
        movimientosService.obtenerRecientes() // El servicio ya tiene limite por defecto, ajustaremos si es necesario
      ]);

      if (totalResult.error) throw totalResult.error;
      if (lowStockResult.error) throw lowStockResult.error;
      if (valueResult.error) throw valueResult.error;

      // Calcular valor total en JS (mas rapido que traer todo el objeto)
      const totalValue = (valueResult.data || []).reduce((acc, item) => {
        return acc + (item.stock * item.precio);
      }, 0);

      // Limitar movimientos recientes para el dashboard (ej. 5)
      const limitedMovements = recentMovements.slice(0, 5);

      return {
        totalProducts: totalResult.count || 0,
        lowStockCount: lowStockResult.count || 0,
        totalValue,
        recentMovements: limitedMovements
      };

    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
