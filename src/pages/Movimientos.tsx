import { ArrowLeftRight, ArrowDown, ArrowUp, Plus, Search, Filter, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Movement {
  id: string;
  date: string;
  time: string;
  product: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'merma';
  quantity: number;
  unit: string;
  reason: string;
  user: string;
  reference?: string;
}

const movements: Movement[] = [
  { id: 'M001', date: '2024-01-18', time: '10:30', product: 'Harina de Trigo', type: 'entrada', quantity: 50, unit: 'Kg', reason: 'Compra a proveedor', user: 'Carlos Admin', reference: 'OC-2024-001' },
  { id: 'M002', date: '2024-01-18', time: '11:15', product: 'Coca Cola 355ml', type: 'salida', quantity: 12, unit: 'Unidades', reason: 'Venta', user: 'María Cajera', reference: 'V-2024-089' },
  { id: 'M003', date: '2024-01-18', time: '11:45', product: 'Queso Mozzarella', type: 'merma', quantity: 2, unit: 'Kg', reason: 'Producto vencido', user: 'Carlos Admin' },
  { id: 'M004', date: '2024-01-18', time: '12:00', product: 'Tomates Frescos', type: 'entrada', quantity: 10, unit: 'Kg', reason: 'Compra a proveedor', user: 'Carlos Admin', reference: 'OC-2024-002' },
  { id: 'M005', date: '2024-01-18', time: '13:30', product: 'Aceite Vegetal', type: 'ajuste', quantity: -3, unit: 'Litros', reason: 'Ajuste de inventario', user: 'Carlos Admin' },
  { id: 'M006', date: '2024-01-17', time: '09:00', product: 'Carne de Res', type: 'entrada', quantity: 30, unit: 'Kg', reason: 'Compra a proveedor', user: 'Carlos Admin', reference: 'OC-2024-003' },
  { id: 'M007', date: '2024-01-17', time: '14:20', product: 'Pan de Hamburguesa', type: 'salida', quantity: 24, unit: 'Paquetes', reason: 'Producción', user: 'Chef Pedro' },
  { id: 'M008', date: '2024-01-17', time: '16:45', product: 'Lechuga Fresca', type: 'merma', quantity: 1.5, unit: 'Kg', reason: 'Deterioro', user: 'Chef Pedro' },
];

const typeConfig = {
  entrada: { label: 'Entrada', icon: ArrowDown, className: 'bg-success/10 text-success', iconBg: 'bg-success/10' },
  salida: { label: 'Salida', icon: ArrowUp, className: 'bg-info/10 text-info', iconBg: 'bg-info/10' },
  ajuste: { label: 'Ajuste', icon: ArrowLeftRight, className: 'bg-warning/10 text-warning', iconBg: 'bg-warning/10' },
  merma: { label: 'Merma', icon: ArrowUp, className: 'bg-destructive/10 text-destructive', iconBg: 'bg-destructive/10' },
};

const Movimientos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    const matchesDate = !dateFilter || movement.date === dateFilter;
    return matchesSearch && matchesType && matchesDate;
  });

  const todayEntries = movements.filter(m => m.date === '2024-01-18' && m.type === 'entrada').length;
  const todayExits = movements.filter(m => m.date === '2024-01-18' && m.type === 'salida').length;
  const todayAdjustments = movements.filter(m => m.date === '2024-01-18' && (m.type === 'ajuste' || m.type === 'merma')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-primary" />
            Movimientos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Registro de entradas, salidas y ajustes de inventario</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Movimiento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-success">
          <p className="text-xs text-muted-foreground uppercase">Entradas Hoy</p>
          <p className="text-2xl font-bold text-success">{todayEntries}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-info">
          <p className="text-xs text-muted-foreground uppercase">Salidas Hoy</p>
          <p className="text-2xl font-bold text-info">{todayExits}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-warning">
          <p className="text-xs text-muted-foreground uppercase">Ajustes/Mermas Hoy</p>
          <p className="text-2xl font-bold text-warning">{todayAdjustments}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-primary">
          <p className="text-xs text-muted-foreground uppercase">Total Movimientos</p>
          <p className="text-2xl font-bold text-foreground">{movements.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          >
            <option value="all">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="ajuste">Ajustes</option>
            <option value="merma">Mermas</option>
          </select>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Movements List */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {filteredMovements.map((movement) => {
            const config = typeConfig[movement.type];
            const Icon = config.icon;
            
            return (
              <div key={movement.id} className="p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.className.split(' ')[1]}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{movement.product}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.date} a las {movement.time} • {movement.reason}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${movement.type === 'entrada' ? 'text-success' : movement.type === 'salida' || movement.type === 'merma' ? 'text-destructive' : 'text-warning'}`}>
                      {movement.type === 'entrada' ? '+' : '-'}{Math.abs(movement.quantity)} {movement.unit}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className="mt-2 ml-14 flex gap-4 text-xs text-muted-foreground">
                  <span>Usuario: {movement.user}</span>
                  {movement.reference && <span>Ref: {movement.reference}</span>}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border flex justify-center">
          <button className="text-sm text-primary hover:underline font-medium">
            Cargar más movimientos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
