import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  title?: string;
}

const DashboardLayout = ({ title = 'Panel de Control' }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
