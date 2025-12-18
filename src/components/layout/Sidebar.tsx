import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  ArrowLeftRight, 
  BarChart3, 
  Settings, 
  X,
  UtensilsCrossed
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventario-general', icon: Package, label: 'Inventario General' },
  { to: '/inventario-detallado', icon: ClipboardList, label: 'Inventario Detallado' },
  { to: '/movimientos', icon: ArrowLeftRight, label: 'Movimientos' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
];

const systemItems = [
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/50 z-20 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`bg-sidebar text-sidebar-foreground w-64 flex-shrink-0 fixed md:relative h-full z-30 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-wide">
            <UtensilsCrossed className="w-6 h-6" />
            <span>GastroAdmin</span>
          </div>
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-sidebar-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:translate-x-2 hover:shadow-md group ${
                      isActive
                        ? 'bg-primary/10 text-primary border-r-4 border-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 group-hover:text-primary transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            <li className="pt-4 mt-4 border-t border-sidebar-border">
              <span className="px-4 text-xs font-semibold text-muted-foreground uppercase">Sistema</span>
            </li>

            {systemItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:translate-x-2 hover:shadow-lg group ${
                      isActive
                        ? 'bg-primary/10 text-primary border-r-4 border-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 group-hover:text-primary transition-transform group-hover:rotate-90" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-sidebar-border bg-foreground/5">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-primary"
            />
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{user?.role || 'Rol'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
