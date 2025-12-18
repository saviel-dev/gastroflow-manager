import { MoreVertical, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  status: 'available' | 'low' | 'medium';
}

const products: Product[] = [
  { id: '#001', name: 'Queso Cheddar', category: 'Ingredientes', stock: 45.0, unit: 'Kg', status: 'available' },
  { id: '#002', name: 'Salsa de Tomate', category: 'Salsas', stock: 2.5, unit: 'Litros', status: 'low' },
  { id: '#003', name: 'Coca Cola', category: 'Bebidas', stock: 120, unit: 'Unidades', status: 'available' },
  { id: '#004', name: 'Pan de Hamburguesa', category: 'Panadería', stock: 50, unit: 'Paquetes', status: 'medium' },
];

const statusConfig = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success' },
  low: { label: 'Bajo Stock', className: 'bg-destructive/10 text-destructive' },
  medium: { label: 'Medio', className: 'bg-warning/10 text-warning' },
};

const InventoryTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-bold text-foreground text-lg">Inventario General</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
          <button className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary text-muted-foreground text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Unidad</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="text-sm text-foreground divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                <td className="p-4 font-medium text-muted-foreground">{product.id}</td>
                <td className="p-4 font-semibold">{product.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-secondary rounded text-xs">{product.category}</span>
                </td>
                <td className={`p-4 font-bold ${product.status === 'low' ? 'text-destructive' : ''}`}>
                  {product.stock}
                </td>
                <td className="p-4 text-muted-foreground">{product.unit}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[product.status].className}`}>
                    {statusConfig[product.status].label}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-muted-foreground hover:text-primary">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-border flex justify-center md:justify-end">
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">Anterior</button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">1</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">2</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">3</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
