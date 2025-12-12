import { supabase } from './supabaseClient';
import { Product, ProductCategory, InventoryItemSerializable } from '../infoutils/types/Products';

// Tipos para Supabase
export interface DatabaseProduct {
  id: string;
  barcode: string;
  name: string;
  category_id: string;
  typical_expiration_days: number;
  created_at: string;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface DatabaseInventoryItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_date: string;
  expiration_date: string;
  products: DatabaseProduct;
}

export interface DatabaseRecipe {
  id: string;
  title: string;
  image_url: string | null;
  preparation_time: number;
  difficulty: string;
  created_at: string;
}

export interface DatabaseRecipeIngredient {
  id: string;
  recipe_id: string;
  product_id: string;
  products: DatabaseProduct;
}

// Servicio para productos
export const productService = {
  // Obtener todos los productos
  async getAllProducts(): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  // Buscar producto por código de barras
  async getProductByBarcode(barcode: string): Promise<DatabaseProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Buscar productos por nombre
  async searchProductsByName(name: string): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${name}%`);
    
    if (error) throw error;
    return data || [];
  }
};

// Servicio para categorías
export const categoryService = {
  async getAllCategories(): Promise<DatabaseCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getCategoryById(id: string): Promise<DatabaseCategory | null> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getCategoryByName(name: string): Promise<DatabaseCategory | null> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

// Servicio para inventario
export const inventoryService = {
  // Obtener inventario del usuario actual
  async getUserInventory(): Promise<DatabaseInventoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', user.id)
      .order('expiration_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Agregar producto al inventario
  async addToInventory(productId: string, expirationDate: Date, quantity: number = 1): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_inventory')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity,
        expiration_date: expirationDate.toISOString()
      });
    
    if (error) throw error;
  },

  // Actualizar cantidad en inventario
  async updateInventoryQuantity(inventoryId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('user_inventory')
      .update({ quantity })
      .eq('id', inventoryId);
    
    if (error) throw error;
  },

  // Eliminar producto del inventario
  async removeFromInventory(inventoryId: string): Promise<void> {
    const { error } = await supabase
      .from('user_inventory')
      .delete()
      .eq('id', inventoryId);
    
    if (error) throw error;
  },

  // Obtener productos próximos a expirar
  async getExpiringProducts(days: number = 2): Promise<DatabaseInventoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', user.id)
      .lte('expiration_date', futureDate.toISOString())
      .gte('expiration_date', new Date().toISOString())
      .order('expiration_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

// Servicio para recetas
export const recipeService = {
  // Obtener todas las recetas
  async getAllRecipes(): Promise<DatabaseRecipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('title');
    
    if (error) throw error;
    return data || [];
  },

  // Obtener receta por ID con ingredientes
  async getRecipeById(id: string): Promise<(DatabaseRecipe & { ingredients: any[] }) | null> {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (recipeError) throw recipeError;
    if (!recipe) return null;

    // Obtener ingredientes
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        *,
        products (*)
      `)
      .eq('recipe_id', id);
    
    if (ingredientsError) throw ingredientsError;

    return {
      ...recipe,
      ingredients: ingredients || []
    };
  },

  // Obtener recetas sugeridas basadas en productos próximos a expirar
  async getSuggestedRecipes(): Promise<DatabaseRecipe[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('suggested_recipes')
      .select(`
        recipe_id,
        recipes (*)
      `)
      .eq('user_id', user.id);
    
    if (error) throw error;

    return (data || [])
      .map(item => (Array.isArray(item.recipes) ? item.recipes[0] : item.recipes) as DatabaseRecipe)
      .filter((recipe): recipe is DatabaseRecipe => recipe !== null);
  },

  // Buscar recetas por ingredientes
  async findRecipesByIngredients(productIds: string[]): Promise<DatabaseRecipe[]> {
    if (productIds.length === 0) return [];

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select(`
        recipe_id,
        recipes (*)
      `)
      .in('product_id', productIds);
    
    if (error) throw error;

    const uniqueRecipes = new Map();
    (data || []).forEach(item => {
      if (!uniqueRecipes.has(item.recipe_id)) {
        const recipe = Array.isArray(item.recipes) ? item.recipes[0] : item.recipes;
        uniqueRecipes.set(item.recipe_id, recipe as DatabaseRecipe);
      }
    });

    return Array.from(uniqueRecipes.values());
  }
};

// Servicio para perfil de usuario
export const profileService = {
  // Obtener perfil del usuario actual
  async getCurrentProfile(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Crear o actualizar perfil
  async upsertProfile(profileData: {
    email: string;
    full_name?: string;
    phone?: string;
    birth_date?: string;
    profile_image_url?: string;
    language?: string;
    theme?: string;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  // Actualizar preferencias de usuario
  async updatePreferences(language: string, theme: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('profiles')
      .update({
        language,
        theme,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (error) throw error;
  }
};

// Servicio para productos manuales (vacío - no hacer nada)
export const manualProductService = {
  // No implementado - productos manuales solo se guardan en Redux local
};