import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { inventarioDetalladoService } from '@/services/inventario-detallado.service';
import { inventarioGeneralService } from '@/services/inventario-general.service';
import { movimientosService } from '@/services/movimientos.service';
import type { InventarioDetallado } from '@/types/database.types';
import { toast } from 'sonner';
import { Product } from '@/contexts/ProductContext';

interface DetailedInventoryContextType {
  getProductsByLocation: (locationId: string) => Product[];
  loadingByLocation: Record<string, boolean>;
  error: string | null;
  addProductToLocation: (locationId: string, product: Omit<Product, 'id'>) => Promise<void>;
  transferFromGeneral: (locationId: string, generalProductId: string, quantity: number, minStock: number) => Promise<void>;
  updateProduct: (locationId: string, product: Product) => Promise<void>;
  deleteProduct: (locationId: string, productId: string) => Promise<void>;
  refreshLocation: (locationId: string) => Promise<void>;
  getProductCount: (locationId: string) => number;
}

const DetailedInventoryContext = createContext<DetailedInventoryContextType | undefined>(undefined);

// Mapeo de estados
const statusMapToSpanish: Record<string, 'disponible' | 'bajo' | 'medio' | 'agotado'> = {
  'available': 'disponible',
  'low': 'bajo',
  'medium': 'medio',
  'out': 'agotado'
};

const statusMapToEnglish: Record<string, 'available' | 'low' | 'medium' | 'out'> = {
  'disponible': 'available',
  'bajo': 'low',
  'medio': 'medium',
  'agotado': 'out'
};

// Función helper para convertir de InventarioDetallado a Product
const mapToProduct = (item: InventarioDetallado): Product => ({
  id: item.id,
  name: item.nombre,
  category: item.categoria,
  stock: item.stock,
  unit: item.unidad,
  minStock: item.stock_minimo,
  price: item.precio,
  status: statusMapToEnglish[item.estado] || 'available',
  image: item.imagen_url,
});

// Función helper para convertir de Product a InventarioDetallado
const mapFromProduct = (
  product: Omit<Product, 'id'>,
  negocioId: string,
  productoGeneralId?: string
): Omit<InventarioDetallado, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> => ({
  negocio_id: negocioId,
  producto_general_id: productoGeneralId || null,
  nombre: product.name,
  categoria: product.category,
  stock: product.stock,
  unidad: product.unit,
  stock_minimo: product.minStock,
  precio: product.price,
  estado: statusMapToSpanish[product.status] || 'disponible',
  imagen_url: product.image,
  activo: true,
});

