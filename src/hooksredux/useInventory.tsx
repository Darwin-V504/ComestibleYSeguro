import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addProduct, removeProduct, updateQuantity, updateExpiringStatus,  } from "../store/InventorySlice";
import { Product } from "../infoutils/types/Products";
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native'; 

export const useInventory = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector(state => state.inventory.items);

  // Obtener productos próximos a expirar
  const getExpiringProducts = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return inventory.filter(item => new Date(item.expirationDate) <= tomorrow);
  }, [inventory]);

  //  actualizar días automáticamente
  const updateExpiringProducts = useCallback(() => {
    dispatch(updateExpiringStatus());
  }, [dispatch]);

  // Agregar producto - convertir fecha a string por temas de compatibilidad (dispatch)
  const addProductToInventory = (product: Product, expirationDate: Date, quantity: number = 1) => {
    // Convertir Date a string  antes de dispatch
    const expirationDateString = expirationDate.toISOString();
    
    dispatch(addProduct({ 
      product, 
      expirationDate: expirationDateString,  
      quantity 
    }));
  };

  // Eliminar producto
  const removeProductFromInventory = (id: string) => {
    dispatch(removeProduct(id));
  };

  // Actualizar cantidad
  const updateProductQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  // Efecto para actualizar estado de expiración cada día

  useEffect(() => {
    const interval = setInterval(() => {
      updateExpiringProducts();
    }, 24 * 60 * 60 * 1000); 

    // Ejecutar inmediatamente al cargar
    updateExpiringProducts();
    
    return () => clearInterval(interval);
  }, [updateExpiringProducts]);

  // useEffect para actualizar al volver a la app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        updateExpiringProducts();
      }
    };

    // Escuchar cambios de estado de la app
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [updateExpiringProducts]);

  return {
    inventory,
    addProduct: addProductToInventory,
    removeProduct: removeProductFromInventory,
    updateQuantity: updateProductQuantity,
    getExpiringProducts,
    updateExpiringProducts 
  };
};