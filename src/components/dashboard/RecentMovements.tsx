import { ArrowDown, ArrowUp } from 'lucide-react';

const movements: any[] = [];

const RecentMovements = () => {
  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="bg-[#222] p-4 border-b border-border">
        <h3 className="font-bold text-white text-lg">Últimos Movimientos</h3>
      </div>
      <div className="p-6">
        {movements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default RecentMovements;
