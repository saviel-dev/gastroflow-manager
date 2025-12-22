
import React, { createContext, useContext, useState, useEffect } from 'react';
import { inventarioGeneralService } from '@/services/inventario-general.service';
import { movimientosService } from '@/services/movimientos.service';
import { useNotifications } from '@/contexts/NotificationContext';
import type { InventarioGeneral } from '@/types/database.types';
import { toast } from 'sonner';

// Mantener la interfaz Product para compatibilidad con componentes existentes
export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  price: number;
  status: 'available' | 'low' | 'medium' | 'out';
  image?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recordMovement: (productId: string, quantity: number, type: 'in' | 'out', motivo?: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Función helper para convertir de InventarioGeneral a Product
const mapToProduct = (item: InventarioGeneral): Product => {
  // Mapear estados de español a inglés
  const statusMap: Record<string, 'available' | 'low' | 'medium' | 'out'> = {
    'disponible': 'available',
    'bajo': 'low',
    'medio': 'medium',
    'agotado': 'out'
  };

  return {
    id: item.id,
    name: item.nombre,
    category: item.categoria,
    stock: item.stock,
    unit: item.unidad,
    minStock: item.stock_minimo,
    price: item.precio,
    status: statusMap[item.estado] || 'available',
    image: item.imagen_url,
  };
};

// Función helper para convertir de Product a InventarioGeneral (para crear/actualizar)
const mapFromProduct = (product: Omit<Product, 'id'>): Omit<InventarioGeneral, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> => {
  // Mapear estados de inglés a español
  const statusMap: Record<string, 'disponible' | 'bajo' | 'medio' | 'agotado'> = {
    'available': 'disponible',
    'low': 'bajo',
    'medium': 'medio',
    'out': 'agotado'
  };

  return {
    nombre: product.name,
    categoria: product.category,
    stock: product.stock,
    unidad: product.unit,
    stock_minimo: product.minStock,
    precio: product.price,
    estado: statusMap[product.status] || 'disponible',
    imagen_url: product.image,
    activo: true,
  };
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioGeneralService.obtenerTodos(true);
      const mappedProducts = data.map(mapToProduct);
      setProducts(mappedProducts);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMsg);
      console.error('Error al cargar productos:', err);
      // No mostrar toast en la carga inicial para no bloquear la UI
      setProducts([]); // Asegurar que products sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      setError(null);
      const newProductData = mapFromProduct(product);
      const createdProduct = await inventarioGeneralService.crear(newProductData);
      const mappedProduct = mapToProduct(createdProduct);
      setProducts([...products, mappedProduct]);
      toast.success(`Producto "${product.name}" agregado exitosamente`);
      addNotification('Nuevo Producto', `Se ha agregado "${product.name}" al inventario general`, 'exito');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agregar producto';
      setError(errorMsg);
      console.error('Error al agregar producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      setError(null);
      
      // Mapear estado de inglés a español
      const statusMap: Record<string, 'disponible' | 'bajo' | 'medio' | 'agotado'> = {
        'available': 'disponible',
        'low': 'bajo',
        'medium': 'medio',
        'out': 'agotado'
      };

      const updateData = {
        nombre: product.name,
        categoria: product.category,
        stock: product.stock,
        unidad: product.unit,
        stock_minimo: product.minStock,
        precio: product.price,
        estado: statusMap[product.status] || 'disponible',
        imagen_url: product.image,
      };
      const updatedProduct = await inventarioGeneralService.actualizar(product.id, updateData);
      const mappedProduct = mapToProduct(updatedProduct);
      setProducts(products.map(p => p.id === product.id ? mappedProduct : p));
      toast.success(`Producto "${product.name}" actualizado exitosamente`);
      addNotification('Producto Actualizado', `Se ha actualizado "${product.name}"`, 'info');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMsg);
      console.error('Error al actualizar producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      const product = products.find(p => p.id === id);
      await inventarioGeneralService.eliminar(id);
      
      // Update local state immediately
      setProducts(products.filter(p => p.id !== id));
      
      toast.success(`Producto "${product?.name || 'desconocido'}" eliminado exitosamente`);
      addNotification('Producto Eliminado', `Se ha eliminado "${product?.name || 'producto'}" del inventario`, 'advertencia');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMsg);
      console.error('Error al eliminar producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const recordMovement = async (productId: string, quantity: number, type: 'in' | 'out', motivo?: string) => {
    try {
      setError(null);
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Registrar el movimiento
      if (type === 'in') {
        await movimientosService.registrarEntrada(
          productId,
          'general',
          quantity,
          product.unit,
          {
            motivo: motivo || 'Entrada de inventario',
          }
        );
        await inventarioGeneralService.incrementarStock(productId, quantity);
      } else {
        await movimientosService.registrarSalida(
          productId,
          'general',
          quantity,
          product.unit,
          {
            motivo: motivo || 'Salida de inventario',
          }
        );
        await inventarioGeneralService.decrementarStock(productId, quantity);
      }

      // Recargar productos para obtener el stock actualizado
      await loadProducts();
      
      const actionText = type === 'in' ? 'entrada' : 'salida';
      toast.success(`Movimiento de ${actionText} registrado: ${quantity} ${product.unit}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al registrar movimiento';
      setError(errorMsg);
      console.error('Error al registrar movimiento:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const refreshProducts = async () => {
    await loadProducts();
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      recordMovement,
      refreshProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
