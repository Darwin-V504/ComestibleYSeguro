// src/routes/recipes.js
const express = require("express");
const router = express.Router();
const mealDBService = require("../services/mealDBService");

// Buscar recetas por ingredientes
router.post("/ingredients", async (req, res) => {
  try {
    console.log(" Recibida solicitud de recetas");
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de ingredientes no vacío"
      });
    }
    
    const cleanIngredients = ingredients
      .map(i => typeof i === 'string' ? i.trim() : String(i))
      .filter(i => i.length > 0);
    
    if (cleanIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Ingredientes inválidos"
      });
    }
    
    console.log(` Ingredientes recibidos: ${cleanIngredients.join(', ')}`);
    
    const recipes = await mealDBService.searchByIngredients(cleanIngredients);
    
    if (recipes.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: "No se encontraron recetas con esos ingredientes",
        suggestions: [
          "Intenta con ingredientes más comunes como: chicken, rice, tomato, onion, cheese",
          "Prueba con nombres en inglés",
          "Usa ingredientes individuales"
        ],
        recipes: []
      });
    }
    
    // Formatear recetas con manejo seguro de propiedades
    const formattedRecipes = recipes.map(recipe => ({
      id: recipe.id || '',
      title: recipe.title || '',
      ingredients: recipe.ingredients && Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.slice(0, 10)  // Mostrar hasta 10 ingredientes
        : [],
      image: recipe.image || '',
      time: recipe.time || 30,
      difficulty: recipe.difficulty || 'medium',
      category: recipe.category || 'General',
      instructions: recipe.instructions || recipe.strInstructions || "",
      tags: recipe.tags && Array.isArray(recipe.tags) ? recipe.tags : [],
      matchedIngredients: recipe.matchedIngredients && Array.isArray(recipe.matchedIngredients) 
        ? recipe.matchedIngredients 
        : []
    }));
    
    console.log(`Enviando ${formattedRecipes.length} recetas al frontend`);
    
    res.json({
      success: true,
      count: formattedRecipes.length,
      ingredientsSearched: cleanIngredients,
      timestamp: new Date().toISOString(),
      recipes: formattedRecipes
    });
    
  } catch (error) {
    console.error(" Error en /by-ingredients:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get("/random/:count", async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    
    // Recetas de ejemplo con propiedades completas
    const sampleRecipes = [
      {
        id: "52772",
        title: "Teriyaki Chicken Casserole",
        ingredients: ["chicken", "soy sauce", "honey", "rice"],
        image: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
        time: 45,
        difficulty: "medium",
        category: "Chicken",
        instructions: "Preheat oven to 350° F. Spray a 9x13-inch baking pan with non-stick spray. Combine soy sauce, ½ cup water, brown sugar, ginger and garlic in a small saucepan and cover. Bring to a boil over medium heat. Remove lid and cook for one minute once boiling. Meanwhile, stir together the corn starch and 2 tablespoons of water in a separate dish until smooth. Once sauce is boiling, add mixture to the saucepan and stir to combine. Cook until the sauce starts to thicken then remove from heat. Place the chicken breasts in the prepared pan. Pour one cup of the sauce over top of chicken. Place chicken in oven and bake 35 minutes or until cooked through. Remove from oven and shred chicken in the dish using two forks. *Meanwhile, steam or cook rice according to package instructions. Add the cooked rice to the casserole dish with the chicken. Add most of the remaining sauce, reserving a bit to drizzle over the top when serving. Toss everything together in the casserole dish until combined. Return to oven and cook 15 minutes. Remove from oven and let stand 5 minutes before serving. Drizzle each serving with remaining sauce.",
        tags: ["chicken", "casserole", "asian"]
      },
      {
        id: "52818",
        title: "Chicken Fajita Mac and Cheese",
        ingredients: ["chicken", "cheese", "pasta", "peppers"],
        image: "https://www.themealdb.com/images/media/meals/qrqywr1503066605.jpg",
        time: 35,
        difficulty: "easy",
        category: "Pasta",
        instructions: "Fry your onion, peppers and garlic in olive oil until nice and golden brown. Add your chicken breast and season well with salt and pepper, paprika and cumin. Once chicken is sealed and slightly coloured add your tin of tomatoes and chicken stock. Leave to simmer for 20-25 minutes. Meanwhile, boil your macaroni as per instructions. Once macaroni is cooked, drain and add to the pan with the peppers, chicken and tomatoes. Stir in grated cheese, reserving some to go on top. Pour into an ovenproof dish, top with cheese and bake in a preheated oven at 200°C for 20-25 minutes until golden brown. Serve with garlic bread or a side salad.",
        tags: ["pasta", "chicken", "cheese", "mexican"]
      }
    ];
    
    res.json({
      success: true,
      count: Math.min(count, sampleRecipes.length),
      recipes: sampleRecipes.slice(0, count)
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Nueva ruta sin parámetro para default
router.get("/random", async (req, res) => {
  try {
    const sampleRecipes = [
      {
        id: "52772",
        title: "Teriyaki Chicken Casserole",
        ingredients: ["chicken", "soy sauce", "honey", "rice"],
        image: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
        time: 45,
        difficulty: "medium",
        category: "Chicken",
        instructions: "Preheat oven to 350° F. Spray a 9x13-inch baking pan with non-stick spray. Combine soy sauce, ½ cup water, brown sugar, ginger and garlic in a small saucepan and cover. Bring to a boil over medium heat. Remove lid and cook for one minute once boiling. Meanwhile, stir together the corn starch and 2 tablespoons of water in a separate dish until smooth. Once sauce is boiling, add mixture to the saucepan and stir to combine. Cook until the sauce starts to thicken then remove from heat. Place the chicken breasts in the prepared pan. Pour one cup of the sauce over top of chicken. Place chicken in oven and bake 35 minutes or until cooked through. Remove from oven and shred chicken in the dish using two forks. *Meanwhile, steam or cook rice according to package instructions. Add the cooked rice to the casserole dish with the chicken. Add most of the remaining sauce, reserving a bit to drizzle over the top when serving. Toss everything together in the casserole dish until combined. Return to oven and cook 15 minutes. Remove from oven and let stand 5 minutes before serving. Drizzle each serving with remaining sauce.",
        tags: ["chicken", "casserole", "asian"]
      },
      {
        id: "52818",
        title: "Chicken Fajita Mac and Cheese",
        ingredients: ["chicken", "cheese", "pasta", "peppers"],
        image: "https://www.themealdb.com/images/media/meals/qrqywr1503066605.jpg",
        time: 35,
        difficulty: "easy",
        category: "Pasta",
        instructions: "Fry your onion, peppers and garlic in olive oil until nice and golden brown. Add your chicken breast and season well with salt and pepper, paprika and cumin. Once chicken is sealed and slightly coloured add your tin of tomatoes and chicken stock. Leave to simmer for 20-25 minutes. Meanwhile, boil your macaroni as per instructions. Once macaroni is cooked, drain and add to the pan with the peppers, chicken and tomatoes. Stir in grated cheese, reserving some to go on top. Pour into an ovenproof dish, top with cheese and bake in a preheated oven at 200°C for 20-25 minutes until golden brown. Serve with garlic bread or a side salad.",
        tags: ["pasta", "chicken", "cheese", "mexican"]
      }
    ];
    
    res.json({
      success: true,
      count: sampleRecipes.length,
      recipes: sampleRecipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;