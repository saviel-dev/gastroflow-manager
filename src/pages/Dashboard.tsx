import { AlertTriangle, TrendingUp, Coins, Wallet } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentMovements from '@/components/dashboard/RecentMovements';
import PageTransition from '@/components/layout/PageTransition';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

const Dashboard = () => {
  const { rate, lastUpdated, isLoading } = useExchangeRate();

  return (
    <PageTransition>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Bajo Stock"
          value="0 Productos"
          icon={AlertTriangle}
          status="Sin productos registrados"
          bgColor="bg-amber-500"
          iconBgColor="bg-amber-600"
        />
        <StatCard
          title="Tasa BCV"
          value={isLoading ? "Actualizando..." : `Bs. ${rate.toFixed(2)}`}
          icon={TrendingUp}
          status={lastUpdated || "Consultando..."}
          bgColor="bg-blue-600"
          iconBgColor="bg-blue-700"
        />
        <StatCard
          title="Valor Inventario"
          value="$0.00"
          secondaryValue={`Bs. ${(0 * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Coins}
          status="Sin productos en inventario"
          bgColor="bg-emerald-600"
          iconBgColor="bg-emerald-700"
        />
        <StatCard
          title="Movimientos del Mes"
          value="0"
          secondaryValue="Entradas y salidas"
          icon={TrendingUp}
          status="Diciembre 2024"
          bgColor="bg-violet-600"
          iconBgColor="bg-violet-700"
        />
      </div>

      {/* Chart and Movements */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <RecentMovements />
      </div>
    </PageTransition>
  );
};

export default Dashboard;
