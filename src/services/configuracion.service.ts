import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Configuracion, InsertConfiguracion, UpdateConfiguracion } from '@/types/database.types';

/**
 * Servicio para gestionar las configuraciones del sistema
 */
class ConfiguracionService {
  private readonly tabla = 'configuracion';

  /**
   * Obtener una configuración por clave
   */
  async obtenerPorClave(clave: string): Promise<Configuracion | null> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('clave', clave)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error al obtener configuración ${clave}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener todas las configuraciones
   */
  async obtenerTodas(): Promise<Configuracion[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .order('clave', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener configuraciones por categoría
   */
  async obtenerPorCategoria(categoria: string): Promise<Configuracion[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .eq('categoria', categoria)
        .order('clave', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error al obtener configuraciones de categoría ${categoria}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Crear o actualizar una configuración (upsert)
   */
  async guardar(configuracion: InsertConfiguracion): Promise<Configuracion> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .upsert(configuracion as any, { onConflict: 'clave' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Actualizar una configuración existente
   */
  async actualizar(clave: string, actualizacion: UpdateConfiguracion): Promise<Configuracion> {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .update(actualizacion)
        .eq('clave', clave)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error al actualizar configuración ${clave}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Crear nueva configuración
   */
  async crear(configuracion: InsertConfiguracion): Promise<Configuracion> {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .insert(configuracion)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear configuración:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Actualizar solo el valor de una configuración
   */
  async actualizarValor(clave: string, valor: string): Promise<Configuracion> {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .update({ valor } as any) // Mantener as any por partial update
        .eq('clave', clave)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error al actualizar valor de ${clave}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener tasa del BCV
   */
  async obtenerTasaBCV(): Promise<number> {
    try {
      const config = await this.obtenerPorClave('tasa_bcv');
      if (!config) return 0;
      return parseFloat(config.valor);
    } catch (error) {
      console.error('Error al obtener tasa BCV:', error);
      return 0;
    }
  }

  /**
   * Actualizar tasa del BCV
   */
  async actualizarTasaBCV(nuevaTasa: number): Promise<Configuracion> {
    try {
      // Verificar si existe primero
      const existe = await this.obtenerPorClave('tasa_bcv');
      
      if (existe) {
        return await this.actualizarValor('tasa_bcv', nuevaTasa.toString());
      } else {
        return await this.crear({
          clave: 'tasa_bcv',
          valor: nuevaTasa.toString(),
          tipo: 'numero',
          categoria: 'sistema',
          descripcion: 'Tasa de cambio del BCV'
        });
      }
    } catch (error) {
      console.error('Error al actualizar tasa BCV:', error);
      throw error;
    }
  }

  /**
   * Eliminar una configuración
   */
  async eliminar(clave: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tabla)
        .delete()
        .eq('clave', clave);

      if (error) throw error;
    } catch (error) {
      console.error(`Error al eliminar configuración ${clave}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Helper para parsear el valor según el tipo
   */
  parseValor(configuracion: Configuracion): any {
    if (!configuracion.valor) {
      return null;
    }

    switch (configuracion.tipo) {
      case 'numero':
        return parseFloat(configuracion.valor);
      case 'booleano':
        return configuracion.valor === 'true';
      case 'json':
        try {
          return JSON.parse(configuracion.valor);
        } catch {
          return null;
        }
      case 'texto':
      default:
        return configuracion.valor;
    }
  }

  /**
   * Helper para convertir valor a string para guardar
   */
  stringifyValor(valor: any, tipo: 'texto' | 'numero' | 'booleano' | 'json'): string {
    if (valor === null || valor === undefined) {
      return '';
    }

    switch (tipo) {
      case 'json':
        return JSON.stringify(valor);
      case 'booleano':
        return valor ? 'true' : 'false';
      case 'numero':
        return valor.toString();
      case 'texto':
      default:
        return String(valor);
    }
  }
}

// Exportar instancia única del servicio
export const configuracionService = new ConfiguracionService();
export default configuracionService;
