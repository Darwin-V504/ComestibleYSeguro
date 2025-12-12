import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import CButton from '../../components/CButton';
import { useInventory } from '../../hooksredux/useInventory';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// URL de la API - Cambia esto por tu IP local cuando pruebes en dispositivo físico
const API_URL = 'http://localhost:3001'; // Para emulador
// const API_URL = 'http://192.168.1.100:3001'; // Para dispositivo físico - cambia la IP

// Recetas de respaldo en caso de que falle la API
const FALLBACK_RECIPES = [
  {
    id: '1',
    title: 'Ensalada de Frutas de Temporada',
    ingredients: ['Manzanas', 'Leche', 'Yogur'],
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400',
    time: 15,
    difficulty: 'easy',
    category: 'Fruits',
    tags: ['healthy', 'quick']
  },
  {
    id: '2',
    title: 'Sándwich de Pollo y Vegetales',
    ingredients: ['Pan Integral', 'Pechuga de Pollo', 'Zanahorias'],
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
    time: 20,
    difficulty: 'medium',
    category: 'Chicken',
    tags: ['lunch', 'sandwich']
  },
  {
    id: '3',
    title: 'Batido Energético',
    ingredients: ['Leche', 'Manzanas', 'Zanahorias'],
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
    time: 10,
    difficulty: 'easy',
    category: 'Drink',
    tags: ['breakfast', 'smoothie']
  },
  {
    id: '4',
    title: 'Omelette de Verduras',
    ingredients: ['Huevos', 'Zanahorias', 'Leche'],
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    time: 15,
    difficulty: 'easy',
    category: 'Vegetarian',
    tags: ['breakfast', 'eggs']
  },
  {
    id: '5',
    title: 'Pasta con Pollo',
    ingredients: ['Pasta', 'Pechuga de Pollo', 'Tomate'],
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
    time: 30,
    difficulty: 'medium',
    category: 'Pasta',
    tags: ['dinner', 'italian']
  }
];

// Función para traducir ingredientes al inglés para la API
const translateToEnglish = (spanishName: string): string => {
  const translations: Record<string, string> = {
    'leche': 'milk',
    'manzanas': 'apple',
    'zanahorias': 'carrot',
    'yogur': 'yogurt',
    'pan integral': 'bread',
    'pechuga de pollo': 'chicken',
    'pan': 'bread',
    'pollo': 'chicken',
    'arroz': 'rice',
    'pasta': 'pasta',
    'tomate': 'tomato',
    'tomates': 'tomato',
    'cebolla': 'onion',
    'cebollas': 'onion',
    'queso': 'cheese',
    'huevos': 'eggs',
    'huevo': 'egg',
    'papas': 'potato',
    'papa': 'potato',
    'patata': 'potato',
    'zanahoria': 'carrot',
    'zanahorias': 'carrot',
    'lechuga': 'lettuce',
    'espinacas': 'spinach',
    'brócoli': 'broccoli',
    'zanahoria': 'carrot',
    'carne': 'beef',
    'res': 'beef',
    'cerdo': 'pork',
    'pescado': 'fish',
    'atún': 'tuna',
    'salmon': 'salmon',
    'yogurt': 'yogurt',
    'mantequilla': 'butter',
    'aceite': 'oil',
    'aceite de oliva': 'olive oil',
    'vinagre': 'vinegar',
    'sal': 'salt',
    'pimienta': 'pepper',
    'azúcar': 'sugar',
    'harina': 'flour',
    'limón': 'lemon',
    'limones': 'lemon',
    'naranja': 'orange',
    'naranjas': 'orange',
    'plátano': 'banana',
    'plátanos': 'banana',
    'fresa': 'strawberry',
    'fresas': 'strawberry',
    'uva': 'grape',
    'uvas': 'grape',
    'piña': 'pineapple',
    'aguacate': 'avocado',
    'aguacates': 'avocado',
    'ajo': 'garlic',
    'ajos': 'garlic',
    'perejil': 'parsley',
    'cilantro': 'coriander',
    'oreo': 'cookie',
    'galletas': 'cookies',
    'chocolate': 'chocolate',
    'café': 'coffee',
    'té': 'tea',
    'agua': 'water',
    'jugo': 'juice',
    'refresco': 'soda',
    'cerveza': 'beer',
    'vino': 'wine',
  };
  
  const lowerName = spanishName.toLowerCase().trim();
  return translations[lowerName] || spanishName;
};

