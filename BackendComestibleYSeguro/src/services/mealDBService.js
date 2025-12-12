// services/mealDBService.js
const axios = require("axios");

class MealDBService {
  constructor() {
    this.client = axios.create({
      baseURL: "https://www.themealdb.com/api/json/v1/1",
      timeout: 100000, // Aumentado para evitar timeouts
    });
  }

  // Buscar recetas por múltiples ingredientes
  async searchByIngredients(ingredients) {
    try {
      console.log(` BUSCANDO RECETAS CON INGREDIENTES `);
      console.log(`Ingredientes solicitados: ${ingredients.join(', ')}`);
      
      if (!ingredients || ingredients.length === 0) {
        console.log('No hay ingredientes para buscar');
        return [];
      }
      
      const allRecipesMap = new Map();
      const recipeSources = {};
      
      // 1. Buscar recetas para CADA ingrediente
      for (const ingredient of ingredients) {
        try {
          console.log(`Buscando recetas con ingrediente: "${ingredient}"`);
          
          const response = await this.client.get(`/filter.php?i=${encodeURIComponent(ingredient.trim())}`);
          
          if (response.data.meals && response.data.meals.length > 0) {
            console.log(`Encontradas ${response.data.meals.length} recetas con "${ingredient}"`);
            
            for (const recipe of response.data.meals) {
              if (recipe && recipe.idMeal) {
                const recipeId = recipe.idMeal;
                
                if (!allRecipesMap.has(recipeId)) {
                  allRecipesMap.set(recipeId, recipe);
                  recipeSources[recipeId] = [ingredient];
                } else {
                  if (!recipeSources[recipeId].includes(ingredient)) {
                    recipeSources[recipeId].push(ingredient);
                  }
                }
              }
            }
          } else {
            console.log(`No se encontraron recetas con "${ingredient}"`);
          }
        } catch (error) {
          console.warn(`Error buscando recetas con "${ingredient}":`, error.message);
        }
      }
      
      console.log(`Total de recetas únicas encontradas: ${allRecipesMap.size}`);
      
      if (allRecipesMap.size === 0) {
        console.log('No se encontraron recetas con ninguno de los ingredientes');
        return [];
      }
      
      // 2. Obtener detalles completos de cada receta
      console.log('Obteniendo detalles completos de las recetas...');
      const recipesWithDetails = [];
      
      for (const [recipeId, basicRecipe] of allRecipesMap.entries()) {
        try {
          const fullRecipe = await this.getRecipeById(recipeId);
          if (fullRecipe) {
            recipesWithDetails.push({
              id: recipeId,
              basic: basicRecipe,
              full: fullRecipe,
              matchedIngredients: recipeSources[recipeId] || []
            });
          }
        } catch (error) {
          console.warn(` Error obteniendo detalles de receta ${recipeId}:`, error.message);
        }
      }
      
      console.log(` Detalles obtenidos para ${recipesWithDetails.length} recetas`);
      
      // 3. FILTRAR RECETAS VÁLIDAS
      console.log(' Filtrando recetas que realmente contienen los ingredientes...');
      const validRecipes = [];
      
      for (const recipeData of recipesWithDetails) {
        const isValid = await this.doesRecipeContainIngredients(recipeData.full, ingredients);
        
        if (isValid.found) {
          validRecipes.push({
            ...recipeData,
            verifiedMatchedIngredients: isValid.matchedIngredients
          });
          console.log(` Receta "${recipeData.full.strMeal}" contiene: ${isValid.matchedIngredients.join(', ')}`);
        }
      }
    
      console.log(` Recetas válidas después de filtrado: ${validRecipes.length}`);
      
      if (validRecipes.length === 0) {
        console.log(' Ninguna receta contiene realmente los ingredientes solicitados');
        return [];
      }
      
      // 4. FORMATEAR RECETAS
      const formattedRecipes = [];
      
      // Ordenar por cantidad de coincidencias
      validRecipes.sort((a, b) => {
        return b.verifiedMatchedIngredients.length - a.verifiedMatchedIngredients.length;
      });
      
      // Limitar a máximo 20 recetas
      const recipesToShow = validRecipes.slice(0, 20);
      
      console.log(` Mostrando ${recipesToShow.length} recetas mejor coincidentes`);
      
      for (const recipeData of recipesToShow) {
        try {
          const formattedRecipe = this.formatRecipe(recipeData.full);
          if (formattedRecipe) {
            formattedRecipe.matchedIngredients = recipeData.verifiedMatchedIngredients;
            formattedRecipes.push(formattedRecipe);
          }
        } catch (error) {
          console.warn(`Error formateando receta:`, error.message);
        }
      }
      
      console.log(`Enviando ${formattedRecipes.length} recetas válidas al frontend`);
      return formattedRecipes;
      
    } catch (error) {
      console.error(" Error general en búsqueda de recetas:", error.message);
      console.error(error.stack);
      return [];
    }
  }

