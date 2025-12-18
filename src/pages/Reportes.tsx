import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const salesData = [
  { month: 'Ene', ventas: 12500 },
  { month: 'Feb', ventas: 14200 },
  { month: 'Mar', ventas: 11800 },
  { month: 'Abr', ventas: 15600 },
  { month: 'May', ventas: 17200 },
  { month: 'Jun', ventas: 16800 },
];

const inventoryData = [
  { day: 'Lun', valor: 15200 },
  { day: 'Mar', valor: 14800 },
  { day: 'Mié', valor: 15100 },
  { day: 'Jue', valor: 15430 },
  { day: 'Vie', valor: 15600 },
  { day: 'Sáb', valor: 15300 },
  { day: 'Dom', valor: 15450 },
];

const categoryData = [
  { name: 'Ingredientes', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Bebidas', value: 25, color: 'hsl(var(--info))' },
  { name: 'Carnes', value: 20, color: 'hsl(var(--destructive))' },
  { name: 'Vegetales', value: 12, color: 'hsl(var(--success))' },
  { name: 'Otros', value: 8, color: 'hsl(var(--warning))' },
];

const topProducts = [
  { name: 'Coca Cola 355ml', sales: 450, trend: 'up', percentage: 12 },
  { name: 'Hamburguesa Clásica', sales: 380, trend: 'up', percentage: 8 },
  { name: 'Papas Fritas', sales: 340, trend: 'stable', percentage: 0 },
  { name: 'Pizza Pepperoni', sales: 290, trend: 'down', percentage: -5 },
  { name: 'Agua Mineral', sales: 250, trend: 'up', percentage: 15 },
];

const Reportes = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            Reportes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
              <option>Este mes</option>
              <option>Este año</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Ventas del Mes</p>
              <p className="text-2xl font-bold text-foreground">$45,230</p>
            </div>
            <div className="p-2 bg-success/10 text-success rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% vs mes anterior
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Valor Inventario</p>
              <p className="text-2xl font-bold text-foreground">$15,430</p>
            </div>
            <div className="p-2 bg-info/10 text-info rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Actualizado hace 1h</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Margen Promedio</p>
              <p className="text-2xl font-bold text-foreground">32%</p>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2% vs mes anterior
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Mermas del Mes</p>
              <p className="text-2xl font-bold text-foreground">$890</p>
            </div>
            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> -5% vs mes anterior
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-foreground text-lg mb-4">Ventas Mensuales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value) => [`$${value}`, 'Ventas']}
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Value Chart */}
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-foreground text-lg mb-4">Valor de Inventario (Semana)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value) => [`$${value}`, 'Valor']}
                />
                <Line type="monotone" dataKey="valor" stroke="hsl(var(--info))" strokeWidth={3} dot={{ fill: 'hsl(var(--info))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-foreground text-lg mb-4">Distribución por Categoría</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((cat, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-medium text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="font-bold text-foreground text-lg mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{product.sales} unidades</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    product.trend === 'up' ? 'text-success' : product.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {product.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {product.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {product.percentage > 0 ? '+' : ''}{product.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
