import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { InventarioGeneral, InsertInventarioGeneral, UpdateInventarioGeneral } from '@/types/database.types';

/**
 * Servicio para gestionar el inventario general
 * Inventario centralizado de todos los productos disponibles
 */
class InventarioGeneralService {
  private readonly tabla = 'inventario_general';

  /**
   * Obtener todos los productos del inventario general
   */
  async obtenerTodos(soloActivos: boolean = true): Promise<InventarioGeneral[]> {
    try {
      let query = supabase
        .from(this.tabla)
        .select('*')
        .order('nombre', { ascending: true });

      if (soloActivos) {
        query = query.eq('activo', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener inventario general:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener un producto por ID
   */
  async obtenerPorId(id: string): Promise<InventarioGeneral | null> {
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
   * Buscar productos por nombre
   */
  async buscarPorNombre(termino: string): Promise<InventarioGeneral[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
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
   * Obtener productos por categoría
   */
  async obtenerPorCategoria(categoria: string): Promise<InventarioGeneral[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('categoria', categoria)
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error al obtener productos de categoría ${categoria}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener productos con bajo stock
   */
  async obtenerBajoStock(): Promise<InventarioGeneral[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
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
   * Obtener todas las categorías únicas
   */
  async obtenerCategorias(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('categoria')
        .eq('activo', true);

      if (error) throw error;
      
      // Extraer categorías únicas
      const categorias = [...new Set(data?.map(item => item.categoria) || [])];
      return categorias.sort();
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Crear un nuevo producto
   */
  async crear(producto: InsertInventarioGeneral): Promise<InventarioGeneral> {
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
  async actualizar(id: string, actualizacion: UpdateInventarioGeneral): Promise<InventarioGeneral> {
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
  async actualizarStock(id: string, nuevoStock: number): Promise<InventarioGeneral> {
    return this.actualizar(id, { stock: nuevoStock });
  }

  /**
   * Incrementar el stock de un producto
   */
  async incrementarStock(id: string, cantidad: number): Promise<InventarioGeneral> {
    const producto = await this.obtenerPorId(id);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    return this.actualizarStock(id, producto.stock + cantidad);
  }

  /**
   * Decrementar el stock de un producto
   */
  async decrementarStock(id: string, cantidad: number): Promise<InventarioGeneral> {
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
   * Eliminar permanentemente un producto
   */
  async eliminarPermanente(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tabla)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error al eliminar permanentemente producto ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Restaurar un producto eliminado
   */
  async restaurar(id: string): Promise<InventarioGeneral> {
    return this.actualizar(id, { activo: true });
  }

  /**
   * Calcular el valor total del inventario
   */
  async calcularValorTotal(): Promise<number> {
    try {
      const productos = await this.obtenerTodos(true);
      return productos.reduce((total, producto) => {
        return total + (producto.stock * producto.precio);
      }, 0);
    } catch (error) {
      console.error('Error al calcular valor total:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener estadísticas del inventario
   */
  async obtenerEstadisticas() {
    try {
      const productos = await this.obtenerTodos(true);
      
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
export const inventarioGeneralService = new InventarioGeneralService();
export default inventarioGeneralService;
