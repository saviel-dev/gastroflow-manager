import { Settings, User, Store, Bell, Shield, Database, Palette, Save } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Configuracion = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'usuario', label: 'Usuario', icon: User },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'datos', label: 'Datos', icon: Database },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          Configuración
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Administra las preferencias del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="bg-card rounded-xl shadow-sm p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-card rounded-xl shadow-sm p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Información del Negocio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre del Negocio</label>
                  <input
                    type="text"
                    defaultValue="GastroAdmin Restaurant"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                  <input
                    type="tel"
                    defaultValue="+52 555 123 4567"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                  <input
                    type="text"
                    defaultValue="Av. Principal 123, Ciudad de México"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Moneda</label>
                  <select className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background">
                    <option>MXN - Peso Mexicano</option>
                    <option>USD - Dólar Americano</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Zona Horaria</label>
                  <select className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background">
                    <option>América/Ciudad_de_México (GMT-6)</option>
                    <option>América/Bogotá (GMT-5)</option>
                    <option>América/Buenos_Aires (GMT-3)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usuario' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Perfil de Usuario</h2>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-primary"
                />
                <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                  Cambiar foto
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                  <input
                    type="text"
                    defaultValue="Carlos Admin"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    defaultValue="carlos@gastroadmin.com"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Rol</label>
                  <input
                    type="text"
                    defaultValue="Gerente General"
                    disabled
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-secondary text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Preferencias de Notificaciones</h2>
              <div className="space-y-4">
                {[
                  { label: 'Alertas de stock bajo', description: 'Recibe notificaciones cuando un producto tenga stock bajo' },
                  { label: 'Resumen diario de ventas', description: 'Recibe un resumen de las ventas al final del día' },
                  { label: 'Nuevos movimientos de inventario', description: 'Notificaciones en tiempo real de entradas y salidas' },
                  { label: 'Alertas de productos por vencer', description: 'Aviso de productos próximos a su fecha de vencimiento' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Seguridad de la Cuenta</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Contraseña actual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                  Actualizar contraseña
                </button>
              </div>
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Gestión de Datos</h2>
              <div className="space-y-4">
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
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Apariencia</h2>
              <div className="space-y-4">
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
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
