export type ProductCategory =  | 'lacteos'  | 'carnes'  | 'verduras'  | 
'frutas'  | 'granos'  | 'bebidas'  | 'otros';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
}

// Tipo para almacenamiento en Redux (fechas como strings)
export interface InventoryItemSerializable {
  product: Product;
  addedDate: string;  //   string
  expirationDate: string;  // string
  isExpiring: boolean;
  quantity: number;
}

// Tipo para uso en componentes (fechas como Date)
export interface InventoryItem {
  product: Product;
  addedDate: Date;  // ← fecha para que cuente cada hora del día
  expirationDate: Date;  // ← fecha para que cuente cada hora del día
  isExpiring: boolean;
  quantity: number;
}

