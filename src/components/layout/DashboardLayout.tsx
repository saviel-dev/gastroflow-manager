import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';


interface DashboardLayoutProps {
  title?: string;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/inventario-general': 'Inventario General',
  '/inventario-detallado': 'Inventario Detallado',
  '/movimientos': 'Movimientos',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
};

const DashboardLayout = ({ title }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Determine title: prop title > route mapping > default
  const currentTitle = title || routeTitles[location.pathname] || 'Panel de Control';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header title={currentTitle} onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />

        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
