import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type AuthUser } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ⚠️ MODO DESARROLLO: Cambiar a false cuando Supabase Auth esté configurado
const DEV_MODE = true;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión al cargar
  useEffect(() => {
    if (DEV_MODE) {
      // En modo desarrollo, verificar si hay usuario guardado en localStorage
      const savedUser = localStorage.getItem('dev_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error al cargar usuario:', e);
        }
      }
      setLoading(false);
    } else {
      checkSession();
      
      // Escuchar cambios en autenticación
      const { data: { subscription } } = authService.onAuthStateChange((userData) => {
        setUser(userData);
        setLoading(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error al verificar sesión:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (DEV_MODE) {
        // ⚠️ MODO DESARROLLO: Login directo sin Supabase Auth
        console.warn('⚠️ Usando modo de desarrollo - Autenticación simplificada');
        
        // Buscar usuario directamente en la tabla usuarios
        const { data: userData, error: dbError } = await supabase
          .from('usuarios')
          .select('id, email, nombre_completo, rol, telefono, avatar_url')
          .eq('email', email.trim().toLowerCase())
          .eq('activo', true)
          .single();

        if (dbError || !userData) {
          throw new Error('Usuario no encontrado o credenciales inválidas');
        }

        const userRecord = userData as any;

        // Split nombre_completo into first and last name for backward compatibility
        const parts = (userRecord.nombre_completo || '').split(' ');
        const nombre = parts[0] || '';
        const apellidos = parts.slice(1).join(' ') || '';

        // Crear objeto de usuario
        const authUser: AuthUser = {
          id: userRecord.id,
          email: userRecord.email,
          nombre: nombre,
          apellidos: apellidos,
          rol: userRecord.rol,
          telefono: userRecord.telefono || undefined,
          avatar_url: userRecord.avatar_url || undefined,
        };

        // Guardar en localStorage para persistencia
        localStorage.setItem('dev_user', JSON.stringify(authUser));
        
        setUser(authUser);
        toast.success(`¡Bienvenido ${authUser.nombre}!`);
      } else {
        // Modo producción: usar Supabase Auth
        const { user: userData, error: loginError } = await authService.login(email, password);

        if (loginError) {
          setError(loginError);
          toast.error(loginError);
          throw new Error(loginError);
        }

        if (!userData) {
          const errorMsg = 'Error al obtener datos del usuario';
          setError(errorMsg);
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }

        setUser(userData);
        toast.success(`¡Bienvenido ${userData.nombre}!`);
      }
    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      if (DEV_MODE) {
        // Modo desarrollo: solo limpiar localStorage
        localStorage.removeItem('dev_user');
        setUser(null);
        toast.success('Sesión cerrada exitosamente');
      } else {
        // Modo producción: usar Supabase Auth
        await authService.logout();
        setUser(null);
        toast.success('Sesión cerrada exitosamente');
      }
    } catch (err) {
      console.error('Error en logout:', err);
      toast.error('Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (file: File) => {
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      setLoading(true);

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Solo el nombre del archivo, el bucket ya se llama 'avatars'

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar en base de datos
      const { error: dbError } = await (supabase
        .from('usuarios') as any)
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) {
        throw dbError;
      }

      // Actualizar estado local
      const updatedUser = { ...user, avatar_url: publicUrl };
      setUser(updatedUser);

      // Actualizar localStorage en modo desarrollo
      if (DEV_MODE) {
        localStorage.setItem('dev_user', JSON.stringify(updatedUser));
      }

      toast.success('Avatar actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar avatar:', err);
      toast.error('Error al actualizar avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      updateAvatar,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
