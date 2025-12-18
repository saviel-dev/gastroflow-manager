import { ClipboardList, Search, Eye, Edit, History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  avgConsumption: number;
  lastEntry: string;
  lastExit: string;
  supplier: string;
  location: string;
  expirationDate?: string;
  trend: 'up' | 'down' | 'stable';
}

const productDetails: ProductDetail[] = [
  { 
    id: '#001', 
    name: 'Queso Cheddar', 
    category: 'Ingredientes', 
    currentStock: 45.0, 
    unit: 'Kg', 
    minStock: 10, 
    maxStock: 100,
    avgConsumption: 5.2,
    lastEntry: '2024-01-15',
    lastExit: '2024-01-18',
    supplier: 'Lácteos del Norte',
    location: 'Refrigerador A-1',
    expirationDate: '2024-02-15',
    trend: 'stable'
  },
  { 
    id: '#002', 
    name: 'Salsa de Tomate', 
    category: 'Salsas', 
    currentStock: 2.5, 
    unit: 'Litros', 
    minStock: 5, 
    maxStock: 30,
    avgConsumption: 3.1,
    lastEntry: '2024-01-10',
    lastExit: '2024-01-18',
    supplier: 'Condimentos Express',
    location: 'Almacén B-3',
    trend: 'down'
  },
  { 
    id: '#003', 
    name: 'Coca Cola 355ml', 
    category: 'Bebidas', 
    currentStock: 120, 
    unit: 'Unidades', 
    minStock: 50, 
    maxStock: 200,
    avgConsumption: 25,
    lastEntry: '2024-01-17',
    lastExit: '2024-01-18',
    supplier: 'Bebidas Universales',
    location: 'Refrigerador C-2',
    trend: 'up'
  },
  { 
    id: '#004', 
    name: 'Carne de Res Premium', 
    category: 'Carnes', 
    currentStock: 28.5, 
    unit: 'Kg', 
    minStock: 15, 
    maxStock: 50,
    avgConsumption: 8.3,
    lastEntry: '2024-01-18',
    lastExit: '2024-01-18',
    supplier: 'Carnes Selectas',
    location: 'Congelador D-1',
    expirationDate: '2024-01-25',
    trend: 'stable'
  },
];

const InventarioDetallado = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);

  const filteredProducts = productDetails.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getStockBarColor = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current <= min) return 'bg-destructive';
    if (percentage < 40) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary" />
            Inventario Detallado
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Análisis completo y métricas de cada producto</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar producto para ver detalles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-muted-foreground">{product.id}</span>
                  <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                  <span className="px-2 py-1 bg-secondary rounded text-xs">{product.category}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Stock actual</span>
                  <span className="font-bold text-foreground">{product.currentStock} {product.unit}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStockBarColor(product.currentStock, product.minStock, product.maxStock)} transition-all`}
                    style={{ width: `${getStockPercentage(product.currentStock, product.maxStock)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Mín: {product.minStock}</span>
                  <span>Máx: {product.maxStock}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Consumo promedio</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                    {product.avgConsumption} {product.unit}/día
                    {getTrendIcon(product.trend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Proveedor</p>
                  <p className="text-sm font-semibold text-foreground truncate">{product.supplier}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="text-sm font-semibold text-foreground">{product.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Última entrada</p>
                  <p className="text-sm font-semibold text-foreground">{product.lastEntry}</p>
                </div>
              </div>

              {product.expirationDate && (
                <div className="mt-4 p-2 bg-warning/10 rounded-lg">
                  <p className="text-xs text-warning font-medium">
                    ⚠️ Vencimiento: {product.expirationDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="bg-brand-dark p-4 flex justify-between items-center text-sidebar-foreground">
              <h3 className="font-bold">Detalle: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="hover:text-primary">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Stock Actual</p>
                  <p className="text-xl font-bold text-foreground">{selectedProduct.currentStock} {selectedProduct.unit}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Consumo Promedio</p>
                  <p className="text-xl font-bold text-foreground">{selectedProduct.avgConsumption} {selectedProduct.unit}/día</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">ID:</span> <span className="font-medium">{selectedProduct.id}</span></div>
                <div><span className="text-muted-foreground">Categoría:</span> <span className="font-medium">{selectedProduct.category}</span></div>
                <div><span className="text-muted-foreground">Stock Mínimo:</span> <span className="font-medium">{selectedProduct.minStock} {selectedProduct.unit}</span></div>
                <div><span className="text-muted-foreground">Stock Máximo:</span> <span className="font-medium">{selectedProduct.maxStock} {selectedProduct.unit}</span></div>
                <div><span className="text-muted-foreground">Proveedor:</span> <span className="font-medium">{selectedProduct.supplier}</span></div>
                <div><span className="text-muted-foreground">Ubicación:</span> <span className="font-medium">{selectedProduct.location}</span></div>
                <div><span className="text-muted-foreground">Última Entrada:</span> <span className="font-medium">{selectedProduct.lastEntry}</span></div>
                <div><span className="text-muted-foreground">Última Salida:</span> <span className="font-medium">{selectedProduct.lastExit}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioDetallado;
