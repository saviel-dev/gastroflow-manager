import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Movimiento } from '@/types/database.types';

interface RecentMovementsProps {
  customData?: Movimiento[];
}

const RecentMovements = ({ customData = [] }: RecentMovementsProps) => {
  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="bg-[#222] p-4 border-b border-border">
        <h3 className="font-bold text-white text-lg">Últimos Movimientos</h3>
      </div>
      <div className="p-6">
        {customData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customData.map((movement, index) => {
              const isEntry = movement.tipo === 'entrada' || (movement.tipo === 'ajuste' && movement.cantidad > 0);
              const formattedDate = new Date(movement.fecha_movimiento).toLocaleString('es-VE');
              
              return (
                <div
                  key={movement.id}
                  className={`flex items-center justify-between ${
                    index < customData.length - 1 ? 'pb-3 border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isEntry ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {isEntry ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {/* Note: product name is not in Movimiento, ideally fetched or joined. 
                            For now we might show ID or handle in service. 
                            Wait, DashboardService fetched recent movements but names are relational.
                            Let's assume we display basic info first.
                            Actually Movimiento table has producto_id but not name.
                            For dashboard speed, we might not fetch all names individually.
                            Let's check if we can join in service or just display basic info.
                         */}
                         Movimiento #{movement.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {movement.tipo} • {formattedDate}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${isEntry ? 'text-success' : 'text-destructive'}`}>
                    {isEntry ? '+' : '-'}{Math.abs(movement.cantidad)} {movement.unidad}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentMovements;
