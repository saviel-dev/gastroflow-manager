import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: string;
  telefono?: string;
  avatar_url?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  rol?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

class AuthService {
  /**
   * Iniciar sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validar inputs
      if (!email || !password) {
        return { user: null, error: 'Email y contraseña son requeridos' };
      }

      // Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error('Error de autenticación:', authError);
        // Mensajes genéricos para seguridad
        if (authError.message.includes('Invalid login credentials')) {
          return { user: null, error: 'Credenciales inválidas' };
        }
        if (authError.message.includes('Email not confirmed')) {
          return { user: null, error: 'Por favor verifica tu correo electrónico' };
        }
        return { user: null, error: 'Error al iniciar sesión. Intenta nuevamente.' };
      }

      if (!authData.user) {
        return { user: null, error: 'Usuario no encontrado' };
      }

      // Obtener datos adicionales del usuario desde la tabla usuarios
      const userData = await this.getUserData(authData.user.id);
      
      if (!userData) {
        return { user: null, error: 'Error al obtener datos del usuario' };
      }

      return { user: userData, error: null };
    } catch (error) {
      console.error('Error en login:', error);
      return { user: null, error: 'Error inesperado al iniciar sesión' };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validaciones
      if (!data.email || !data.password || !data.nombre || !data.apellidos) {
        return { user: null, error: 'Todos los campos son requeridos' };
      }

      if (data.password.length < 6) {
        return { user: null, error: 'La contraseña debe tener al menos 6 caracteres' };
      }

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            nombre: data.nombre,
            apellidos: data.apellidos,
          },
        },
      });

      if (authError) {
        console.error('Error al registrar:', authError);
        if (authError.message.includes('already registered')) {
          return { user: null, error: 'Este email ya está registrado' };
        }
        return { user: null, error: 'Error al crear la cuenta' };
      }

      if (!authData.user) {
        return { user: null, error: 'Error al crear el usuario' };
      }

      // Crear registro en tabla usuarios
      const { error: insertError } = await supabase.from('usuarios').insert({
        id: authData.user.id,
        email: data.email.trim().toLowerCase(),
        nombre: data.nombre,
        apellidos: data.apellidos,
        rol: data.rol || 'usuario',
        telefono: data.telefono || null,
        activo: true,
      });

      if (insertError) {
        console.error('Error al crear perfil de usuario:', insertError);
        // El usuario de auth se creó, pero no el perfil
        return { user: null, error: 'Usuario creado pero error al crear perfil' };
      }

      const userData = await this.getUserData(authData.user.id);
      return { user: userData, error: null };
    } catch (error) {
      console.error('Error en registro:', error);
      return { user: null, error: 'Error inesperado al registrar usuario' };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return await this.getUserData(user.id);
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  /**
   * Obtener sesión actual
   */
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      if (!email) {
        return { error: 'Email es requerido' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Error al solicitar reseteo:', error);
        return { error: 'Error al enviar correo de recuperación' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return { error: 'Error inesperado' };
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error al actualizar contraseña:', error);
        return { error: 'Error al actualizar contraseña' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error en updatePassword:', error);
      return { error: 'Error inesperado' };
    }
  }

  /**
   * Verificar si hay sesión activa
   */
  async verifySession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return !!session;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      return false;
    }
  }

  /**
   * Obtener datos del usuario desde la tabla usuarios
   */
  private async getUserData(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre, apellidos, rol, telefono, avatar_url')
        .eq('id', userId)
        .eq('activo', true)
        .single();

      if (error || !data) {
        console.error('Error al obtener datos del usuario:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        apellidos: data.apellidos,
        rol: data.rol,
        telefono: data.telefono || undefined,
        avatar_url: data.avatar_url || undefined,
      };
    } catch (error) {
      console.error('Error en getUserData:', error);
      return null;
    }
  }

  /**
   * Listener para cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await this.getUserData(session.user.id);
        callback(userData);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
