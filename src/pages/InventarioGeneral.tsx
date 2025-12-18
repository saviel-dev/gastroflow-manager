import { Package, Plus, Search, SlidersHorizontal, MoreVertical, Download, Upload } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  price: number;
  status: 'available' | 'low' | 'medium' | 'out';
}

const products: Product[] = [
  { id: '#001', name: 'Queso Cheddar', category: 'Ingredientes', stock: 45.0, unit: 'Kg', minStock: 10, price: 120, status: 'available' },
  { id: '#002', name: 'Salsa de Tomate', category: 'Salsas', stock: 2.5, unit: 'Litros', minStock: 5, price: 35, status: 'low' },
  { id: '#003', name: 'Coca Cola 355ml', category: 'Bebidas', stock: 120, unit: 'Unidades', minStock: 50, price: 15, status: 'available' },
  { id: '#004', name: 'Pan de Hamburguesa', category: 'Panadería', stock: 50, unit: 'Paquetes', minStock: 30, price: 45, status: 'medium' },
  { id: '#005', name: 'Carne de Res', category: 'Carnes', stock: 0, unit: 'Kg', minStock: 20, price: 180, status: 'out' },
  { id: '#006', name: 'Lechuga Fresca', category: 'Vegetales', stock: 15, unit: 'Kg', minStock: 10, price: 25, status: 'available' },
  { id: '#007', name: 'Papas Fritas Congeladas', category: 'Congelados', stock: 8, unit: 'Bolsas', minStock: 15, price: 55, status: 'low' },
  { id: '#008', name: 'Aceite Vegetal', category: 'Aceites', stock: 25, unit: 'Litros', minStock: 10, price: 42, status: 'available' },
];

const statusConfig = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success' },
  low: { label: 'Bajo Stock', className: 'bg-destructive/10 text-destructive' },
  medium: { label: 'Medio', className: 'bg-warning/10 text-warning' },
  out: { label: 'Agotado', className: 'bg-muted text-muted-foreground' },
};

const InventarioGeneral = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const lowStockCount = products.filter(p => p.status === 'low' || p.status === 'out').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" />
            Inventario General
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión completa de productos y stock</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importar
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-primary">
          <p className="text-xs text-muted-foreground uppercase">Total Productos</p>
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-info">
          <p className="text-xs text-muted-foreground uppercase">Valor Total</p>
          <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-destructive">
          <p className="text-xs text-muted-foreground uppercase">Bajo Stock</p>
          <p className="text-2xl font-bold text-foreground">{lowStockCount}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-success">
          <p className="text-xs text-muted-foreground uppercase">Categorías</p>
          <p className="text-2xl font-bold text-foreground">{categories.length - 1}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          >
            <option value="all">Todas las categorías</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4" /> Más Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary text-muted-foreground text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Min. Stock</th>
                <th className="p-4 font-medium">Precio Unit.</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
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
                  <td className={`p-4 font-bold ${product.status === 'low' || product.status === 'out' ? 'text-destructive' : ''}`}>
                    {product.stock} {product.unit}
                  </td>
                  <td className="p-4 text-muted-foreground">{product.minStock} {product.unit}</td>
                  <td className="p-4">${product.price}</td>
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
        
        <div className="p-4 border-t border-border flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">Anterior</button>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">2</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventarioGeneral;
