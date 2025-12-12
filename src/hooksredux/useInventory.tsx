import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addProduct, removeProduct, updateQuantity, updateExpiringStatus } from "../store/InventorySlice";
import { Product } from "../infoutils/types/Products";
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { inventoryService, productService } from '../services/supabaseServices';

export const useInventory = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector(state => state.inventory.items);

  // Cargar inventario desde Supabase al iniciar
  const loadInventoryFromSupabase = useCallback(async () => {
    try {
      const supabaseInventory = await inventoryService.getUserInventory();
      
      // Convertir a formato local y dispatch a Redux
      supabaseInventory.forEach(item => {
        const localProduct: Product = {
          id: item.product_id,
          barcode: item.products?.barcode || 'manual',
          name: item.products?.name || 'Producto manual',
          category: (item.products?.category_id || 'otros') as any
        };

        dispatch(addProduct({
          product: localProduct,
          expirationDate: item.expiration_date,
          quantity: item.quantity
        }));
      });
    } catch (error) {
      console.error('Error cargando inventario desde Supabase:', error);
    }
  }, [dispatch]);

  // Obtener productos próximos a expirar
  const getExpiringProducts = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return inventory.filter(item => new Date(item.expirationDate) <= tomorrow);
  }, [inventory]);

  // Actualizar días automáticamente
  const updateExpiringProducts = useCallback(() => {
    dispatch(updateExpiringStatus());
  }, [dispatch]);

  // Agregar producto - SOLO productos con código de barras van a Supabase
  const addProductToInventory = async (product: Product, expirationDate: Date, quantity: number = 1) => {
    try {
      // Solo guardar en Supabase si NO es producto manual
      if (!product.barcode.startsWith('manual_')) {
        let productId = product.id;
        
        const existingProduct = await productService.getProductByBarcode(product.barcode);
        if (existingProduct) {
          productId = existingProduct.id;
          await inventoryService.addToInventory(productId, expirationDate, quantity);
        }
        // Si no existe en Supabase, no hacemos nada (solo Redux local)
      }

      // Siempre guardar en Redux local
      const expirationDateString = expirationDate.toISOString();
      dispatch(addProduct({
        product,
        expirationDate: expirationDateString,
        quantity
      }));

    } catch (error) {
      console.error('Error agregando producto a Supabase:', error);
      // Fallback: guardar solo en Redux local
      const expirationDateString = expirationDate.toISOString();
      dispatch(addProduct({
        product,
        expirationDate: expirationDateString,
        quantity
      }));
    }
  };

  // Eliminar producto
  const removeProductFromInventory = async (id: string) => {
    try {
      // Solo intentar eliminar de Supabase si no es producto manual
      if (!id.startsWith('manual_')) {
        const supabaseInventory = await inventoryService.getUserInventory();
        const itemToDelete = supabaseInventory.find(item => item.product_id === id);
        
        if (itemToDelete) {
          await inventoryService.removeFromInventory(itemToDelete.id);
        }
      }
    } catch (error) {
      console.error('Error eliminando producto de Supabase:', error);
    }
    
    dispatch(removeProduct(id));
  };

  // Actualizar cantidad
  const updateProductQuantity = async (id: string, quantity: number) => {
    try {
      // Solo intentar actualizar en Supabase si no es producto manual
      if (!id.startsWith('manual_')) {
        const supabaseInventory = await inventoryService.getUserInventory();
        const itemToUpdate = supabaseInventory.find(item => item.product_id === id);
        
        if (itemToUpdate) {
          await inventoryService.updateInventoryQuantity(itemToUpdate.id, quantity);
        }
      }
    } catch (error) {
      console.error('Error actualizando cantidad en Supabase:', error);
    }
    
    dispatch(updateQuantity({ id, quantity }));
  };

  // Efecto para cargar inventario al iniciar
  useEffect(() => {
    loadInventoryFromSupabase();
  }, [loadInventoryFromSupabase]);

  // Efecto para actualizar estado de expiración cada día
  useEffect(() => {
    const interval = setInterval(() => {
      updateExpiringProducts();
    }, 24 * 60 * 60 * 1000);

    updateExpiringProducts();
    
    return () => clearInterval(interval);
  }, [updateExpiringProducts]);

  // useEffect para actualizar al volver a la app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        updateExpiringProducts();
        loadInventoryFromSupabase();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [updateExpiringProducts, loadInventoryFromSupabase]);

  return {
    inventory,
    addProduct: addProductToInventory,
    removeProduct: removeProductFromInventory,
    updateQuantity: updateProductQuantity,
    getExpiringProducts,
    updateExpiringProducts,
    refreshInventory: loadInventoryFromSupabase
  };
};