export const DetailedInventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productsByLocation, setProductsByLocation] = useState<Record<string, Product[]>>({});
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loadingByLocation, setLoadingByLocation] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Cargar conteos globales al iniciar
  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const counts = await inventarioDetalladoService.obtenerConteosGlobal();
      setProductCounts(counts);
    } catch (err) {
      console.error('Error al cargar conteos:', err);
    }
  };

  const getProductCount = useCallback((locationId: string): number => {
    // Si tenemos los productos cargados, usar esa longitud (más preciso)
    if (productsByLocation[locationId]) {
      return productsByLocation[locationId].length;
    }
    // Si no, usar el conteo global
    return productCounts[locationId] || 0;
  }, [productsByLocation, productCounts]);

  const getProductsByLocation = useCallback((locationId: string): Product[] => {
    return productsByLocation[locationId] || [];
  }, [productsByLocation]);

  const loadProductsForLocation = useCallback(async (locationId: string) => {
    try {
      setLoadingByLocation(prev => ({ ...prev, [locationId]: true }));
      setError(null);
      const data = await inventarioDetalladoService.obtenerPorNegocio(locationId, true);
      const mappedProducts = data.map(mapToProduct);
      setProductsByLocation(prev => ({ ...prev, [locationId]: mappedProducts }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMsg);
      console.error('Error al cargar productos:', err);
      // No mostrar toast, solo establecer productos vacíos
      setProductsByLocation(prev => ({ ...prev, [locationId]: [] }));
    } finally {
      setLoadingByLocation(prev => ({ ...prev, [locationId]: false }));
    }
  }, []);

  const addProductToLocation = async (locationId: string, product: Omit<Product, 'id'>) => {
    try {
      setError(null);
      const newProductData = mapFromProduct(product, locationId);
      const createdProduct = await inventarioDetalladoService.crear(newProductData);
      
      // Registrar movimiento de entrada
      await movimientosService.registrarEntrada(
        createdProduct.id,
        'detallado',
        product.stock,
        product.unit,
        {
          negocioId: locationId,
          motivo: 'Producto agregado al inventario detallado',
          precioUnitario: product.price,
        }
      );

      const mappedProduct = mapToProduct(createdProduct);
      setProductsByLocation(prev => ({
        ...prev,
        [locationId]: [...(prev[locationId] || []), mappedProduct]
      }));
      setProductCounts(prev => ({
        ...prev,
        [locationId]: (prev[locationId] || 0) + 1
      }));
      toast.success(`Producto "${product.name}" agregado exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agregar producto';
      setError(errorMsg);
      console.error('Error al agregar producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const transferFromGeneral = async (
    locationId: string,
    generalProductId: string,
    quantity: number,
    minStock: number
  ) => {
    try {
      setError(null);

      // Obtener producto del inventario general
      const generalProduct = await inventarioGeneralService.obtenerPorId(generalProductId);
      if (!generalProduct) {
        throw new Error('Producto no encontrado en inventario general');
      }

      // Validar stock disponible
      if (quantity > generalProduct.stock) {
        throw new Error(`Stock insuficiente en inventario general. Disponible: ${generalProduct.stock}`);
      }

      // Crear producto en inventario detallado
      const newProductData = mapFromProduct(
        {
          name: generalProduct.nombre,
          category: generalProduct.categoria,
          stock: quantity,
          unit: generalProduct.unidad,
          minStock: minStock,
          price: generalProduct.precio,
          status: statusMapToEnglish[generalProduct.estado] || 'available',
          image: generalProduct.imagen_url,
        },
        locationId,
        generalProductId
      );

      const createdProduct = await inventarioDetalladoService.crear(newProductData);

      // Decrementar stock en inventario general
      await inventarioGeneralService.decrementarStock(generalProductId, quantity);

      // Registrar movimiento de salida en inventario general
      await movimientosService.registrarSalida(
        generalProductId,
        'general',
        quantity,
        generalProduct.unidad,
        {
          motivo: `Transferencia a ubicación`,
          negocioId: locationId,
        }
      );

      // Registrar movimiento de entrada en inventario detallado
      await movimientosService.registrarEntrada(
        createdProduct.id,
        'detallado',
        quantity,
        generalProduct.unidad,
        {
          negocioId: locationId,
          motivo: 'Transferencia desde inventario general',
          precioUnitario: generalProduct.precio,
        }
      );

      const mappedProduct = mapToProduct(createdProduct);
      setProductsByLocation(prev => ({
        ...prev,
        [locationId]: [...(prev[locationId] || []), mappedProduct]
      }));
      setProductCounts(prev => ({
        ...prev,
        [locationId]: (prev[locationId] || 0) + 1
      }));

      toast.success(`Producto "${generalProduct.nombre}" transferido exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al transferir producto';
      setError(errorMsg);
      console.error('Error al transferir producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const updateProduct = async (locationId: string, product: Product) => {
    try {
      setError(null);
      const updateData = {
        nombre: product.name,
        categoria: product.category,
        stock: product.stock,
        unidad: product.unit,
        stock_minimo: product.minStock,
        precio: product.price,
        estado: statusMapToSpanish[product.status] || 'disponible',
        imagen_url: product.image,
      };
      const updatedProduct = await inventarioDetalladoService.actualizar(product.id, updateData);
      const mappedProduct = mapToProduct(updatedProduct);
      
      setProductsByLocation(prev => ({
        ...prev,
        [locationId]: (prev[locationId] || []).map(p => p.id === product.id ? mappedProduct : p)
      }));
      
      toast.success(`Producto "${product.name}" actualizado exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMsg);
      console.error('Error al actualizar producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const deleteProduct = async (locationId: string, productId: string) => {
    try {
      setError(null);
      const products = productsByLocation[locationId] || [];
      const product = products.find(p => p.id === productId);
      
      await inventarioDetalladoService.eliminar(productId);
      
      setProductsByLocation(prev => ({
        ...prev,
        [locationId]: (prev[locationId] || []).filter(p => p.id !== productId)
      }));
      setProductCounts(prev => ({
        ...prev,
        [locationId]: Math.max(0, (prev[locationId] || 1) - 1)
      }));
      
      toast.success(`Producto "${product?.name || 'desconocido'}" eliminado exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMsg);
      console.error('Error al eliminar producto:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const refreshLocation = useCallback(async (locationId: string) => {
    await loadProductsForLocation(locationId);
  }, [loadProductsForLocation]);

  return (
    <DetailedInventoryContext.Provider value={{
      getProductsByLocation,
      loadingByLocation,
      error,
      addProductToLocation,
      transferFromGeneral,
      updateProduct,
      deleteProduct,
      refreshLocation,
      getProductCount
    }}>
      {children}
    </DetailedInventoryContext.Provider>
  );
};

export const useDetailedInventory = () => {
  const context = useContext(DetailedInventoryContext);
  if (context === undefined) {
    throw new Error('useDetailedInventory must be used within a DetailedInventoryProvider');
  }
  return context;
};
