
import { Download, Calendar, Package, AlertTriangle, AlertCircle, Layers, Activity, FileText, FileSpreadsheet, FileDown, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import PageTransition from '@/components/layout/PageTransition';
import { useReports } from '@/contexts/ReportsContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { ReportPeriod } from '@/contexts/ReportsContext';

const Reportes = () => {
  const { reportData, loading, currentPeriod, setDateRange, exportToPDF, exportToExcel, exportToCSV, exporting } = useReports();
  const { rate, convert, formatBs } = useExchangeRate();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value as ReportPeriod);
  };

  const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
    setExportMenuOpen(false);
    if (type === 'pdf') await exportToPDF();
    if (type === 'excel') await exportToExcel();
    if (type === 'csv') await exportToCSV();
  };

  // Formatear valores en USD (los precios ya están en USD)
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Convertir USD a VES (multiplicar por la tasa, no dividir)
  const convertToVES = (usdAmount: number) => {
    if (rate === 0) return 0;
    return usdAmount * rate;
  };

  // Formatear valores en VES
  const formatVES = (value: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            Reportes Avanzados
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Visión general del rendimiento de tu inventario</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select 
              value={currentPeriod}
              onChange={handlePeriodChange}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="daily">Últimas 24 horas</option>
              <option value="weekly">Últimos 7 días</option>
              <option value="biweekly">Últimos 15 días</option>
              <option value="monthly">Últimos 30 días</option>
              <option value="quarterly">Últimos 90 días</option>
              <option value="annual">Último año</option>
            </select>
          </div>
          
          {/* Export Button with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={exporting || loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exportar
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
            
            {exportMenuOpen && !exporting && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 text-sm"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium">Exportar como PDF</div>
                    <div className="text-xs text-muted-foreground">Reporte visual completo</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 text-sm border-t border-border"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">Exportar como Excel</div>
                    <div className="text-xs text-muted-foreground">Datos en hojas de cálculo</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 text-sm border-t border-border"
                >
                  <FileDown className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Exportar como CSV</div>
                    <div className="text-xs text-muted-foreground">Formato universal</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Valor Inventario - USD con VES debajo */}
            <div className="bg-blue-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Valor Inventario</p>
                <div className="p-2 bg-blue-600 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              {/* El valor ya está en USD, solo formatearlo */}
              <p className="text-2xl font-bold text-white">{formatUSD(reportData.kpis.inventoryValue)}</p>
              {/* Convertir USD a VES multiplicando por la tasa */}
              <p className="text-xs text-white/70 mt-1">{formatVES(convertToVES(reportData.kpis.inventoryValue))}</p>
              <p className="text-xs text-white/80 mt-2">{reportData.kpis.inventoryValue > 0 ? 'Actualizado' : 'Sin datos'}</p>
            </div>

            {/* Pérdidas - USD con VES debajo */}
            <div className="bg-rose-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-white/90 uppercase tracking-wide">
                  Pérdidas ({currentPeriod === 'daily' ? 'Hoy' : 'Período'})
                </p>
                <div className="p-2 bg-rose-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              {/* El valor ya está en USD, solo formatearlo */}
              <p className="text-2xl font-bold text-white">{formatUSD(reportData.kpis.periodLosses)}</p>
              {/* Convertir USD a VES multiplicando por la tasa */}
              <p className="text-xs text-white/70 mt-1">{formatVES(convertToVES(reportData.kpis.periodLosses))}</p>
              <p className="text-xs text-white/80 mt-2">{reportData.kpis.periodLosses > 0 ? 'Con pérdidas' : 'Sin pérdidas'}</p>
            </div>

            <StatCard
              title="Productos Activos"
              value={reportData.kpis.activeProducts.toString()}
              icon={Layers}
              bgColor="bg-emerald-500"
              iconBgColor="bg-emerald-600"
              status={reportData.kpis.activeProducts > 0 ? 'En inventario' : 'Sin productos'}
            />
            <StatCard
              title="Alertas Stock"
              value={reportData.kpis.stockAlerts.toString()}
              icon={AlertCircle}
              bgColor="bg-amber-500"
              iconBgColor="bg-amber-600"
              status={reportData.kpis.stockAlerts > 0 ? 'Requiere atención' : 'Sin alertas'}
            />
          </div>



          {/* Critical Stock Full Width */}
          {reportData.criticalStock.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="bg-destructive/5 p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <AlertCircle className="w-5 h-5 text-destructive" />
                   <h3 className="font-bold text-foreground text-lg">Alertas de Stock Crítico</h3>
                </div>
                <span className="text-xs font-semibold bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                  {reportData.criticalStock.length} items
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportData.criticalStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-background border border-border/50 rounded-lg hover:border-destructive/30 transition-colors"
                  >
                    <div className={`p-2 rounded-full shrink-0 ${item.status === 'out' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {item.stock} {item.unit}
                        <span className="font-normal opacity-70 ml-1">
                          ({item.status === 'out' ? 'Agotado' : 'Bajo'})
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </PageTransition>
  );
};

export default Reportes;
