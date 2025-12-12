import axios from 'axios';

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  image: string;
  time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  instructions?: string;
  tags?: string[];
}

interface SearchResponse {
  success: boolean;
  count: number;
  ingredientsSearched: string[];
  recipes: Recipe[];
  message?: string;
}

interface RandomResponse {
  success: boolean;
  count: number;
  recipes: Recipe[];
}

class RecipeService {
  private baseURL: string;

  constructor() {
    //URL del backend desde .env
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async searchByIngredients(ingredients: string[]): Promise<SearchResponse> {
    try {
      console.log('Buscando recetas con ingredientes:', ingredients);
      
      const response = await axios.post(`${this.baseURL}/api/recipes/ingredients`, {
        ingredients
      });

      return response.data;
    } catch (error: any) {
      console.error('Error buscando recetas por ingredientes:', error);
      
      // Retornar recetas de ejemplo en caso de error
      return {
        success: false,
        count: 0,
        ingredientsSearched: ingredients,
        recipes: this.getFallbackRecipes(),
        message: error.response?.data?.error || 'Error al buscar recetas'
      };
    }
  }

  async getRandomRecipes(count: number = 5): Promise<RandomResponse> {
    try {
      console.log('Obteniendo recetas aleatorias');
      
      const response = await axios.get(`${this.baseURL}/api/recipes/random/${count}`);
      
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo recetas aleatorias:', error);
      
      return {
        success: false,
        count: Math.min(count, this.getFallbackRecipes().length),
        recipes: this.getFallbackRecipes().slice(0, count)
      };
    }
  }

  // Cambiado a público
  public getFallbackRecipes(): Recipe[] {
    return [
      {
        id: '1',
        title: 'Ensalada de Frutas de Temporada',
        ingredients: ['Manzanas', 'Leche', 'Yogur'],
        image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400',
        time: 15,
        difficulty: 'easy',
        category: 'Ensaladas'
      },
      {
        id: '2',
        title: 'Sándwich de Pollo y Vegetales',
        ingredients: ['Pan Integral', 'Pechuga de Pollo', 'Zanahorias'],
        image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
        time: 20,
        difficulty: 'medium',
        category: 'Sándwiches'
      },
      {
        id: '3',
        title: 'Batido Energético',
        ingredients: ['Leche', 'Manzanas', 'Zanahorias'],
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
        time: 10,
        difficulty: 'easy',
        category: 'Bebidas'
      },
      {
        id: '4',
        title: 'Omelette de Queso y Vegetales',
        ingredients: ['Huevos', 'Queso', 'Pimientos', 'Cebolla'],
        image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50',
        time: 15,
        difficulty: 'easy',
        category: 'Desayuno'
      },
      {
        id: '5',
        title: 'Sopa de Pollo y Verduras',
        ingredients: ['Pollo', 'Zanahorias', 'Cebolla', 'Apio'],
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        time: 40,
        difficulty: 'medium',
        category: 'Sopas'
      }
    ];
  }

  // Método alternativo si prefieres no exponer el método privado
  public getExampleRecipes(count: number = 3): Recipe[] {
    return this.getFallbackRecipes().slice(0, count);
  }
}

export const recipeService = new RecipeService();