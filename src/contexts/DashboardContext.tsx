import React, { createContext, useContext, useState, useEffect } from 'react';
import { dashboardService, DashboardStats } from '@/services/dashboard.service';
import type { Movimiento } from '@/types/database.types';

interface DashboardContextType {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalProducts: 0,
  totalValue: 0,
  lowStockCount: 0,
  recentMovements: [],
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar estadísticas del dashboard';
      setError(errorMsg);
      console.error(errorMsg, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const refreshStats = async () => {
    await loadStats();
  };

  return (
    <DashboardContext.Provider value={{ stats, loading, error, refreshStats }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
