import { ClipboardList, Search, Plus, Edit, Trash2, Folder, ChevronRight, X, Table2, Grid3x3, Save, List, Package, MoreVertical, Eye, Store, DollarSign, AlertTriangle, Box, Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageTransition from '@/components/layout/PageTransition';
import { useState, useEffect, useRef } from 'react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useProduct, Product } from '@/contexts/ProductContext';
import { useLocation, Location as BusinessLocation } from '@/contexts/LocationContext';
import { useDetailedInventory } from '@/contexts/DetailedInventoryContext';
import { toast } from 'sonner';

const statusConfig = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success' },
  low: { label: 'Bajo Stock', className: 'bg-destructive/10 text-destructive' },
  medium: { label: 'Medio', className: 'bg-warning/10 text-warning' },
  out: { label: 'Agotado', className: 'bg-muted text-muted-foreground' },
};

const InventarioDetallado = () => {
  const { rate, convert, formatBs } = useExchangeRate();
  const { products: generalProducts, loading: loadingGeneral } = useProduct();
  
  // Contexto de ubicaciones
  const { 
    locations, 
    loading: loadingLocations, 
    addLocation, 
    updateLocation, 
    deleteLocation 
  } = useLocation();
  
  // Contexto de inventario detallado
  const {
    getProductsByLocation,
    loadingByLocation,
    addProductToLocation,
    transferFromGeneral,
    updateProduct: updateDetailedProduct,
    deleteProduct: deleteDetailedProduct,
    refreshLocation,
    getProductCount
  } = useDetailedInventory();

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [locationViewMode, setLocationViewMode] = useState<'list' | 'cards'>('cards');
  const [editingLocation, setEditingLocation] = useState<any | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [locationFormData, setLocationFormData] = useState({ name: '' });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New state for selecting from general inventory
  const [selectedGeneralProductId, setSelectedGeneralProductId] = useState<string>('');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Auto-switch to cards on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
        setLocationViewMode('cards');
      }
    };

    // Check on mount
    handleResize();

    // Check on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    unit: '',
    status: 'available',
  });

  // Cargar productos cuando se selecciona una ubicación
  useEffect(() => {
    if (selectedLocation) {
      refreshLocation(selectedLocation);
    }
  }, [selectedLocation]); // Solo depende de selectedLocation, no de refreshLocation

  const currentProducts = selectedLocation ? getProductsByLocation(selectedLocation) : [];
  const categories = ['all', ...new Set(currentProducts.map(p => p.category))];

  const filteredProducts = currentProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Stats
  const totalLocations = locations.length;
  const totalProducts = currentProducts.length;
  const totalValue = currentProducts.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const lowStockCount = currentProducts.filter(p => p.status === 'low' || p.status === 'out').length;

  // Pagination Logic
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length);

  const handleAddProduct = async () => {
    if (!selectedLocation) return;
    
    if ((formData.stock || 0) <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    if ((formData.minStock || 0) <= 0) {
      toast.error("El stock mínimo debe ser mayor a 0");
      return;
    }

    try {
      // Logic for adding from General Inventory
      if (selectedGeneralProductId) {
        await transferFromGeneral(
          selectedLocation,
          selectedGeneralProductId,
          formData.stock || 0,
          formData.minStock || 0
        );
      } else {
        toast.error("Debe seleccionar un producto del inventario general");
        return;
      }

      setIsAddingProduct(false);
      setFormData({ name: '', category: '', unit: '', status: 'available' });
      setSelectedGeneralProductId('');
      setImagePreview(null);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    if (!selectedLocation) return;
    const locationName = locations.find(l => l.id === selectedLocation)?.name || 'Ubicación Desconocida';
    
    setExportMenuOpen(false);
    setExporting(true);
    try {
      const { generateDetailedProductListPDF, generateDetailedProductListExcel } = await import('@/utils/report-export.utils');
      
      if (type === 'pdf') {
        await generateDetailedProductListPDF(filteredProducts, locationName);
        toast.success("Reporte PDF generado exitosamente");
      } else {
        await generateDetailedProductListExcel(filteredProducts, locationName);
        toast.success("Reporte Excel generado exitosamente");
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error("Error al generar el reporte");
    } finally {
      setExporting(false);
    }
  };


  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, category: product.category, stock: product.stock, unit: product.unit, minStock: product.minStock, price: product.price, status: product.status });
    setImagePreview(product.image || null);
  };


  const handleUpdateProduct = async () => {
    if (!selectedLocation || !editingProduct) return;
    
    try {
      const updatedProduct: Product = {
        ...editingProduct,
        ...formData,
        image: imagePreview || editingProduct.image,
      } as Product;
      
      await updateDetailedProduct(selectedLocation, updatedProduct);
      
      setEditingProduct(null);
      setFormData({ name: '', category: '', unit: '', status: 'available' });
      setImagePreview(null);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDeleteProduct = async (productId: string) => {
    if (!selectedLocation) return;
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteDetailedProduct(selectedLocation, productId);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', unit: '', status: 'available' });
    setSelectedGeneralProductId('');
    setImagePreview(null);
  };


  // Actualizar título del header
  useEffect(() => {
    const headerTitle = document.querySelector('header h2');
    if (headerTitle) {
      if (selectedLocation) {
        const location = locations.find(l => l.id === selectedLocation);
        headerTitle.textContent = location ? location.name : 'Inventario Detallado';
      } else {
        headerTitle.textContent = 'Inventario Detallado';
      }
    }
  }, [selectedLocation, locations]);

  // Funciones CRUD para locations
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  const handleAddLocation = async () => {
    if (locationFormData.name.trim()) {
      try {
        await addLocation({ name: locationFormData.name });
        setIsAddingLocation(false);
        setLocationFormData({ name: '' });
      } catch (error) {
        console.error('Error al agregar ubicación:', error);
      }
    }
  };

  const handleEditLocation = (location: BusinessLocation) => {
    setEditingLocation(location);
    setLocationFormData({ name: location.name });
  };

  const handleUpdateLocation = async () => {
    if (editingLocation && locationFormData.name.trim()) {
      try {
        await updateLocation({ ...editingLocation, name: locationFormData.name });
        setEditingLocation(null);
        setLocationFormData({ name: '' });
      } catch (error) {
        console.error('Error al actualizar ubicación:', error);
      }
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este negocio? Se eliminarán todos sus productos.')) {
      try {
        await deleteLocation(locationId);
        if (selectedLocation === locationId) {
          setSelectedLocation(null);
        }
      } catch (error) {
        console.error('Error al eliminar ubicación:', error);
      }
    }
  };

  const handleCloseLocationForm = () => {
    setIsAddingLocation(false);
    setEditingLocation(null);
    setLocationFormData({ name: '' });
  };

  if (selectedLocation) {
    return (
      <PageTransition>
        <div className="space-y-6">
        {/* Header con botón de volver */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSelectedLocation(null)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 rotate-180" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-primary flex-shrink-0" />
                <span className="truncate">{locations.find(l => l.id === selectedLocation)?.name}</span>
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">Gestión de inventario</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto sm:self-end">
            <div className="relative">
              <button 
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={exporting || !selectedLocation}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-secondary transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-full text-foreground"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              
              {exportMenuOpen && !exporting && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 text-sm"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="font-medium">Exportar como PDF</div>
                      <div className="text-xs text-muted-foreground">Tabla dinámica</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 text-sm border-t border-border"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">Exportar como Excel</div>
                      <div className="text-xs text-muted-foreground">Datos completos</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              type="button"
              className="button"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Stats Cards (Only visible when location is selected) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{totalProducts}</h3>
                  <span className="text-xs text-muted-foreground">items</span>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</h3>
                  <span className="text-xs text-muted-foreground">{formatBs(convert(totalValue))}</span>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bajo Stock</p>
                 <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{lowStockCount}</h3>
                  <span className="text-xs text-muted-foreground">alertas</span>
                </div>
              </div>
            </div>
          </div>

        {/* Filters */}
        <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
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

        {/* Form Modal para Agregar/Editar */}
        {/* Form Modal para Agregar/Editar - Usando Portal para evitar problemas con PageTransition */}
        {(isAddingProduct || editingProduct) && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseForm} />
            <div className="relative bg-card rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-md max-h-[96vh] overflow-y-auto border border-border z-[10000]">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                <h2 className="text-base font-bold text-foreground">
                  {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                </h2>
                <button onClick={handleCloseForm} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Select General Product */}
                {!editingProduct && (
                  <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/50">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Inventario General</label>
                    <select
                        className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                        value={selectedGeneralProductId}
                        onChange={(e) => {
                            const pid = e.target.value;
                            setSelectedGeneralProductId(pid);
                            const gp = generalProducts.find(p => p.id === pid);
                            if (gp) {
                                setFormData({
                                    ...formData,
                                    name: gp.name,
                                    category: gp.category,
                                    unit: gp.unit,
                                    minStock: gp.minStock,
                                    price: gp.price,
                                    status: gp.status
                                });
                                setImagePreview(gp.image || null);
                            }
                        }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {generalProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.stock} {p.unit})</option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-foreground mb-0.5">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs bg-secondary/20 cursor-not-allowed"
                      value={formData.name || ''}
                      readOnly
                      disabled={!editingProduct}
                      placeholder="Salchicha"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-foreground mb-0.5">Categoría</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs bg-secondary/20 cursor-not-allowed"
                      value={formData.category || ''}
                      readOnly
                      disabled={!editingProduct}
                      placeholder="Embutidos"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-primary mb-0.5">Cantidad</label>
                    <input
                      type="number"
                      className={`w-full px-2.5 py-1.5 border-2 border-primary/20 rounded-md text-xs bg-background focus:border-primary focus:ring-0 ${(!editingProduct && !selectedGeneralProductId) ? 'bg-secondary/20 cursor-not-allowed opacity-50' : ''}`}
                      value={formData.stock ?? ''}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                      disabled={!editingProduct && !selectedGeneralProductId}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-foreground mb-0.5">Unidad</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs bg-secondary/20 cursor-not-allowed"
                      value={formData.unit || ''}
                      readOnly
                      disabled={!editingProduct}
                      placeholder="Unidades"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-foreground mb-0.5">Stock Mín.</label>
                    <input
                      type="number"
                      className={`w-full px-2.5 py-1.5 border border-border rounded-md text-xs bg-background ${(!editingProduct && !selectedGeneralProductId) ? 'bg-secondary/20 cursor-not-allowed opacity-50' : ''}`}
                      value={formData.minStock ?? ''}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                      disabled={!editingProduct && !selectedGeneralProductId}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-foreground mb-0.5">Precio</label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs bg-secondary/20 cursor-not-allowed"
                      value={formData.price ?? ''}
                      readOnly
                      disabled={!editingProduct}
                      placeholder="0"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-foreground mb-0.5">Estado</label>
                    <select
                      value={formData.status || 'available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                      disabled={!editingProduct}
                      className={`w-full px-2.5 py-1.5 border border-border rounded-md text-xs bg-background ${!editingProduct ? 'bg-secondary/20 cursor-not-allowed' : ''}`}
                    >
                      <option value="available">Disponible</option>
                      <option value="low">Bajo Stock</option>
                      <option value="medium">Medio</option>
                      <option value="out">Agotado</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Foto</label>
                  {(selectedGeneralProductId && imagePreview) ? (
                    // Mostrar imagen del producto seleccionado (no editable)
                    <div className="flex items-center gap-2.5 p-2.5 bg-secondary/30 rounded-md border border-border/50">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border-2 border-primary/20 bg-secondary/50 flex-shrink-0">
                        <img src={imagePreview} alt="Producto" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground">Imagen del inventario general</p>
                        <p className="text-xs font-medium text-foreground truncate">{formData.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       {(!editingProduct && !selectedGeneralProductId) ? (
                          <div className="p-2 text-xs text-muted-foreground text-center bg-secondary/20 rounded-md border border-dashed border-border">
                            Selecciona un producto para ver su imagen
                          </div>
                       ) : (
                          <div className="flex items-center gap-2.5">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 px-2.5 py-1.5 border border-dashed border-border rounded-md text-xs font-medium hover:bg-secondary transition-all flex items-center justify-center gap-1.5 group"
                            >
                              <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" /> 
                              <span className="text-muted-foreground group-hover:text-foreground">Subir Foto</span>
                            </button>
                            {imagePreview && (
                              <div className="relative w-12 h-12 rounded-md overflow-hidden border-2 border-primary/20 bg-secondary/50 flex-shrink-0">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setImagePreview(null)}
                                  className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                       )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
                <button
                  onClick={handleCloseForm}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="px-4 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-md hover:bg-orange-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingProduct ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Table or Cards View */}
        {viewMode === 'table' ? (
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222] text-white text-xs uppercase tracking-wider">
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
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-primary/5 transition-colors">
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
                      <td className="p-4 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setViewingProduct(product);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No hay productos para mostrar
              </div>
            )}
            
            {/* Pagination for Table */}
             <div className="p-4 border-t border-border flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredProducts.length > 0 ? startIndex + 1 : 0} - {endIndex} de {filteredProducts.length} productos
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-secondary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
                >
                  {/* Product Image */}
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
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
                  </div>
                    
                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-foreground hover:bg-white transition-colors shadow-md"
                    >
                      <MoreVertical className="w-4 h-4 cancel-drag" />
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
                              setViewingProduct(product);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span>Ver detalles</span>
                          </button>
                          <button
                            onClick={() => {
                              handleEditProduct(product);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                          >
                            <Edit className="w-4 h-4 text-green-500" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => {
                              setOpenDropdown(null);
                              handleDeleteProduct(product.id);
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

                  {/* Card Content */}
                  <div className="p-3">
                    {/* Header */}
                    <div className="mb-2">
                      <h3 className="text-base font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
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
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No hay productos para mostrar
              </div>
            )}

            {/* Pagination for Cards */}
            <div className="mt-6 bg-card rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredProducts.length > 0 ? startIndex + 1 : 0} - {endIndex} de {filteredProducts.length} productos
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-border rounded hover:bg-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        
         {/* View Details Modal */}
        <Dialog open={!!viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Detalles del Producto
              </DialogTitle>
              <DialogDescription>
                Información detallada del producto seleccionado.
              </DialogDescription>
            </DialogHeader>
            
            {viewingProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Image Section */}
                <div className="relative h-64 md:h-full bg-secondary/20 rounded-xl overflow-hidden border border-border">
                  {viewingProduct.image ? (
                    <img 
                      src={viewingProduct.image} 
                      alt={viewingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-muted-foreground">
                      <Package className="w-16 h-16 opacity-50" />
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusConfig[viewingProduct.status].className}`}>
                    {statusConfig[viewingProduct.status].label}
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{viewingProduct.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-secondary rounded text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {viewingProduct.category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/10 rounded-lg border border-border">
                      <span className="text-xs text-muted-foreground block mb-1">Stock Actual</span>
                      <div className={`text-lg font-bold ${viewingProduct.status === 'low' || viewingProduct.status === 'out' ? 'text-destructive' : 'text-foreground'}`}>
                        {viewingProduct.stock} <span className="text-xs font-normal text-muted-foreground">{viewingProduct.unit}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-lg border border-border">
                      <span className="text-xs text-muted-foreground block mb-1">Stock Mínimo</span>
                      <div className="text-lg font-semibold text-foreground">
                        {viewingProduct.minStock} <span className="text-xs font-normal text-muted-foreground">{viewingProduct.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="text-sm font-medium text-primary block mb-2">Precio de Venta</span>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">${viewingProduct.price}</span>
                        <span className="text-sm text-muted-foreground">USD</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">{formatBs(convert(viewingProduct.price))}</div>
                        <span className="text-xs text-muted-foreground">Bolívares</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions in Modal */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        handleEditProduct(viewingProduct);
                        setViewingProduct(null);
                      }}
                       className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors font-medium text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteProduct(viewingProduct.id);
                        setViewingProduct(null);
                      }}
                       className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors font-medium text-sm border border-destructive/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Filters y botón agregar */}
      <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center">
          <div className="relative flex-1 lg:flex-none lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar negocio..."
              value={locationSearchTerm}
              onChange={(e) => setLocationSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
          
          <div className="flex flex-1 gap-3 sm:gap-4 items-center">
            <button
              onClick={() => setIsAddingLocation(true)}
              type="button"
              className="button flex-1 lg:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Negocio</span>
            </button>

            <div className="flex gap-2 border border-border rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={() => setLocationViewMode('list')}
                className={`px-4 py-2 text-sm transition-colors flex items-center justify-center gap-2 ${
                  locationViewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-background text-foreground hover:bg-secondary'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setLocationViewMode('cards')}
                className={`px-4 py-2 text-sm transition-colors flex items-center justify-center gap-2 ${
                  locationViewMode === 'cards'
                    ? 'bg-blue-500 text-white'
                    : 'bg-background text-foreground hover:bg-secondary'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal para Agregar/Editar Location */}
      {(isAddingLocation || editingLocation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={handleCloseLocationForm} />
          <div className="relative bg-card rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editingLocation ? 'Editar Negocio' : 'Agregar Negocio'}
              </h2>
              <button onClick={handleCloseLocationForm} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre del Negocio</label>
              <input
                type="text"
                value={locationFormData.name}
                onChange={(e) => setLocationFormData({ name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                placeholder="Ej: Duarte Burguer"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCloseLocationForm}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingLocation ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location View */}
      {locationViewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLocations.map((location: BusinessLocation) => (
            <div
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
              className="group bg-card border border-border/60 hover:border-primary/50 hover:shadow-sm rounded-xl p-4 transition-all duration-300 cursor-pointer flex items-center gap-4"
            >
              <div className="p-2.5 bg-secondary group-hover:bg-primary/10 rounded-lg transition-colors shrink-0">
                <Store className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {location.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getProductCount(location.id)} productos
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLocation(location);
                   }}
                  className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocation(location.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#222] text-white text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium text-center">Negocio</th>
                  <th className="p-4 font-medium text-center">Productos</th>
                  <th className="p-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-foreground divide-y divide-border">
                {filteredLocations.map((location: BusinessLocation) => (
                  <tr key={location.id} className="hover:bg-primary/5 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedLocation(location.id)}
                        className="flex items-center gap-3 text-left hover:text-primary transition-colors"
                      >
                        <Folder className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{location.name}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {getProductCount(location.id)} productos
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLocations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No hay negocios para mostrar
            </div>
          )}
        </div>
      )}
    </div>
    </PageTransition>
  );
};

export default InventarioDetallado;