export default function RecipesScreen({ navigation }: any) {
  const { inventory } = useInventory();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  // Obtener productos que expiran en los próximos 2 días
  const expiringProducts = inventory.filter(item => {
    const today = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= inTwoDays && expirationDate >= today;
  });

  const expiringProductNames = expiringProducts.map(item => 
    item.product.name
  );

  // Función para buscar recetas en la API
  const fetchRecipesFromAPI = async () => {
    if (expiringProductNames.length === 0) {
      setRecipes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Productos próximos a expirar:', expiringProductNames);
      
      // Traducir ingredientes al inglés
      const englishIngredients = expiringProductNames.map(translateToEnglish);
      console.log('Ingredientes traducidos para API:', englishIngredients);
      
      const response = await axios.post(
        `${API_URL}/api/recipes/ingredients`,
        {
          ingredients: englishIngredients
        },
        {
          timeout: 10000, // 10 segundos timeout
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Respuesta de API:', response.data);

      if (response.data.success && response.data.recipes.length > 0) {
        setRecipes(response.data.recipes);
        setUseFallback(false);
      } else {
        // Si la API no encuentra recetas, usar las de respaldo
        console.log('API no encontró recetas, usando fallback');
        setRecipes(FALLBACK_RECIPES.filter(recipe =>
          recipe.ingredients.some(ingredient =>
            expiringProductNames.some(productName =>
              productName.toLowerCase().includes(ingredient.toLowerCase().split(' ')[0])
            )
          )
        ));
        setUseFallback(true);
      }
    } catch (error: any) {
      console.error('Error buscando recetas en API:', error.message || error);
      
      // Usar recetas de respaldo
      console.log('Usando recetas de respaldo debido a error de conexión');
      setRecipes(FALLBACK_RECIPES.filter(recipe =>
        recipe.ingredients.some(ingredient =>
          expiringProductNames.some(productName =>
            productName.toLowerCase().includes(ingredient.toLowerCase().split(' ')[0])
          )
        )
      ));
      setUseFallback(true);
      
      // Mostrar error solo si no hay productos expirando
      if (expiringProductNames.length > 0) {
        setError('No se pudo conectar con el servidor de recetas. Mostrando sugerencias locales.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesFromAPI();
  }, [expiringProductNames]);

  const RecipeCard = ({ recipe }: { recipe: any }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => setSelectedRecipe(recipe)}
    >
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.time} {t('minutes')}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {recipe.difficulty === 'easy' ? t('easy') : 
               recipe.difficulty === 'medium' ? t('medium') : t('hard')}
            </Text>
          </View>
          
          {recipe.category && (
            <View style={styles.metaItem}>
              <Ionicons name="fast-food-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{recipe.category}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.ingredients}>
          {recipe.ingredients.slice(0, 3).map((ingredient: string, index: number) => (
            <View key={index} style={styles.ingredientTag}>
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
          {recipe.ingredients.length > 3 && (
            <View style={styles.moreIngredients}>
              <Text style={styles.moreIngredientsText}>+{recipe.ingredients.length - 3} más</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('suggestedRecipes')}</Text>
        <Text style={styles.subtitle}>
          {t('basedOnExpiring')} ({expiringProductNames.length} {t('product')})
        </Text>
        
        {useFallback && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={styles.warningText}>
              Modo offline: usando recetas locales
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')} recetas...</Text>
        </View>
      ) : expiringProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t('noProductsForRecipes')}</Text>
          <Text style={styles.emptySubtext}>
            {t('addProductsForRecipes')}
          </Text>
          <CButton 
            title={t('scanNew')}
            onPress={() => navigation.navigate('ScanProduct')}
            variant="primary"
            size="medium"
            
          />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t('noRecipesAvailable')}</Text>
          <Text style={styles.emptySubtext}>
            {t('noRecipesFound')}
          </Text>
          <CButton
            title="Intentar de nuevo"
            onPress={fetchRecipesFromAPI}
            variant="secondary"
            size="medium"
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      )}

      {/* Modal de detalle de receta */}
      {selectedRecipe && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedRecipe(null)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
            <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
            
            <View style={styles.modalMeta}>
              <View style={styles.modalMetaItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.modalMetaText}>{selectedRecipe.time} {t('minutes')}</Text>
              </View>
              
              <View style={styles.modalMetaItem}>
                <Ionicons name="speedometer-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.modalMetaText}>
                  {selectedRecipe.difficulty === 'easy' ? t('easy') : 
                   selectedRecipe.difficulty === 'medium' ? t('medium') : t('hard')}
                </Text>
              </View>
              
              {selectedRecipe.category && (
                <View style={styles.modalMetaItem}>
                  <Ionicons name="fast-food-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedRecipe.category}</Text>
                </View>
              )}
            </View>
            
            {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {selectedRecipe.tags.slice(0, 3).map((tag: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <Text style={styles.sectionTitle}>{t('ingredients')}:</Text>
            <View style={styles.ingredientsList}>
              {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={styles.ingredientItemText}>{ingredient}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <CButton
                title={t('prepareRecipe')}
                onPress={() => {
                  Alert.alert(t('enjoyMeal'), `${t('preparing')} ${selectedRecipe.title}`);
                  setSelectedRecipe(null);
                }}
                variant="primary"
                size="medium"
              />
              
              <CButton
                title="Cerrar"
                onPress={() => setSelectedRecipe(null)}
                variant="tertiary"
                size="medium"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.warning,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  recipeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientTag: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ingredientText: {
    fontSize: 12,
    color: colors.text,
  },
  moreIngredients: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moreIngredientsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalMetaText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientsList: {
    marginBottom: 20,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  modalButtons: {
    gap: 12,
    marginTop: 10,
  },
});