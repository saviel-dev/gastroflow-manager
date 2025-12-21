import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Mail, Lock, Eye, EyeOff, UserCircle, Loader2, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { toast } from 'sonner';

// Utilidades de validación
const validateEmail = (email: string): string | null => {
  if (!email) return 'El email es requerido';
  if (email.trim().length === 0) return 'El email no puede estar vacío';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email inválido';
  
  if (email.length > 100) return 'Email demasiado largo';
  
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (password.length > 100) return 'Contraseña demasiado larga';
  
  return null;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validar email en tiempo real
  useEffect(() => {
    if (email.length > 0) {
      const error = validateEmail(email);
      setEmailError(error);
    } else {
      setEmailError(null);
    }
  }, [email]);

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (password.length > 0) {
      const error = validatePassword(password);
      setPasswordError(error);
    } else {
      setPasswordError(null);
    }
  }, [password]);

  // Desbloquear después de 30 segundos
  useEffect(() => {
    if (isBlocked) {
      const timer = setTimeout(() => {
        setIsBlocked(false);
        setLoginAttempts(0);
        toast.info('Puedes intentar iniciar sesión nuevamente');
      }, 30000); // 30 segundos

      return () => clearTimeout(timer);
    }
  }, [isBlocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar si está bloqueado
    if (isBlocked) {
      toast.error('Demasiados intentos fallidos. Espera 30 segundos.');
      return;
    }

    // Validar inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (emailValidation || passwordValidation) {
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email.trim().toLowerCase(), password);
      
      // Resetear intentos en login exitoso
      setLoginAttempts(0);
      
      // Navegación manejada por el efecto de useAuthenticated
    } catch (error) {
      console.error('Login failed:', error);
      
      // Incrementar contador de intentos
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Bloquear después de 5 intentos fallidos
      if (newAttempts >= 5) {
        setIsBlocked(true);
        toast.error('Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos.');
      }
      
      // Limpiar contraseña por seguridad
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !emailError && !passwordError && email.length > 0 && password.length > 0 && !isBlocked;

  return (
    <div className="theme-transition min-h-screen flex items-center justify-center p-3 sm:p-4 bg-secondary dark:bg-brand-darker">
      <PageTransition className="w-full max-w-[400px] bg-card dark:bg-brand-dark rounded-xl shadow-2xl overflow-hidden relative">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute top-3 right-3 p-2 rounded-full text-muted-foreground hover:bg-secondary dark:hover:bg-sidebar-accent transition-colors focus:outline-none z-10"
          title="Cambiar tema"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-primary" />
          )}
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 text-primary">
              <UserCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Bienvenido</h2>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Ingresa tus credenciales para acceder</p>
          </div>

          {/* Mensaje de bloqueo */}
          {isBlocked && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-destructive">
                Cuenta bloqueada temporalmente por seguridad. Espera 30 segundos antes de intentar nuevamente.
              </p>
            </div>
          )}

          {/* Indicador de intentos */}
          {loginAttempts > 0 && loginAttempts < 5 && (
            <div className="mb-4 p-2 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs text-warning text-center">
                Intento {loginAttempts} de 5. {5 - loginAttempts} intentos restantes.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`w-4 h-4 transition-colors ${
                    emailError ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'
                  }`} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isBlocked}
                  className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg bg-secondary dark:bg-brand-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm ${
                    emailError 
                      ? 'border-destructive focus:ring-destructive' 
                      : 'border-border focus:ring-primary focus:border-transparent'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  maxLength={100}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-foreground">
                  Contraseña *
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Contacta al administrador para recuperar tu contraseña')}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 transition-colors ${
                    passwordError ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'
                  }`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isBlocked}
                  className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg bg-secondary dark:bg-brand-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm ${
                    passwordError 
                      ? 'border-destructive focus:ring-destructive' 
                      : 'border-border focus:ring-primary focus:border-transparent'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isBlocked}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-brand-dark transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Info adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Sistema de gestión de inventario seguro
            </p>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Login;