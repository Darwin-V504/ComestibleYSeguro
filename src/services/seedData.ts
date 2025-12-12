import { supabase } from './supabaseClient';

export const seedInitialData = async () => {
  // Insertar categorías
  const categories = [
    { name: 'lacteos' },
    { name: 'carnes' },
    { name: 'verduras' },
    { name: 'frutas' },
    { name: 'granos' },
    { name: 'bebidas' },
    { name: 'otros' }
  ];

  for (const category of categories) {
    const { error } = await supabase
      .from('product_categories')
      .insert(category)
      .select();
    
    if (error && error.code !== '23505') { // Ignorar error de duplicado
      console.error('Error insertando categoría:', error);
    }
  }

  // Insertar productos de ejemplo
  const products = [
    { barcode: '104590705201', name: 'Oreo', category_id: 'otros', typical_expiration_days: 180 },
    { barcode: '129304301933', name: 'Leche', category_id: 'lacteos', typical_expiration_days: 7 },
    { barcode: '114678134562', name: 'Pan Integral', category_id: 'granos', typical_expiration_days: 5 },
    { barcode: '112185028403', name: 'Manzanas', category_id: 'frutas', typical_expiration_days: 14 },
    { barcode: '119583019484', name: 'Pechuga de Pollo', category_id: 'carnes', typical_expiration_days: 3 },
    { barcode: '129059284055', name: 'Zanahorias', category_id: 'verduras', typical_expiration_days: 10 },
  ];

  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .insert(product)
      .select();
    
    if (error && error.code !== '23505') {
      console.error('Error insertando producto:', error);
    }
  }

  console.log('Datos iniciales insertados correctamente');
};