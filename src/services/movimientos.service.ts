import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Movimiento, InsertMovimiento } from '@/types/database.types';

/**
 * Servicio para gestionar movimientos de inventario
 * Registra entradas, salidas, ajustes y transferencias
 */
class MovimientosService {
  private readonly tabla = 'movimientos';

  /**
   * Obtener todos los movimientos
   */
  async obtenerTodos(limite: number = 100): Promise<Movimiento[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .order('fecha_movimiento', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener movimientos recientes (últimos 30 días)
   */
  async obtenerRecientes(): Promise<Movimiento[]> {
    try {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .gte('fecha_movimiento', hace30Dias.toISOString())
        .order('fecha_movimiento', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener movimientos recientes:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener movimientos por producto
   */
  async obtenerPorProducto(productoId: string, tipoInventario: 'general' | 'detallado'): Promise<Movimiento[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('producto_id', productoId)
        .eq('tipo_inventario', tipoInventario)
        .order('fecha_movimiento', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener movimientos del producto:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener movimientos por negocio
   */
  async obtenerPorNegocio(negocioId: string): Promise<Movimiento[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('negocio_id', negocioId)
        .order('fecha_movimiento', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener movimientos del negocio:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener movimientos por tipo
   */
  async obtenerPorTipo(tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia'): Promise<Movimiento[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('tipo', tipo)
        .order('fecha_movimiento', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error al obtener movimientos de tipo ${tipo}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Registrar un nuevo movimiento
   */
  async registrar(movimiento: InsertMovimiento): Promise<Movimiento> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .insert(movimiento)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Registrar una entrada de inventario
   */
  async registrarEntrada(
    productoId: string,
    tipoInventario: 'general' | 'detallado',
    cantidad: number,
    unidad: string,
    opciones?: {
      negocioId?: string;
      precioUnitario?: number;
      motivo?: string;
      usuarioId?: string;
      referencia?: string;
      notas?: string;
    }
  ): Promise<Movimiento> {
    const movimiento: InsertMovimiento = {
      tipo: 'entrada',
      producto_id: productoId,
      tipo_inventario: tipoInventario,
      cantidad,
      unidad,
      precio_unitario: opciones?.precioUnitario,
      total: opciones?.precioUnitario ? opciones.precioUnitario * cantidad : undefined,
      negocio_id: opciones?.negocioId,
      motivo: opciones?.motivo,
      usuario_id: opciones?.usuarioId,
      referencia: opciones?.referencia,
      notas: opciones?.notas,
    };

    return this.registrar(movimiento);
  }

  /**
   * Registrar una salida de inventario
   */
  async registrarSalida(
    productoId: string,
    tipoInventario: 'general' | 'detallado',
    cantidad: number,
    unidad: string,
    opciones?: {
      negocioId?: string;
      precioUnitario?: number;
      motivo?: string;
      usuarioId?: string;
      referencia?: string;
      notas?: string;
    }
  ): Promise<Movimiento> {
    const movimiento: InsertMovimiento = {
      tipo: 'salida',
      producto_id: productoId,
      tipo_inventario: tipoInventario,
      cantidad,
      unidad,
      precio_unitario: opciones?.precioUnitario,
      total: opciones?.precioUnitario ? opciones.precioUnitario * cantidad : undefined,
      negocio_id: opciones?.negocioId,
      motivo: opciones?.motivo,
      usuario_id: opciones?.usuarioId,
      referencia: opciones?.referencia,
      notas: opciones?.notas,
    };

    return this.registrar(movimiento);
  }

  /**
   * Obtener estadísticas de movimientos
   */
  async obtenerEstadisticas(dias: number = 30) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);

      const movimientos = await this.obtenerRecientes();

      return {
        totalMovimientos: movimientos.length,
        entradas: movimientos.filter(m => m.tipo === 'entrada').length,
        salidas: movimientos.filter(m => m.tipo === 'salida').length,
        ajustes: movimientos.filter(m => m.tipo === 'ajuste').length,
        transferencias: movimientos.filter(m => m.tipo === 'transferencia').length,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de movimientos:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
}

// Exportar instancia única del servicio
export const movimientosService = new MovimientosService();
export default movimientosService;
