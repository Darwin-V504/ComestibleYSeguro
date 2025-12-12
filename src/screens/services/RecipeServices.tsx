import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import CButton from '../../components/CButton';
import { useInventory } from '../../hooksredux/useInventory';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { translateIngredient } from '../../infoutils/ingredientTranslations';

// Obtener dimensiones de la pantalla
const { width } = Dimensions.get('window');

// URL de la API
const API_URL = 'http://192.168.1.8:3001'; // Ip localhost

export default function RecipesScreen({ navigation }: any) {
  const { inventory } = useInventory();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  // Usar useMemo para evitar recreación en cada render
  const { expiringProducts, expiringProductNames } = useMemo(() => {
    const today = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    
    const expiring = inventory.filter(item => {
      try {
        const expirationDate = new Date(item.expirationDate);
        if (isNaN(expirationDate.getTime())) return false;
        return expirationDate <= inTwoDays && expirationDate >= today;
      } catch {
        return false;
      }
    });

    const names = expiring.map(item => item.product.name);
    
    return {
      expiringProducts: expiring,
      expiringProductNames: names
    };
  }, [inventory]);

  // Función para buscar recetas
  const fetchRecipesFromAPI = useCallback(async () => {
    if (expiringProductNames.length === 0) {
      setRecipes([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Traducir ingredientes al inglés
      const englishIngredients = expiringProductNames.map(translateIngredient);
      
      console.log('SOLICITANDO RECETAS A API');
      console.log('Ingredientes del usuario:', expiringProductNames);
      console.log('Traducidos para API:', englishIngredients);
      
      const response = await axios.post(
        `${API_URL}/api/recipes/ingredients`,
        {
          ingredients: englishIngredients
        },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('Respuesta de API:', {
        success: response.data.success,
        count: response.data.count,
        recipesCount: response.data.recipes?.length || 0
      });
      
      if (response.data.success && response.data.recipes && response.data.recipes.length > 0) {
        setRecipes(response.data.recipes);
        console.log(` API encontró ${response.data.recipes.length} recetas válidas`);
      } else {
        setRecipes([]);
        console.log('API no encontró recetas con esos ingredientes');
      }
    } catch (error: any) {
      console.log('Error de conexión con API:', error.message);
      setRecipes([]);
      setError(t('apiConnectionError'));
    } finally {
      setLoading(false);
    }
  }, [expiringProductNames, t]);

  // useEffect con dependencias correctas
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchRecipesFromAPI();
    }
    
    return () => {
      isMounted = false;
    };
  }, [fetchRecipesFromAPI]);

  // Función para traducir dificultad
  const translateDifficulty = (difficulty: string) => {
    if (difficulty === 'easy') return t('easy');
    if (difficulty === 'medium') return t('medium');
    if (difficulty === 'hard') return t('hard');
    return difficulty;
  };

  const RecipeCard = ({ recipe }: { recipe: any }) => {
    // Limitar el título si es muy largo
    const displayTitle = recipe.title.length > 40 
      ? recipe.title.substring(0, 40) + '...' 
      : recipe.title;
    
    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipe })}
      >
        {/* Imagen de la receta */}
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        
        {/* Overlay de información rápida en la imagen */}
        <View style={styles.imageOverlay}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color="#FFFFFF" />
            <Text style={styles.timeText}>{recipe.time} {t('minutes')}</Text>
          </View>
          
          <View style={[styles.difficultyBadge, 
            recipe.difficulty === 'easy' ? styles.easyBadge :
            recipe.difficulty === 'medium' ? styles.mediumBadge :
            styles.hardBadge
          ]}>
            <Text style={styles.difficultyText}>
              {translateDifficulty(recipe.difficulty)}
            </Text>
          </View>
        </View>
        
        {/* Contenido de la tarjeta */}
        <View style={styles.recipeContent}>
          {/* Título y categoría */}
          <View style={styles.titleRow}>
            <Text style={styles.recipeTitle} numberOfLines={2}>{displayTitle}</Text>
            {recipe.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {recipe.category}
                </Text>
              </View>
            )}
          </View>
          
          {/* Ingredientes coincidentes */}
          {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
            <View style={styles.matchedContainer}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.matchedText}>
                {t('contains')}: {recipe.matchedIngredients.join(', ')}
              </Text>
            </View>
          )}
          
          {/* Lista de ingredientes de la receta */}
          <Text style={styles.ingredientsTitle}>{t('ingredients')}:</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.ingredientsScroll}
            contentContainerStyle={styles.ingredientsScrollContent}
          >
            {recipe.ingredients.slice(0, 8).map((ingredient: string, index: number) => (
              <View key={index} style={styles.ingredientChip}>
                <Ionicons name="restaurant-outline" size={12} color={colors.primary} />
                <Text style={styles.ingredientChipText} numberOfLines={1}>
                  {ingredient}
                </Text>
              </View>
            ))}
            
            {recipe.ingredients.length > 8 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>
                  +{recipe.ingredients.length - 8} {t('more')}
                </Text>
              </View>
            )}
          </ScrollView>
          
          {/* Botón para ver detalles COMPLETOS */}
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('RecipeDetail', { recipe })}
          >
            <Text style={styles.viewDetailsText}>{t('viewFullRecipe')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('suggestedRecipes')}</Text>
        <Text style={styles.subtitle}>
          {t('basedOnExpiring')} ({expiringProductNames.length} {t('product')})
        </Text>
        
        {expiringProductNames.length > 0 && (
          <View style={styles.currentIngredients}>
            <Text style={styles.ingredientsLabel}>{t('yourIngredients')}:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.currentIngredientsScroll}
            >
              {expiringProductNames.map((ingredient, index) => (
                <View key={index} style={styles.currentIngredientChip}>
                  <Text style={styles.currentIngredientText} numberOfLines={1}>
                    {ingredient}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')} {t('recipes').toLowerCase()}...</Text>
        </View>
      ) : expiringProductNames.length === 0 ? (
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
          <Text style={styles.emptyText}>{t('noRecipesFound')}</Text>
          <Text style={styles.emptySubtext}>
            {t('noRecipesForIngredients')}
          </Text>
          <CButton
            title={t('tryAgain')}
            onPress={fetchRecipesFromAPI}
            variant="secondary"
            size="medium"
          
          />
          <CButton
            title={t('scanNew')}
            onPress={() => navigation.navigate('ScanProduct')}
            variant="tertiary"
            size="medium"
            
          />
        </View>
      ) : (
        <>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <Text style={styles.resultsCount}>
            {recipes.length} {t('recipe')}{recipes.length !== 1 ? 's' : ''} {t('found')}
          </Text>
          
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recipesList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}

      {/* Modal de PREVIEW rápida (mantenido para vista rápida) */}
      {selectedRecipe && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Encabezado del modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={2}>{selectedRecipe.title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedRecipe(null)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Imagen */}
              <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
              
              {/* Información rápida */}
              <View style={styles.modalQuickInfo}>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={styles.quickInfoText}>{selectedRecipe.time} {t('minutes')}</Text>
                </View>
                
                <View style={styles.quickInfoItem}>
                  <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
                  <Text style={styles.quickInfoText}>
                    {translateDifficulty(selectedRecipe.difficulty)}
                  </Text>
                </View>
                
                {selectedRecipe.category && (
                  <View style={styles.quickInfoItem}>
                    <Ionicons name="fast-food-outline" size={20} color={colors.primary} />
                    <Text style={styles.quickInfoText}>
                      {selectedRecipe.category}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Ingredientes coincidentes */}
              {selectedRecipe.matchedIngredients && selectedRecipe.matchedIngredients.length > 0 && (
                <View style={styles.matchedInfo}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.matchedInfoText}>
                    {t('containsYourIngredients')}: {selectedRecipe.matchedIngredients.join(', ')}
                  </Text>
                </View>
              )}
              
              {/* Vista previa de ingredientes */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="restaurant-outline" size={18} color={colors.text} /> 
                  {t('ingredients')} ({selectedRecipe.ingredients.length})
                </Text>
                <View style={styles.ingredientsGrid}>
                  {selectedRecipe.ingredients.slice(0, 6).map((ingredient: string, index: number) => (
                    <View key={index} style={styles.modalIngredientItem}>
                      <Ionicons name="checkmark" size={14} color={colors.success} />
                      <Text style={styles.modalIngredientText} numberOfLines={1}>{ingredient}</Text>
                    </View>
                  ))}
                  
                  {selectedRecipe.ingredients.length > 6 && (
                    <View style={styles.moreIngredientsPreview}>
                      <Text style={styles.moreIngredientsText}>
                        +{selectedRecipe.ingredients.length - 6} {t('moreIngredients')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Vista previa de instrucciones */}
              {selectedRecipe.instructions && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>
                    <Ionicons name="book-outline" size={18} color={colors.text} /> 
                    {t('instructions')}
                  </Text>
                  <Text style={styles.instructionsPreview} numberOfLines={6}>
                    {selectedRecipe.instructions}
                  </Text>
                  {selectedRecipe.instructions.length > 300 && (
                    <Text style={styles.viewFullText}>
                      {t('viewFullInstructions')}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Botón para ver receta completa */}
              <View style={styles.modalActions}>
                <CButton
                  title={t('viewFullRecipe')}
                  onPress={() => {
                    setSelectedRecipe(null);
                    navigation.navigate('RecipeDetail', { recipe: selectedRecipe });
                  }}
                  variant="primary"
                  size="large"
                  
                />
                
                <CButton
                  title={t('close')}
                  onPress={() => setSelectedRecipe(null)}
                  variant="tertiary"
                  size="medium"
                />
              </View>
            </ScrollView>
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
  },
  header: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.warning,
    flex: 1,
  },
  currentIngredients: {
    marginTop: 8,
  },
  ingredientsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  currentIngredientsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  currentIngredientChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  currentIngredientText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    maxWidth: 120,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.error,
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
  },
  recipesList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  separator: {
    height: 16,
  },
  
  // Estilos para card de receta
  recipeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 380,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  easyBadge: {
    backgroundColor: colors.success + 'CC',
  },
  mediumBadge: {
    backgroundColor: colors.warning + 'CC',
  },
  hardBadge: {
    backgroundColor: colors.error + 'CC',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  recipeContent: {
    padding: 20,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  matchedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  matchedText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.success,
    flex: 1,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  ingredientsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  ingredientsScrollContent: {
    paddingRight: 40,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 100,
    maxWidth: 150,
  },
  ingredientChipText: {
    marginLeft: 6,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  moreChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  moreChipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 'auto',
  },
  viewDetailsText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  
  // Estilos para preview
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 16,
    lineHeight: 26,
  },
  closeButton: {
    padding: 4,
    marginTop: -4,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalQuickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: colors.backgroundAlt,
  },
  quickInfoItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  quickInfoText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  matchedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  matchedInfoText: {
    marginLeft: 10,
    fontSize: 15,
    color: colors.success,
    flex: 1,
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalIngredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    paddingRight: 8,
  },
  modalIngredientText: {
    marginLeft: 8,
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  moreIngredientsPreview: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    backgroundColor: colors.primary + '10',
    borderRadius: 10,
  },
  moreIngredientsText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  instructionsPreview: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'justify',
  },
  viewFullText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  viewFullButton: {
    marginBottom: 8,
  },
});