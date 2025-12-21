
import React, { createContext, useContext, useState } from 'react';

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
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  recordMovement: (productId: string, quantity: number, type: 'in' | 'out') => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  { id: '#001', name: 'Queso Cheddar', category: 'Ingredientes', stock: 45.0, unit: 'Kg', minStock: 10, price: 120, status: 'available', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop' },
  { id: '#002', name: 'Salsa de Tomate', category: 'Salsas', stock: 2.5, unit: 'Litros', minStock: 5, price: 35, status: 'low', image: 'https://images.unsplash.com/photo-1587486937554-68b1a45842f6?w=400&h=300&fit=crop' },
  { id: '#003', name: 'Coca Cola 355ml', category: 'Bebidas', stock: 120, unit: 'Unidades', minStock: 50, price: 15, status: 'available', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop' },
  { id: '#004', name: 'Pan de Hamburguesa', category: 'Panadería', stock: 50, unit: 'Paquetes', minStock: 30, price: 45, status: 'medium', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop' },
  { id: '#005', name: 'Carne de Res', category: 'Carnes', stock: 0, unit: 'Kg', minStock: 20, price: 180, status: 'out', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=300&fit=crop' },
  { id: '#006', name: 'Lechuga Fresca', category: 'Vegetales', stock: 15, unit: 'Kg', minStock: 10, price: 25, status: 'available', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop' },
  { id: '#007', name: 'Papas Fritas Congeladas', category: 'Congelados', stock: 8, unit: 'Bolsas', minStock: 15, price: 55, status: 'low', image: 'https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=400&h=300&fit=crop' },
  { id: '#008', name: 'Aceite Vegetal', category: 'Aceites', stock: 25, unit: 'Litros', minStock: 10, price: 42, status: 'available', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop' },
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const recordMovement = (productId: string, quantity: number, type: 'in' | 'out') => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newStock = type === 'in' ? p.stock + quantity : p.stock - quantity;
        const newStatus = newStock <= 0 ? 'out' : newStock <= p.minStock ? 'low' : 'available';
        return { ...p, stock: newStock, status: newStatus as any };
      }
      return p;
    }));
    console.log(`Movement recorded: Product ${productId}, ${type} ${quantity}`);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, recordMovement }}>
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
