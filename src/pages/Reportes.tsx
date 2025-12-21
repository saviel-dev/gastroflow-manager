import { Download, Calendar, Package, AlertTriangle, AlertCircle, TrendingUp, Layers, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import RecentMovements from '@/components/dashboard/RecentMovements';
import PageTransition from '@/components/layout/PageTransition';

const inventoryData: any[] = [];

const movementDistribution: any[] = [];

const topProducts: any[] = [];

const criticalStock: any[] = [];

const Reportes = () => {
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
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none cursor-pointer">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
              <option>Este mes</option>
              <option>Este año</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Valor Inventario"
          value="$0"
          icon={Package}
          bgColor="bg-blue-500"
          iconBgColor="bg-blue-600"
          status="Sin datos"
        />
        <StatCard
          title="Pérdidas (Mes)"
          value="$0"
          icon={AlertTriangle}
          bgColor="bg-rose-500"
          iconBgColor="bg-rose-600"
          status="Sin datos"
        />
        <StatCard
          title="Productos Activos"
          value="0"
          icon={Layers}
          bgColor="bg-emerald-500"
          iconBgColor="bg-emerald-600"
          status="Sin productos"
        />
        <StatCard
          title="Alertas Stock"
          value="0"
          icon={AlertCircle}
          bgColor="bg-amber-500"
          iconBgColor="bg-amber-600"
          status="Sin alertas"
        />
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Value Trend */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/5">
            <div>
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tendencia de Valor
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Comportamiento del valor total en los últimos 7 días</p>
            </div>
            <div className="flex gap-2">
                 <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">+12.5% vs semana anterior</span>
            </div>
          </div>
          <div className="p-6 h-[350px] flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 11 }} 
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Valor']}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  fillOpacity={1} 
                  fill="url(#colorValor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Movement Distribution Pie Chart */}
        <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/50 bg-muted/5">
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Distribución
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Entradas vs Salidas vs Mermas</p>
          </div>
          <div className="p-6 h-[350px] flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movementDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                  startAngle={90}
                  endAngle={-270}
                >
                  {movementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                   }}
                   itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-muted-foreground font-medium ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
              <span className="text-3xl font-bold block text-foreground tracking-tight">100%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Products Bar Chart */}
        <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden flex flex-col">
           <div className="p-5 border-b border-border/50 bg-muted/5">
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Top Productos
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Items con mayor movimiento este mes</p>
          </div>
          <div className="p-6 h-[380px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProducts}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                barSize={32}
              >
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={90} 
                    tick={{fontSize: 12, fill: '#888', fontWeight: 500}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value) => [`${value} unidades`, 'Ventas']}
                />
                <Bar dataKey="ventas" radius={[0, 6, 6, 0]}>
                    {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#f59e0b' : '#fbbf24'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Movements (Takes up 2 columns) */}
        <div className="lg:col-span-2">
           <RecentMovements />
        </div>
      </div>

        {/* Critical Stock Full Width */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="bg-destructive/5 p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-destructive" />
               <h3 className="font-bold text-foreground text-lg">Alertas de Stock Crítico</h3>
            </div>
            <span className="text-xs font-semibold bg-destructive/10 text-destructive px-2 py-1 rounded-full">
              {criticalStock.length} items
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {criticalStock.map((item) => (
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
      </div>
    </PageTransition>
  );
};

export default Reportes;
