import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { InventarioDetallado, InsertInventarioDetallado, UpdateInventarioDetallado } from '@/types/database.types';

/**
 * Servicio para gestionar el inventario detallado por negocio
 */
class InventarioDetalladoService {
  private readonly tabla = 'inventario_detallado';

  /**
   * Obtener todos los productos de un negocio
   */
  async obtenerPorNegocio(negocioId: string, soloActivos: boolean = true): Promise<InventarioDetallado[]> {
    try {
      let query = supabase
        .from(this.tabla)
        .select('*')
        .eq('negocio_id', negocioId)
        .order('nombre', { ascending: true });

      if (soloActivos) {
        query = query.eq('activo', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error al obtener inventario del negocio ${negocioId}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener un producto por ID
   */
  async obtenerPorId(id: string): Promise<InventarioDetallado | null> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Buscar productos por nombre en un negocio
   */
  async buscarPorNombre(negocioId: string, termino: string): Promise<InventarioDetallado[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('negocio_id', negocioId)
        .ilike('nombre', `%${termino}%`)
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener productos con bajo stock de un negocio
   */
  async obtenerBajoStock(negocioId: string): Promise<InventarioDetallado[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('negocio_id', negocioId)
        .in('estado', ['bajo', 'agotado'])
        .eq('activo', true)
        .order('stock', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Crear un nuevo producto en el inventario detallado
   */
  async crear(producto: InsertInventarioDetallado): Promise<InventarioDetallado> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .insert(producto)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Actualizar un producto existente
   */
  async actualizar(id: string, actualizacion: UpdateInventarioDetallado): Promise<InventarioDetallado> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .update(actualizacion)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Actualizar el stock de un producto
   */
  async actualizarStock(id: string, nuevoStock: number): Promise<InventarioDetallado> {
    return this.actualizar(id, { stock: nuevoStock });
  }

  /**
   * Incrementar el stock de un producto
   */
  async incrementarStock(id: string, cantidad: number): Promise<InventarioDetallado> {
    const producto = await this.obtenerPorId(id);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    return this.actualizarStock(id, producto.stock + cantidad);
  }

  /**
   * Decrementar el stock de un producto
   */
  async decrementarStock(id: string, cantidad: number): Promise<InventarioDetallado> {
    const producto = await this.obtenerPorId(id);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    const nuevoStock = Math.max(0, producto.stock - cantidad);
    return this.actualizarStock(id, nuevoStock);
  }

  /**
   * Eliminar un producto (soft delete)
   */
  async eliminar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tabla)
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Calcular el valor total del inventario de un negocio
   */
  async calcularValorTotal(negocioId: string): Promise<number> {
    try {
      const productos = await this.obtenerPorNegocio(negocioId, true);
      return productos.reduce((total, producto) => {
        return total + (producto.stock * producto.precio);
      }, 0);
    } catch (error) {
      console.error('Error al calcular valor total:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener estadísticas del inventario de un negocio
   */
  async obtenerEstadisticas(negocioId: string) {
    try {
      const productos = await this.obtenerPorNegocio(negocioId, true);
      
      return {
        totalProductos: productos.length,
        valorTotal: productos.reduce((sum, p) => sum + (p.stock * p.precio), 0),
        productosBajoStock: productos.filter(p => p.estado === 'bajo').length,
        productosAgotados: productos.filter(p => p.estado === 'agotado').length,
        productosPorCategoria: productos.reduce((acc, p) => {
          acc[p.categoria] = (acc[p.categoria] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
}

// Exportar instancia única del servicio
export const inventarioDetalladoService = new InventarioDetalladoService();
export default inventarioDetalladoService;
