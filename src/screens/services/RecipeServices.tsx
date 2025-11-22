import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useState, useEffect } from 'react';
import CButton from '../../components/CButton';
import { useInventory } from '../../hooksredux/useInventory';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';

// recetas prueba
const Recipes = [
  {
    id: '1',
    title: 'Ensalada de Frutas de Temporada',
    ingredients: ['Manzanas', 'Leche', 'Yogur'],
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400',
    time: 15,
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Sándwich de Pollo y Vegetales',
    ingredients: ['Pan Integral', 'Pechuga de Pollo', 'Zanahorias'],
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
    time: 20,
    difficulty: 'medium'
  },
  {
    id: '3',
    title: 'Batido Energético',
    ingredients: ['Leche', 'Manzanas', 'Zanahorias'],
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
    time: 10,
    difficulty: 'easy'
  }
];

export default function RecipesScreen({ navigation }: any) {
  const { inventory } = useInventory();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  const expiringProducts = inventory.filter(item => {
    const today = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= inTwoDays && expirationDate >= today;
  });

  const expiringProductNames = expiringProducts.map(item => item.product.name);

  const recipes = Recipes.filter(recipe =>
    recipe.ingredients.some(ingredient =>
      expiringProductNames.some(productName =>
        productName.toLowerCase().includes(ingredient.toLowerCase())
      )
    )
  );

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
            <Text style={styles.metaText}>{t(recipe.difficulty)}</Text>
          </View>
        </View>
        <View style={styles.ingredients}>
          {recipe.ingredients.map((ingredient: string, index: number) => (
            <View key={index} style={styles.ingredientTag}>
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('suggestedRecipes')}</Text>
        <Text style={styles.subtitle}>
          {t('basedOnExpiring')}
        </Text>
      </View>

      {expiringProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t('noProductsForRecipes')}</Text>
          <Text style={styles.emptySubtext}>
            {t('addProductsForRecipes')}
          </Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t('noRecipesAvailable')}</Text>
          <Text style={styles.emptySubtext}>
            {t('noRecipesFound')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          showsVerticalScrollIndicator={false}
        />
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
              <Text style={styles.modalTime}>⏱ {selectedRecipe.time} {t('minutes')}</Text>
              <Text style={styles.modalDifficulty}>📊 {t(selectedRecipe.difficulty)}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>{t('ingredients')}:</Text>
            {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
              <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
            ))}
            
            <CButton 
              title={t('prepareRecipe')} 
              onPress={() => {
                Alert.alert(t('enjoyMeal'), `${t('preparing')} ${selectedRecipe.title}`);
                setSelectedRecipe(null);
              }}
            />
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
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientTag: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 12,
    color: colors.text,
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
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
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
  },
  modalTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalDifficulty: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});