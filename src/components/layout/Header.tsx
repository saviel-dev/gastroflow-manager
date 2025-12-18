import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-card shadow-sm flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-muted-foreground hover:text-primary">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-xs text-muted-foreground capitalize">{currentDate}</p>
        </div>
        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
