import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import PageTransition from '@/components/layout/PageTransition';
import { Bell, Check, CheckCheck, Clock, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Notificaciones = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState<'a ver' | 'todas' | 'no_leidas'>('todas');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'no_leidas') return !n.leida;
    return true;
  });

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'exito':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'advertencia':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary" />
              Notificaciones
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Historial de actividades y alertas del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-border pb-1">
          <button
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              filter === 'todas'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
            {filter === 'todas' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setFilter('no_leidas')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              filter === 'no_leidas'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            No leídas
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {unreadCount}
              </span>
            )}
            {filter === 'no_leidas' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground">Sin notificaciones</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {filter === 'no_leidas' 
                  ? 'No tienes notificaciones pendientes' 
                  : 'El historial de notificaciones está vacío'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notificacion) => (
              <div
                key={notificacion.id}
                onClick={!notificacion.leida ? () => markAsRead(notificacion.id) : undefined}
                className={`group relative p-4 rounded-xl border transition-all duration-200 ${
                  notificacion.leida
                    ? 'bg-card border-border'
                    : 'bg-primary/5 border-primary/20 hover:bg-primary/10 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    notificacion.leida ? 'bg-secondary' : 'bg-background shadow-sm'
                  }`}>
                    {getIcon(notificacion.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold truncate pr-8 ${
                        notificacion.leida ? 'text-foreground' : 'text-primary'
                      }`}>
                        {notificacion.titulo}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(notificacion.fecha_creacion), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 mb-2 ${
                      notificacion.leida ? 'text-muted-foreground' : 'text-foreground/90'
                    }`}>
                      {notificacion.mensaje}
                    </p>
                    
                    {!notificacion.leida && (
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notificacion.id);
                          }}
                          className="p-1 text-primary hover:bg-primary/10 rounded-full"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Notificaciones;
