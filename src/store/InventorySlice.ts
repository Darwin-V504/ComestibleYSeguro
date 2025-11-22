import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, InventoryItemSerializable } from "../infoutils/theme/types/Products";

interface InventoryState {
  items: InventoryItemSerializable[];
}

const initialState: InventoryState = {
  items: [],
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // Agregar producto al inventario de tipo string por temas de compatibilidad
    addProduct: (state, action: PayloadAction<{ 
      product: Product; 
      expirationDate: string;  // Cambiado de Date a string
      quantity?: number 
    }>) => {
      const { product, expirationDate, quantity = 1 } = action.payload;
      
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Si ya existe, aumentar cantidad
        existingItem.quantity += quantity;
      } else {
        // Si no existe, crear nuevo item
        const newItem: InventoryItemSerializable = {
          product,
          addedDate: new Date().toISOString(), // Usar string directamente
          expirationDate: expirationDate, // Ya viene como string
          isExpiring: false,
          quantity: quantity
        };
        state.items.push(newItem);
      }
    },
    
    // Eliminar producto del inventario
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product.id !== action.payload);
    },
    
    // Actualizar cantidad de producto
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.product.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
      }
    },
    
    // reducer para marcar productos próximos a expirar 
    updateExpiringStatus: (state) => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 2);
      
      const todayISO = today.toISOString();
      const tomorrowISO = tomorrow.toISOString();
      
      state.items.forEach(item => {
        const isExpired = item.expirationDate < todayISO;
        const isExpiringSoon = item.expirationDate <= tomorrowISO && item.expirationDate >= todayISO;
        
        // marcar como expirado  si ya pasó la fecha
        item.isExpiring = isExpiringSoon || isExpired;
        
       
      });
    },

  }
});

export const {
  addProduct,
  removeProduct,
  updateQuantity,
  updateExpiringStatus,
  
} = inventorySlice.actions;

export default inventorySlice.reducer;