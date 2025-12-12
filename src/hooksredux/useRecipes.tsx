import { useState, useCallback } from 'react';
import { recipeService, Recipe } from '../services/recipeServices';
import { useInventory } from './useInventory';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { inventory } = useInventory();

  const getExpiringProductNames = useCallback(() => {
    const today = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    
    return inventory
      .filter(item => {
        const expirationDate = new Date(item.expirationDate);
        return expirationDate <= inTwoDays && expirationDate >= today;
      })
      .map(item => item.product.name);
  }, [inventory]);

  const searchRecipesByExpiringProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const expiringProducts = getExpiringProductNames();
      
      if (expiringProducts.length === 0) {
        setRecipes([]);
        setError('No hay productos próximos a expirar para buscar recetas');
        return [];
      }
      
      console.log('Buscando recetas para productos:', expiringProducts);
      
      // Transformar nombres de productos a inglés (simple)
      const englishIngredients = expiringProducts.map(product => {
        const translations: Record<string, string> = {
          'Manzanas': 'apple',
          'Leche': 'milk',
          'Yogur': 'yogurt',
          'Pan Integral': 'bread',
          'Pechuga de Pollo': 'chicken',
          'Zanahorias': 'carrot',
          'Oreo': 'cookie',
          'Arroz': 'rice',
          'Pasta': 'pasta',
          'Queso': 'cheese',
          'Tomate': 'tomato',
          'Cebolla': 'onion',
          'Pescado': 'fish',
          'Carne': 'beef',
          'Huevos': 'egg',
          'Mantequilla': 'butter',
          'Aceite': 'oil',
          'Sal': 'salt',
          'Azúcar': 'sugar',
          'Harina': 'flour'
        };
        
        return translations[product] || product.toLowerCase();
      });
      
      const result = await recipeService.searchByIngredients(englishIngredients);
      
      if (result.success && result.recipes.length > 0) {
        setRecipes(result.recipes);
        return result.recipes;
      } else {
        setRecipes([]);
        setError(result.message || 'No se encontraron recetas');
        return [];
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al buscar recetas';
      setError(errorMessage);
      console.error('Error en searchRecipesByExpiringProducts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getExpiringProductNames]);

  const getRandomRecipes = useCallback(async (count: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await recipeService.getRandomRecipes(count);
      
      if (result.success && result.recipes.length > 0) {
        setRecipes(result.recipes);
        return result.recipes;
      } else {
        const fallbackRecipes = recipeService.getFallbackRecipes();
        setRecipes(fallbackRecipes.slice(0, count));
        return fallbackRecipes.slice(0, count);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener recetas aleatorias';
      setError(errorMessage);
      console.error('Error en getRandomRecipes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecipes = useCallback(() => {
    setRecipes([]);
    setError(null);
  }, []);

  return {
    recipes,
    loading,
    error,
    searchRecipesByExpiringProducts,
    getRandomRecipes,
    clearRecipes,
    getExpiringProductNames
  };
};