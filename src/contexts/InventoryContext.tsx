/*import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Product, InventoryItem } from '../infoutils/theme/types/Products';
import { useAppDispatch } from '../store/hooks';
import { addScannedProduct, updateProductsManaged } from '../store/ClientSlice';


type InventoryContextType = {
  inventory: InventoryItem[];
  addProduct: (product: Product, expirationDate: Date, quantity?: number) => void;
  removeProduct: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getExpiringProducts: () => InventoryItem[];
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory debe estar dentro de InventoryProvider');
  return context;
};

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const dispatch = useAppDispatch();

  const getExpiringProducts = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return inventory.filter(item => item.expirationDate <= tomorrow);
  }, [inventory]);

  const addProduct = (product: Product, expirationDate: Date, quantity: number = 1) => {
    const newItem: InventoryItem = {
      product,
      addedDate: new Date(),
      expirationDate,
      isExpiring: false,
      quantity: quantity
    };

    setInventory(prev => [...prev, newItem]);
    
    // Actualizar estadísticas en Redux
    const newTotalProducts = inventory.length + 1;
    dispatch(updateProductsManaged(newTotalProducts));
    
    // Solo contar como escaneado si es un producto nuevo (no aumento de cantidad)
    if (quantity === 1) {
      dispatch(addScannedProduct());
    }
  };

  const removeProduct = (id: string) => {
    setInventory(prev => prev.filter(item => item.product.id !== id));
    
    // Actualizar contador en Redux
    const newTotalProducts = inventory.length - 1;
    dispatch(updateProductsManaged(newTotalProducts));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setInventory(prev => prev.map(item =>
      item.product.id === id ? { ...item, quantity } : item
    ));
  };

  useEffect(() => {
    const checkExpiringProducts = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      
      setInventory(prev => prev.map(item => ({
        ...item,
        isExpiring: item.expirationDate <= tomorrow
      })));
    };

    checkExpiringProducts();
    
    const interval = setInterval(checkExpiringProducts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <InventoryContext.Provider value={{
      inventory,
      addProduct,
      removeProduct,
      updateQuantity,
      getExpiringProducts
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

*/
