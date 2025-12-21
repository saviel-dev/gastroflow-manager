import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Negocio, InsertNegocio, UpdateNegocio } from '@/types/database.types';

/**
 * Servicio para gestionar negocios/ubicaciones
 */
class NegociosService {
  private readonly tabla = 'negocios';

  /**
   * Obtener todos los negocios
   */
  async obtenerTodos(soloActivos: boolean = true): Promise<Negocio[]> {
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
      console.error('Error al obtener negocios:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Obtener un negocio por ID
   */
  async obtenerPorId(id: string): Promise<Negocio | null> {
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
      console.error(`Error al obtener negocio ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Crear un nuevo negocio
   */
  async crear(negocio: InsertNegocio): Promise<Negocio> {
    try {
      const { data, error } = await supabase
        .from(this.tabla)
        .insert(negocio)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear negocio:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Actualizar un negocio existente
   */
  async actualizar(id: string, actualizacion: UpdateNegocio): Promise<Negocio> {
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
      console.error(`Error al actualizar negocio ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Eliminar un negocio (soft delete)
   */
  async eliminar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tabla)
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error al eliminar negocio ${id}:`, error);
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Restaurar un negocio eliminado
   */
  async restaurar(id: string): Promise<Negocio> {
    return this.actualizar(id, { activo: true });
  }
}

// Exportar instancia única del servicio
export const negociosService = new NegociosService();
export default negociosService;
