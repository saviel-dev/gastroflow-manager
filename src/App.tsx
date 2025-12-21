import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { DetailedInventoryProvider } from '@/contexts/DetailedInventoryContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import InventarioGeneral from '@/pages/InventarioGeneral';
import InventarioDetallado from '@/pages/InventarioDetallado';
import Movimientos from '@/pages/Movimientos';
import Configuracion from '@/pages/Configuracion';
import Reportes from '@/pages/Reportes';
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
                    </Route>
                  </Routes>
                </Router>
              </DetailedInventoryProvider>
            </LocationProvider>
          </ProductProvider>
        </ExchangeRateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
