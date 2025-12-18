import { ArrowDown, ArrowUp } from 'lucide-react';

const movements = [
  { id: 1, product: 'Harina de Trigo', type: 'entrada', time: '10:30 AM', amount: '+50 kg', positive: true },
  { id: 2, product: 'Coca Cola 355ml', type: 'Venta', time: '11:15 AM', amount: '-12 un', positive: false },
  { id: 3, product: 'Queso Mozzarella', type: 'Merma', time: '11:45 AM', amount: '-2 kg', positive: false },
  { id: 4, product: 'Tomates Frescos', type: 'Compra', time: '12:00 PM', amount: '+10 kg', positive: true },
];

const RecentMovements = () => {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <h3 className="font-bold text-foreground text-lg mb-4">Últimos Movimientos</h3>
      <div className="space-y-4">
        {movements.map((movement, index) => (
          <div
            key={movement.id}
            className={`flex items-center justify-between ${
              index < movements.length - 1 ? 'pb-3 border-b border-border' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  movement.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}
              >
                {movement.positive ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{movement.product}</p>
                <p className="text-xs text-muted-foreground">
                  {movement.type} • {movement.time}
                </p>
              </div>
            </div>
            <span className={`text-sm font-bold ${movement.positive ? 'text-success' : 'text-destructive'}`}>
              {movement.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMovements;
