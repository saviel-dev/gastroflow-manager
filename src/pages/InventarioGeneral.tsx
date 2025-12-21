import { Package, Plus, Search, MoreVertical, Download, Box, DollarSign, AlertTriangle, FolderOpen, Table2, Grid3x3, Edit, Trash2, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useProduct, Product } from '@/contexts/ProductContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";




// Initial products moved to context


const statusConfig = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success' },
  low: { label: 'Bajo Stock', className: 'bg-destructive/10 text-destructive' },
  medium: { label: 'Medio', className: 'bg-warning/10 text-warning' },
  out: { label: 'Agotado', className: 'bg-muted text-muted-foreground' },
};

const InventarioGeneral = () => {
  const { rate, lastUpdated, convert, formatBs, isLoading: isLoadingRate } = useExchangeRate();
  const { products, addProduct } = useProduct();
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    stock: 0,
    unit: 'Unidades',
    minStock: 0,
    price: 0,
    status: 'available'
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    const product: Product = {
      id: `#${(products.length + 1).toString().padStart(3, '0')}`,
      name: newProduct.name || '',
      category: newProduct.category || 'General',
      stock: newProduct.stock || 0,
      unit: newProduct.unit || 'Unidades',
      minStock: newProduct.minStock || 0,
      price: newProduct.price || 0,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop' // Placeholder
    };

    addProduct(product);
    setIsAddProductOpen(false);

    setNewProduct({
      name: '',
      category: '',
      stock: 0,
      unit: 'Unidades',
      minStock: 0,
      price: 0,
      status: 'available'
    });
    toast.success("Producto agregado correctamente");
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const lowStockCount = products.filter(p => p.status === 'low' || p.status === 'out').length;

  return (
    <PageTransition>
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
            <button type="button" className="button-export">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <Button onClick={() => setIsAddProductOpen(true)} className="button">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Total Productos</p>
              <div className="p-2 bg-blue-600 rounded-full flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
          <div className="bg-cyan-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Valor Total</p>
              <div className="p-2 bg-cyan-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-rose-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Bajo Stock</p>
              <div className="p-2 bg-rose-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{lowStockCount}</p>
          </div>
          <div className="bg-green-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Categorías</p>
              <div className="p-2 bg-green-600 rounded-full flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl shadow-sm p-4">
          <div className="flex flex-col gap-4">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-category flex-1"
              >
                <option value="all">Todas las categorías</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex gap-2 border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-blue-500 text-white'
                      : 'bg-background text-foreground hover:bg-secondary'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Tabla</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'cards'
                      ? 'bg-blue-500 text-white'
                      : 'bg-background text-foreground hover:bg-secondary'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table or Cards View */}
        {viewMode === 'table' ? (
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222] text-white text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium text-center">ID</th>
                    <th className="p-4 font-medium text-center">Producto</th>
                    <th className="p-4 font-medium text-center">Categoría</th>
                    <th className="p-4 font-medium text-center">Stock</th>
                    <th className="p-4 font-medium text-center">Min. Stock</th>
                    <th className="p-4 font-medium text-center">Precio Unit.</th>
                    <th className="p-4 font-medium text-center">Estado</th>
                    <th className="p-4 font-medium text-center">Acciones</th>
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
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">${product.price}</span>
                          <span className="text-xs text-muted-foreground">{formatBs(convert(product.price))}</span>
                        </div>
                      </td>
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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {/* Actions Menu */}
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-foreground hover:bg-white transition-colors shadow-md"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === product.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border z-20 overflow-hidden">
                            <button
                              onClick={() => {
                                console.log('Ver detalles:', product.id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                              <span>Ver detalles</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log('Editar:', product.id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                            >
                              <Edit className="w-4 h-4 text-green-500" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log('Eliminar:', product.id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-3 border-t border-border"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground font-medium">{product.id}</p>
                      <h3 className="text-lg font-semibold text-foreground mt-1 line-clamp-1">{product.name}</h3>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Categoría</span>
                        <span className="text-sm font-medium text-foreground">{product.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stock</span>
                        <span className={`text-sm font-bold ${product.status === 'low' || product.status === 'out' ? 'text-destructive' : 'text-foreground'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Min. Stock</span>
                        <span className="text-sm text-foreground">{product.minStock} {product.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Precio</span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-foreground">${product.price}</span>
                          <span className="text-xs text-muted-foreground">{formatBs(convert(product.price))}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">Estado</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[product.status].className}`}>
                          {statusConfig[product.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-6 bg-card rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center">
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
          </>
        )}
      </div>
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completa los detalles para agregar un nuevo producto al inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Input
                id="category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio ($)
              </Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unidad
              </Label>
               <Select onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })} defaultValue={newProduct.unit}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unidades">Unidades</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Litros">Litros</SelectItem>
                  <SelectItem value="Paquetes">Paquetes</SelectItem>
                  <SelectItem value="Bolsas">Bolsas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStock" className="text-right">
                Min. Stock
              </Label>
              <Input
                id="minStock"
                type="number"
                value={newProduct.minStock}
                onChange={(e) => setNewProduct({ ...newProduct, minStock: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAddProductOpen(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleAddProduct}>Guardar Producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default InventarioGeneral;
