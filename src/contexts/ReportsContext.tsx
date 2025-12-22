import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProduct } from './ProductContext';
import { useMovements } from './MovementsContext';
import type { Product } from './ProductContext';
import type { Movement } from './MovementsContext';

// Tipos de períodos de reporte
export type ReportPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';

// Datos para gráfico de tendencia
export interface TrendDataPoint {
  day: string;
  valor: number;
}

// Datos para distribución de movimientos
export interface MovementDistribution {
  name: string;
  value: number;
  color: string;
}

// Datos para top productos
export interface TopProduct {
  name: string;
  ventas: number;
}

// Datos para stock crítico
export interface CriticalStock {
  id: string;
  name: string;
  stock: number;
  unit: string;
  status: 'out' | 'low';
}

// KPIs principales
export interface ReportKPIs {
  inventoryValue: number;
  periodLosses: number;
  activeProducts: number;
  stockAlerts: number;
}

// Datos completos del reporte
export interface ReportData {
  kpis: ReportKPIs;
  trendData: TrendDataPoint[];
  movementDistribution: MovementDistribution[];
  topProducts: TopProduct[];
  criticalStock: CriticalStock[];
}

interface ReportsContextType {
  reportData: ReportData;
  loading: boolean;
  error: string | null;
  currentPeriod: ReportPeriod;
  exporting: boolean;
  setDateRange: (period: ReportPeriod) => void;
  refreshReports: () => Promise<void>;
  exportToPDF: () => Promise<void>;
  exportToExcel: () => Promise<void>;
  exportToCSV: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Función helper para calcular fecha de inicio según período
const getStartDateForPeriod = (period: ReportPeriod): Date => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'biweekly':
      startDate.setDate(startDate.getDate() - 15);
      break;
    case 'monthly':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'quarterly':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'annual':
      startDate.setDate(startDate.getDate() - 365);
      break;
  }
  
  return startDate;
};

