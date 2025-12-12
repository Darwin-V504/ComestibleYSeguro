import { configureStore } from "@reduxjs/toolkit";
import inventoryReducer from './InventorySlice';
import clientReducer from './ClientSlice'; 

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    client: clientReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;