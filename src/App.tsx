import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ExchangeRateProvider } from "@/contexts/ExchangeRateContext";
import { ProductProvider } from "@/contexts/ProductContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import InventarioGeneral from "./pages/InventarioGeneral";
import InventarioDetallado from "./pages/InventarioDetallado";
import Movimientos from "./pages/Movimientos";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ExchangeRateProvider>
        <ProductProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventario-general" element={<InventarioGeneral />} />
                <Route path="/inventario-detallado" element={<InventarioDetallado />} />
                <Route path="/movimientos" element={<Movimientos />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
        </ProductProvider>
      </ExchangeRateProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
