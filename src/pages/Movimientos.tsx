import { ArrowLeftRight, Search, Calendar, Table2, Grid3x3, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle, Loader2, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { useMovements } from '@/contexts/MovementsContext';
import { useProduct } from '@/contexts/ProductContext';
import { toast } from 'sonner';
import type { InsertMovimiento } from '@/types/database.types';

const typeConfig = {
  entrada: { label: 'Entrada', icon: ArrowDownCircle, className: 'bg-success/10 text-success', bgColor: 'bg-green-500', iconBg: 'bg-green-600' },
  salida: { label: 'Salida', icon: ArrowUpCircle, className: 'bg-info/10 text-info', bgColor: 'bg-blue-500', iconBg: 'bg-blue-600' },
  ajuste: { label: 'Ajuste', icon: RefreshCw, className: 'bg-warning/10 text-warning', bgColor: 'bg-amber-500', iconBg: 'bg-amber-600' },
  transferencia: { label: 'Transferencia', icon: ArrowLeftRight, className: 'bg-purple/10 text-purple', bgColor: 'bg-purple-500', iconBg: 'bg-purple-600' },
};

const Movimientos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InsertMovimiento>>({
    tipo: 'entrada',
    tipo_inventario: 'general',
    cantidad: 1,
    unidad: 'unidades',
    motivo: '',
    notas: '',
    referencia: 'MANUAL'
  });

  const { movements, loading, error, statistics, refreshMovements, createMovement, updateMovement, deleteMovement } = useMovements();
  const { products } = useProduct();

  // Actualizar título del header
  useEffect(() => {
    const headerTitle = document.querySelector('header h2');
    if (headerTitle) {
      headerTitle.textContent = 'Movimientos';
    }
  }, []);

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    const matchesDate = !dateFilter || movement.date === dateFilter;
    return matchesSearch && matchesType && matchesDate;
  });

  const handleOpenModal = (movementId?: string) => {
    if (movementId) {
      const movement = movements.find(m => m.id === movementId);
      if (movement) {
        setEditingMovement(movementId);
        // Encontrar el ID del producto basado en el nombre (not ideal but works with current structure)
        const product = products.find(p => p.name === movement.product);
        
        setFormData({
          producto_id: product?.id || '',
          tipo: movement.type,
          tipo_inventario: 'general', // Asumimos general por ahora
          cantidad: movement.quantity,
          unidad: movement.unit,
          motivo: movement.reason,
          notas: '', // No tenemos notas en la interfaz Movement actual
          referencia: 'MANUAL'
        });
      }
    } else {
      setEditingMovement(null);
      setFormData({
        tipo: 'entrada',
        tipo_inventario: 'general',
        cantidad: 1,
        unidad: 'unidades',
        motivo: '',
        notas: '',
        referencia: 'MANUAL'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovement(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.producto_id) {
        toast.error('Selecciona un producto');
        return;
      }

      if (editingMovement) {
          await updateMovement(editingMovement, formData);
      } else {
          // Aseguramos que data necesaria esté presente
          await createMovement(formData as InsertMovimiento);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      await deleteMovement(id);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-green-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Entradas Hoy</p>
            <div className="p-2 bg-green-600 rounded-full flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{statistics.todayEntries}</p>
        </div>
        <div className="bg-blue-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Salidas Hoy</p>
            <div className="p-2 bg-blue-600 rounded-full flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{statistics.todayExits}</p>
        </div>
        <div className="bg-rose-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Ajustes Hoy</p>
            <div className="p-2 bg-amber-600 rounded-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{statistics.todayAdjustments}</p>
        </div>
        <div className="bg-purple-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Transferencias Hoy</p>
            <div className="p-2 bg-purple-600 rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{statistics.todayTransfers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-center">
          {/* Search */}
          <div className="relative flex-1 lg:flex-none lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:gap-4 lg:items-center">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select-category flex-1 lg:w-40"
            >
              <option value="all">Todos los tipos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
              <option value="ajuste">Ajustes</option>
              <option value="merma">Mermas</option>
            </select>

            {/* Date Filter */}
            <div className="relative flex-1 lg:w-40">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background w-full"
              />
            </div>

            <div className="flex gap-2 lg:ml-auto">
              {/* View Toggles */}
              <div className="flex flex-1 sm:flex-none gap-2 border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-blue-500 text-white'
                      : 'bg-background text-foreground hover:bg-secondary'
                  }`}
                  title="Ver Tabla"
                >
                  <Table2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Tabla</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'cards'
                      ? 'bg-blue-500 text-white'
                      : 'bg-background text-foreground hover:bg-secondary'
                  }`}
                  title="Ver Tarjetas"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden xl:inline">Tarjetas</span>
                </button>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="button flex-1 sm:flex-none whitespace-nowrap lg:px-4"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Movimiento</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movements View */}
      {viewMode === 'table' ? (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#222] text-white text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium text-center">Fecha/Hora</th>
                  <th className="p-4 font-medium text-center">Producto</th>
                  <th className="p-4 font-medium text-center">Tipo</th>
                  <th className="p-4 font-medium text-center">Cantidad</th>
                  <th className="p-4 font-medium text-center">Razón</th>
                  <th className="p-4 font-medium text-center">Usuario</th>
                  <th className="p-4 font-medium text-center">Referencia</th>
                  <th className="p-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-foreground divide-y divide-border">
                {filteredMovements.map((movement) => {
                  const config = typeConfig[movement.type];
                  return (
                    <tr key={movement.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 text-center">
                        <div>
                          <p className="font-medium">{movement.date}</p>
                          <p className="text-xs text-muted-foreground">{movement.time}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-center">{movement.product}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className={`p-4 font-bold text-center ${
                        movement.type === 'entrada' ? 'text-success' : 
                        movement.type === 'salida' || movement.type === 'transferencia' ? 'text-destructive' : 
                        'text-warning'
                      }`}>
                        {movement.type === 'entrada' ? '+' : movement.type === 'ajuste' && movement.quantity > 0 ? '+' : '-'}
                        {Math.abs(movement.quantity)} {movement.unit}
                      </td>
                      <td className="p-4 text-center text-muted-foreground">{movement.reason}</td>
                      <td className="p-4 text-center">{movement.user}</td>
                      <td className="p-4 text-center text-muted-foreground">
                        {movement.reference === 'MANUAL' ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">MANUAL</span>
                        ) : (
                            movement.reference || '-'
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {movement.reference === 'MANUAL' ? (
                            <>
                              <button
                                onClick={() => handleOpenModal(movement.id)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(movement.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Auto</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMovements.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No hay movimientos para mostrar
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovements.map((movement) => {
            const config = typeConfig[movement.type];
            const Icon = config.icon;
            return (
              <div key={movement.id} className="group bg-card border border-border/60 hover:border-primary/50 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${config.className} rounded-lg bg-opacity-10`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide border ${config.className} bg-transparent border-current opacity-70`}>
                          {config.label}
                        </span>
                        {movement.reference === 'MANUAL' && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800">
                                MANUAL
                            </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mt-0.5">{movement.product}</h3>
                    </div>
                  </div>
                    {movement.reference === 'MANUAL' && (
                        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleOpenModal(movement.id)}
                                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(movement.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-lg">
                    <span className="text-xs text-muted-foreground font-medium">Cantidad</span>
                    <span className={`text-base font-bold ${
                      movement.type === 'entrada' ? 'text-success' : 
                      movement.type === 'salida' || movement.type === 'transferencia' ? 'text-destructive' : 
                      'text-warning'
                    }`}>
                      {movement.type === 'entrada' ? '+' : movement.type === 'ajuste' && movement.quantity > 0 ? '+' : ''}
                      {movement.quantity} <span className="text-xs font-normal text-muted-foreground">{movement.unit}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2 flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Razón</span>
                      <span className="text-foreground font-medium">{movement.reason}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                       <Calendar className="w-3.5 h-3.5" />
                       <span>{movement.date}</span>
                    </div>
                     <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                       <time>{movement.time}</time>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-border/50">
                    <span className="text-muted-foreground">Por: <span className="text-foreground font-medium">{movement.user}</span></span>
                    {movement.reference && movement.reference !== 'MANUAL' && (
                      <span className="text-muted-foreground bg-secondary px-1.5 py-0.5 rounded text-[10px]">{movement.reference}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredMovements.length === 0 && viewMode === 'cards' && (
        <div className="bg-card rounded-xl shadow-sm p-8 text-center text-muted-foreground">
          No hay movimientos para mostrar
        </div>
      )}
      
      {/* Modal de Crear/Editar Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <h3 className="font-bold text-lg">
                {editingMovement ? 'Editar Movimiento' : 'Nuevo Movimiento'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Producto</label>
                <select
                  required
                  className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                  value={formData.producto_id || ''}
                  onChange={e => {
                      const product = products.find(p => p.id === e.target.value);
                      setFormData(prev => ({ 
                          ...prev, 
                          producto_id: e.target.value,
                          unidad: product?.unit || 'unidades'
                      }))
                  }}
                  disabled={!!editingMovement} // No permitir cambiar producto en edición para simplificar
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    required
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                    value={formData.tipo}
                    onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                    <option value="ajuste">Ajuste</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                        value={formData.cantidad}
                        onChange={e => setFormData(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
                      />
                      <span className="text-xs text-muted-foreground w-12 truncate">{formData.unidad}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra local, Merma, Ajuste de inventario..."
                  className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                  value={formData.motivo || ''}
                  onChange={e => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (Opcional)</label>
                <textarea
                  className="w-full p-2 border border-border rounded-lg bg-background text-sm min-h-[80px]"
                  value={formData.notas || ''}
                  onChange={e => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
};

export default Movimientos;
