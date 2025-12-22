import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { DetailedInventoryProvider } from '@/contexts/DetailedInventoryContext';
import { MovementsProvider } from '@/contexts/MovementsContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { DashboardProvider } from '@/contexts/DashboardContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import InventarioGeneral from '@/pages/InventarioGeneral';
import InventarioDetallado from '@/pages/InventarioDetallado';
import Movimientos from '@/pages/Movimientos';
import Configuracion from '@/pages/Configuracion';
import Reportes from '@/pages/Reportes';
import Notificaciones from '@/pages/Notificaciones';
import Index from '@/pages/Index';
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExchangeRateProvider>
          <ProductProvider>
            <LocationProvider>
              <DetailedInventoryProvider>
                <MovementsProvider>
                  <ReportsProvider>
                    <SettingsProvider>
                      <NotificationProvider>
                        <DashboardProvider>
                          <Router>
                          <Toaster position="top-right" richColors />
                          <Routes>
                            {/* Ruta pública - Login */}
                            <Route path="/" element={<Index />} />
                            
                            {/* Rutas protegidas - Dashboard */}
                            <Route element={<DashboardLayout />}>
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="inventario-general" element={<InventarioGeneral />} />
                              <Route path="inventario-detallado" element={<InventarioDetallado />} />
                              <Route path="movimientos" element={<Movimientos />} />
                              <Route path="configuracion" element={<Configuracion />} />
                              <Route path="reportes" element={<Reportes />} />
                              <Route path="notificaciones" element={<Notificaciones />} />
                            </Route>
                          </Routes>
                          </Router>
                        </DashboardProvider>
                      </NotificationProvider>
                    </SettingsProvider>
                  </ReportsProvider>
                </MovementsProvider>
              </DetailedInventoryProvider>
            </LocationProvider>
          </ProductProvider>
        </ExchangeRateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