// Función para formatear fecha YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, loading: productsLoading } = useProduct();
  const { movements, loading: movementsLoading } = useMovements();
  
  const [currentPeriod, setCurrentPeriod] = useState<ReportPeriod>('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    kpis: {
      inventoryValue: 0,
      periodLosses: 0,
      activeProducts: 0,
      stockAlerts: 0,
    },
    trendData: [],
    movementDistribution: [],
    topProducts: [],
    criticalStock: [],
  });

  // Calcular datos del reporte cuando cambien productos, movimientos o período
  useEffect(() => {
    if (!productsLoading && !movementsLoading) {
      calculateReportData();
    }
  }, [products, movements, currentPeriod, productsLoading, movementsLoading]);

  const calculateReportData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const startDate = getStartDateForPeriod(currentPeriod);
      const startDateStr = formatDate(startDate);

      // Filtrar movimientos del período
      const periodMovements = movements.filter(m => m.date >= startDateStr);

      // 1. Calcular KPIs
      const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
      const periodLosses = periodMovements
        .filter(m => m.type === 'salida' || m.type === 'ajuste')
        .reduce((sum, m) => {
          const product = products.find(p => p.name === m.product);
          return sum + (product ? m.quantity * product.price : 0);
        }, 0);
      const activeProducts = products.filter(p => p.status !== 'out').length;
      const stockAlerts = products.filter(p => p.status === 'low' || p.status === 'out').length;

      // 2. Calcular datos de tendencia (últimos 7 puntos según período)
      const trendData: TrendDataPoint[] = [];
      const pointsToShow = currentPeriod === 'daily' ? 24 : 7; // 24 horas o 7 días
      const interval = currentPeriod === 'daily' ? 'hour' : 'day';
      
      for (let i = pointsToShow - 1; i >= 0; i--) {
        const date = new Date();
        if (interval === 'hour') {
          date.setHours(date.getHours() - i);
        } else {
          date.setDate(date.getDate() - i);
        }
        
        const label = interval === 'hour' 
          ? `${date.getHours()}:00` 
          : date.toLocaleDateString('es-ES', { weekday: 'short' });
        
        // Por ahora usamos el valor actual del inventario
        // En una implementación real, necesitaríamos histórico de valores
        trendData.push({
          day: label,
          valor: inventoryValue,
        });
      }

      // 3. Calcular distribución de movimientos
      const entradas = periodMovements.filter(m => m.type === 'entrada').length;
      const salidas = periodMovements.filter(m => m.type === 'salida').length;
      const ajustes = periodMovements.filter(m => m.type === 'ajuste').length;
      const transferencias = periodMovements.filter(m => m.type === 'transferencia').length;
      const total = entradas + salidas + ajustes + transferencias || 1; // Evitar división por 0

      const movementDistribution: MovementDistribution[] = [
        { name: 'Entradas', value: Math.round((entradas / total) * 100), color: '#10b981' },
        { name: 'Salidas', value: Math.round((salidas / total) * 100), color: '#3b82f6' },
        { name: 'Ajustes', value: Math.round((ajustes / total) * 100), color: '#f59e0b' },
        { name: 'Transferencias', value: Math.round((transferencias / total) * 100), color: '#a855f7' },
      ];

      // 4. Calcular top productos por movimientos
      const productMovementCount = new Map<string, number>();
      periodMovements.forEach(m => {
        const current = productMovementCount.get(m.product) || 0;
        productMovementCount.set(m.product, current + m.quantity);
      });

      const topProducts: TopProduct[] = Array.from(productMovementCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, ventas]) => ({ name, ventas }));

      // 5. Calcular stock crítico
      const criticalStock: CriticalStock[] = products
        .filter(p => p.status === 'low' || p.status === 'out')
        .map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          unit: p.unit,
          status: p.status === 'out' ? 'out' : 'low',
        }));

      setReportData({
        kpis: {
          inventoryValue,
          periodLosses,
          activeProducts,
          stockAlerts,
        },
        trendData,
        movementDistribution,
        topProducts,
        criticalStock,
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al calcular reportes';
      setError(errorMsg);
      console.error('Error al calcular reportes:', err);
    } finally {
      setLoading(false);
    }
  }, [products, movements, currentPeriod]);

  const setDateRange = useCallback((period: ReportPeriod) => {
    setCurrentPeriod(period);
  }, []);

  const refreshReports = useCallback(async () => {
    calculateReportData();
  }, [calculateReportData]);

  const exportToPDF = useCallback(async () => {
    setExporting(true);
    try {
      // Importación dinámica para evitar cargar la librería hasta que se necesite
      const { generatePDFReport } = await import('@/utils/report-export.utils');
      await generatePDFReport(reportData, currentPeriod);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      setError('Error al exportar reporte en PDF');
    } finally {
      setExporting(false);
    }
  }, [reportData, currentPeriod]);

  const exportToExcel = useCallback(async () => {
    setExporting(true);
    try {
      const { generateExcelReport } = await import('@/utils/report-export.utils');
      await generateExcelReport(reportData, currentPeriod, products, movements);
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      setError('Error al exportar reporte en Excel');
    } finally {
      setExporting(false);
    }
  }, [reportData, currentPeriod, products, movements]);

  const exportToCSV = useCallback(async () => {
    setExporting(true);
    try {
      const { generateCSVReport } = await import('@/utils/report-export.utils');
      await generateCSVReport(reportData, currentPeriod, movements);
    } catch (err) {
      console.error('Error al exportar CSV:', err);
      setError('Error al exportar reporte en CSV');
    } finally {
      setExporting(false);
    }
  }, [reportData, currentPeriod, movements]);

  return (
    <ReportsContext.Provider
      value={{
        reportData,
        loading,
        error,
        currentPeriod,
        exporting,
        setDateRange,
        refreshReports,
        exportToPDF,
        exportToExcel,
        exportToCSV,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
