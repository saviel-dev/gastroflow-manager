
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ExchangeRateData {
  fecha?: string;
  fechaActualizacion?: string;
  propiedad?: {
    nombre: string;
    actualizacion: string;
  };
  promedio: number;
}

interface ExchangeRateContextType {
  rate: number;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  refreshRate: () => Promise<void>;
  convert: (amountUSD: number) => number;
  formatBs: (amount: number) => string;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export const ExchangeRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rate, setRate] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (!response.ok) {
        throw new Error('Failed to fetch BCV rate');
      }
      const data: ExchangeRateData = await response.json();
      setRate(data.promedio);
      // Format date nicely if possible, or use raw
      // Handle various potential API response date fields for robustness
      const dateString = data.fechaActualizacion || data.fecha || data.propiedad?.actualizacion || new Date().toISOString();
      const date = new Date(dateString);
      
      setLastUpdated(date.toLocaleDateString('es-VE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setError('No se pudo obtener la tasa BCV');
      // Fallback or retry logic could go here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  const convert = (amountUSD: number) => {
    return amountUSD * rate;
  };

  const formatBs = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <ExchangeRateContext.Provider value={{
      rate,
      lastUpdated,
      isLoading,
      error,
      refreshRate: fetchRate,
      convert,
      formatBs
    }}>
      {children}
    </ExchangeRateContext.Provider>
  );
};

export const useExchangeRate = () => {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error('useExchangeRate must be used within an ExchangeRateProvider');
  }
  return context;
};
