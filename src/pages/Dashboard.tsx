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
          value="8 Productos"
          icon={AlertTriangle}
          status="Requiere atención"
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
          value="$15,430.00"
          icon={Coins}
          status="Actualizado hoy"
          bgColor="bg-emerald-600"
          iconBgColor="bg-emerald-700"
        />
        <StatCard
          title="Balance"
          value="$20,500.00"
          icon={Wallet}
          status="Ingasos vs Egresos"
          bgColor="bg-violet-600"
          iconBgColor="bg-violet-700"
          action={
            <select className="bg-white/20 border-none text-white text-xs rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50">
              <option value="daily" className="text-black">Diario</option>
              <option value="weekly" className="text-black">Semanal</option>
            </select>
          }
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
