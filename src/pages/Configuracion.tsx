import { Settings, User, Store, Bell, Database, Palette, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import AvatarUpload from '@/components/settings/AvatarUpload';
import PageTransition from '@/components/layout/PageTransition';

const Configuracion = () => {
  const { theme, toggleTheme } = useTheme();
  const { businessInfo, notifications, loading, saving, updateBusinessInfo, updateNotifications, saveSettings } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'usuario', label: 'Usuario', icon: User },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'datos', label: 'Datos', icon: Database },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
  ];


  const handleSave = async () => {
    try {
      await saveSettings();
      window.location.reload();
    } catch (error) {
      // El error ya es manejado por el contexto y mostrado con toast
      console.error(error);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          Configuración
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Administra las preferencias del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar Tabs */}
        <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 lg:space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-card rounded-xl shadow-sm p-4 sm:p-6">
          {activeTab === 'general' && (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#222] p-4 border-b border-border">
                <h2 className="text-lg font-bold text-white">Información del Negocio</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nombre del Negocio</label>
                    <input
                      type="text"
                      value={businessInfo.nombre}
                      onChange={(e) => updateBusinessInfo({ nombre: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={businessInfo.telefono}
                      onChange={(e) => updateBusinessInfo({ telefono: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                    <input
                      type="text"
                      value={businessInfo.direccion}
                      onChange={(e) => updateBusinessInfo({ direccion: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usuario' && (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#222] p-4 border-b border-border">
                <h2 className="text-lg font-bold text-white">Perfil de Usuario</h2>
              </div>
              <div className="p-6 space-y-6">
                <AvatarUpload currentAvatar={user?.avatar_url} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                    <input
                      type="text"
                      defaultValue={user?.nombre || ''}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-secondary text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Apellidos</label>
                    <input
                      type="text"
                      defaultValue={user?.apellidos || ''}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-secondary text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-secondary text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Rol</label>
                    <input
                      type="text"
                      defaultValue={user?.rol || ''}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-secondary text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#222] p-4 border-b border-border">
                <h2 className="text-lg font-bold text-white">Preferencias de Notificaciones</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { id: 'alertasStockBajo', label: 'Alertas de stock bajo', description: 'Recibe notificaciones cuando un producto tenga stock bajo' },
                  { id: 'resumenDiario', label: 'Resumen diario de ventas', description: 'Recibe un resumen de las ventas al final del día' },
                  { id: 'movimientosInventario', label: 'Nuevos movimientos de inventario', description: 'Notificaciones en tiempo real de entradas y salidas' },
                  { id: 'productosVencer', label: 'Alertas de productos por vencer', description: 'Aviso de productos próximos a su fecha de vencimiento' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications[item.id as keyof typeof notifications]}
                        onChange={(e) => updateNotifications({ [item.id]: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
               <div className="bg-[#222] p-4 border-b border-border">
                <h2 className="text-lg font-bold text-white">Gestión de Datos</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Exportar Datos</h3>
                  <p className="text-sm text-muted-foreground mb-3">Descarga una copia de todos tus datos en formato CSV o Excel.</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                      Exportar CSV
                    </button>
                    <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                      Exportar Excel
                    </button>
                  </div>
                </div>
                <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                  <h3 className="font-medium text-destructive mb-2">Zona de Peligro</h3>
                  <p className="text-sm text-muted-foreground mb-3">Eliminar todos los datos. Esta acción no se puede deshacer.</p>
                  <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:bg-destructive/90 transition-colors">
                    Eliminar todos los datos
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
               <div className="bg-[#222] p-4 border-b border-border">
                <h2 className="text-lg font-bold text-white">Apariencia</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Tema</h3>
                  <p className="text-sm text-muted-foreground mb-3">Selecciona el tema de la interfaz.</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 bg-secondary rounded mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-card rounded shadow" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Claro</p>
                    </button>
                    <button
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 bg-brand-dark rounded mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-sidebar-accent rounded shadow" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Oscuro</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default Configuracion;
