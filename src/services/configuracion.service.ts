import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Configuracion, InsertConfiguracion, UpdateConfiguracion } from '@/types/database.types';

/**
 * Servicio para gestionar configuraciones del sistema
 * Permite leer y actualizar configuraciones almacenadas en la base de datos
 */
class ConfiguracionService {
  private readonly tabla = 'configuracion';

  /**
   * Obtener todas las configuraciones
   */
  async obtenerTodas(): Promise<Configuracion[]> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .select('*')
        .order('categoria', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener una configuración por su clave
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
          // No se encontró el registro
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
   * Obtener el valor de una configuración
   */
  async obtenerValor(clave: string): Promise<string | null> {
    const config = await this.obtenerPorClave(clave);
    return config?.valor || null;
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
   * Crear una nueva configuración
   */
  async crear(configuracion: InsertConfiguracion): Promise<Configuracion> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
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
   * Actualizar una configuración existente
   */
  async actualizar(clave: string, actualizacion: UpdateConfiguracion): Promise<Configuracion> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
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
   * Actualizar solo el valor de una configuración
   */
  async actualizarValor(clave: string, valor: string): Promise<Configuracion> {
    return this.actualizar(clave, { valor });
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
   * Obtener la tasa de cambio BCV actual
   */
  async obtenerTasaBCV(): Promise<number> {
    const valor = await this.obtenerValor('tasa_cambio_bcv');
    return valor ? parseFloat(valor) : 50.0; // Valor por defecto
  }

  /**
   * Actualizar la tasa de cambio BCV
   */
  async actualizarTasaBCV(tasa: number): Promise<void> {
    await this.actualizarValor('tasa_cambio_bcv', tasa.toString());
  }

  /**
   * Obtener el porcentaje de IVA
   */
  async obtenerIVA(): Promise<number> {
    const valor = await this.obtenerValor('iva_porcentaje');
    return valor ? parseFloat(valor) : 16.0; // Valor por defecto
  }

  /**
   * Obtener la moneda principal del sistema
   */
  async obtenerMonedaPrincipal(): Promise<string> {
    const valor = await this.obtenerValor('moneda_principal');
    return valor || 'USD';
  }

  /**
   * Obtener la moneda secundaria del sistema
   */
  async obtenerMonedaSecundaria(): Promise<string> {
    const valor = await this.obtenerValor('moneda_secundaria');
    return valor || 'VES';
  }
}

// Exportar instancia única del servicio
export const configuracionService = new ConfiguracionService();
export default configuracionService;
