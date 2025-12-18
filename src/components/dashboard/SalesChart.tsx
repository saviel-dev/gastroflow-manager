import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { day: 'Lun', ventas: 850 },
  { day: 'Mar', ventas: 920 },
  { day: 'Mié', ventas: 780 },
  { day: 'Jue', ventas: 1240 },
  { day: 'Vie', ventas: 1500 },
  { day: 'Sáb', ventas: 1850 },
  { day: 'Dom', ventas: 1600 },
];

const SalesChart = () => {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-foreground text-lg">Ventas de la Semana</h3>
        <button className="text-sm text-primary hover:underline font-medium">
          Ver reporte completo
        </button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--brand-dark))',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
              }}
              formatter={(value) => [`$${value}`, 'Ventas']}
            />
            <Bar 
              dataKey="ventas" 
              fill="hsl(var(--primary))" 
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
