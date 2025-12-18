import { useState } from 'react';
import { DollarSign, AlertTriangle, Warehouse, Clock, TrendingUp } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentMovements from '@/components/dashboard/RecentMovements';
import InventoryTable from '@/components/dashboard/InventoryTable';
import FloatingActionButton from '@/components/dashboard/FloatingActionButton';
import QuickActionModal from '@/components/dashboard/QuickActionModal';

const Dashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ventas Hoy"
          value="$1,240.50"
          icon={DollarSign}
          trend={{ value: '+12% vs ayer', positive: true }}
          borderColor="border-primary"
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Bajo Stock"
          value="8 Productos"
          icon={AlertTriangle}
          status="Requiere atención"
          borderColor="border-destructive"
          iconBgColor="bg-destructive/10"
          iconColor="text-destructive"
        />
        <StatCard
          title="Valor Inventario"
          value="$15,430"
          icon={Warehouse}
          status="Actualizado hace 1h"
          borderColor="border-info"
          iconBgColor="bg-info/10"
          iconColor="text-info"
        />
        <StatCard
          title="Órdenes Pendientes"
          value="12"
          icon={Clock}
          status="Cocina activa"
          borderColor="border-warning"
          iconBgColor="bg-warning/10"
          iconColor="text-warning"
        />
      </div>

      {/* Chart and Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <RecentMovements />
      </div>

      {/* Inventory Table */}
      <div className="mb-20">
        <InventoryTable />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setModalOpen(true)} />

      {/* Quick Action Modal */}
      <QuickActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Dashboard;