  async doesRecipeContainIngredients(recipe, requestedIngredients) {
    try {
      if (!recipe || !requestedIngredients || requestedIngredients.length === 0) {
        return { found: false, matchedIngredients: [] };
      }
      
      const recipeIngredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        if (ingredient && ingredient.trim()) {
          const cleanIngredient = this.normalizeIngredient(ingredient.trim());
          if (cleanIngredient) {
            recipeIngredients.push(cleanIngredient);
          }
        }
      }
      
      const instructions = recipe.strInstructions ? recipe.strInstructions.toLowerCase() : '';
      
      const normalizedRequested = requestedIngredients.map(ing => 
        this.normalizeIngredient(ing.trim())
      ).filter(ing => ing);
      
      const matchedIngredients = [];
      
      for (const requestedIng of normalizedRequested) {
        let found = false;
        
        for (const recipeIng of recipeIngredients) {
          if (this.ingredientsMatch(requestedIng, recipeIng)) {
            found = true;
            break;
          }
        }
        
        if (!found && instructions) {
          if (instructions.includes(requestedIng.toLowerCase())) {
            found = true;
          }
        }
        
        if (found) {
          matchedIngredients.push(requestedIng);
        }
      }
      
      return {
        found: matchedIngredients.length > 0,
        matchedIngredients: matchedIngredients
      };
      
    } catch (error) {
      console.error(`Error verificando ingredientes en receta:`, error.message);
      return { found: false, matchedIngredients: [] };
    }
  }

  normalizeIngredient(ingredient) {
    if (!ingredient) return '';
    
    let normalized = ingredient.toLowerCase().trim();
    
    const commonWords = [
      'fresh', 'dried', 'chopped', 'sliced', 'minced', 'grated', 'ground',
      'whole', 'canned', 'frozen', 'powdered', 'organic', 'extra', 'virgin',
      'light', 'dark', 'raw', 'cooked', 'boiled', 'roasted', 'grilled',
      'boneless', 'skinless', 'lean', 'fat', 'free', 'low', 'reduced', 'sodium'
    ];
    
    commonWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      normalized = normalized.replace(regex, '');
    });
    
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    const variantMap = {
      'chicken breast': 'chicken',
      'chicken thighs': 'chicken',
      'ground beef': 'beef',
      'beef steak': 'beef',
      'pork chop': 'pork',
      'salmon fillet': 'salmon',
      'tuna steak': 'tuna',
      'white wine': 'wine',
      'red wine': 'wine',
      'apple cider vinegar': 'vinegar',
      'balsamic vinegar': 'vinegar',
      'olive oil': 'oil',
      'vegetable oil': 'oil',
      'soy sauce': 'soy',
      'tomato sauce': 'tomato',
      'tomato paste': 'tomato',
      'cream cheese': 'cheese',
      'cheddar cheese': 'cheese',
      'parmesan cheese': 'cheese',
      'mozzarella cheese': 'cheese'
    };
    
    for (const [variant, base] of Object.entries(variantMap)) {
      if (normalized.includes(variant)) {
        normalized = base;
        break;
      }
    }
    
    const words = normalized.split(' ');
    if (words.length > 1) {
      const keepCompounds = ['bell pepper', 'green beans', 'sour cream', 'cream cheese', 'soy sauce'];
      for (const compound of keepCompounds) {
        if (normalized.includes(compound)) {
          return compound;
        }
      }
      return words[0];
    }
    
    return normalized;
  }

  ingredientsMatch(requested, recipeIngredient) {
    if (!requested || !recipeIngredient) return false;
    
    const req = requested.toLowerCase();
    const rec = recipeIngredient.toLowerCase();
    
    if (req === rec) return true;
    
    if (req.includes(rec) || rec.includes(req)) return true;
    
    if ((req + 's' === rec) || (rec + 's' === req)) return true;
    
    const commonVariants = {
      'chicken': ['chicken breast', 'chicken thigh', 'chicken wing'],
      'beef': ['ground beef', 'beef steak', 'beef roast'],
      'pork': ['pork chop', 'pork loin', 'pork shoulder'],
      'fish': ['salmon', 'tuna', 'cod', 'haddock'],
      'milk': ['dairy milk', 'whole milk', 'skim milk'],
      'cheese': ['cheddar', 'parmesan', 'mozzarella', 'gouda'],
      'bread': ['white bread', 'whole wheat', 'sourdough'],
      'rice': ['white rice', 'brown rice', 'basmati rice'],
      'pasta': ['spaghetti', 'penne', 'fettuccine', 'macaroni'],
      'oil': ['olive oil', 'vegetable oil', 'canola oil'],
      'vinegar': ['white vinegar', 'apple cider vinegar', 'balsamic vinegar'],
      'wine': ['white wine', 'red wine', 'cooking wine']
    };
    
    for (const [base, variants] of Object.entries(commonVariants)) {
      if ((req === base && variants.some(v => rec.includes(v))) ||
          (rec === base && variants.some(v => req.includes(v)))) {
        return true;
      }
    }
    
    return false;
  }

  async getRecipeById(id) {
    try {
      const response = await this.client.get(`/lookup.php?i=${id}`);
      return response.data.meals ? response.data.meals[0] : null;
    } catch (error) {
      console.error(`Error obteniendo receta ${id}:`, error.message);
      return null;
    }
  }

  formatRecipe(recipe) {
    if (!recipe) return null;
    
    try {
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push(ingredient.trim());
        }
      }

      const estimatedTime = this.estimateTime(recipe.strInstructions, ingredients.length);

      return {
        id: recipe.idMeal || '',
        title: recipe.strMeal || 'Sin título',
        ingredients: ingredients,
        image: recipe.strMealThumb || '',
        time: estimatedTime,
        difficulty: this.estimateDifficulty(recipe.strInstructions),
        instructions: recipe.strInstructions || '',
        category: recipe.strCategory || 'General',
        video: recipe.strYoutube || '',
        tags: recipe.strTags ? recipe.strTags.split(",").map(t => t.trim()) : [],
        matchedIngredients: []
      };
    } catch (error) {
      console.error('Error en formatRecipe:', error.message);
      return null;
    }
  }

  estimateTime(instructions, ingredientCount) {
    if (!instructions) return 30;
    const wordCount = instructions.split(/\s+/).length;
    return Math.min(120, Math.max(15, 20 + ingredientCount + Math.floor(wordCount * 0.1)));
  }

  estimateDifficulty(instructions) {
    if (!instructions) return "medium";
    const wordCount = instructions.split(/\s+/).length;
    if (wordCount < 80) return "easy";
    if (wordCount > 200) return "hard";
    return "medium";
  }
}

module.exports = new MealDBService();