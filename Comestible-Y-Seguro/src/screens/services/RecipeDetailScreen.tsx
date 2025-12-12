import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  Share
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CButton from '../../components/CButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';

const { width } = Dimensions.get('window');
type RootStackParamList = {
  RecipeDetail: { recipe: any };
  FullInstructions: { recipe: any; instructions: string };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RecipeDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>(); 
  const { recipe } = route.params as any;
  
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);
  
  // Función para traducir dificultad
  const translateDifficulty = (difficulty: string) => {
    if (difficulty === 'easy') return t('easy');
    if (difficulty === 'medium') return t('medium');
    if (difficulty === 'hard') return t('hard');
    return difficulty;
  };

  // Función para compartir receta
  const shareRecipe = async () => {
    try {
      const message = `${recipe.title}\n\n${t('ingredients')}:\n${recipe.ingredients.join('\n')}\n\n${t('time')}: ${recipe.time} ${t('minutes')}\n${t('difficulty')}: ${translateDifficulty(recipe.difficulty)}`;
      
      await Share.share({
        message,
        title: recipe.title,
      });
    } catch (error) {
      console.log('Error sharing recipe:', error);
    }
  };

  // Función para ver video en YouTube
  const watchVideo = () => {
    if (recipe.video) {
      Linking.openURL(recipe.video);
    } else {
      Alert.alert(t('noVideo'), t('noVideoAvailable'));
    }
  };

  // Función para ver instrucciones completas
 const viewFullInstructions = () => {
    navigation.navigate('FullInstructions', {
      recipe: {
        title: recipe.title,
      },
      instructions: recipe.instructions
    });
  };

  // Nueva lógica: Siempre mostrar botón si hay instrucciones
  const hasInstructions = recipe.instructions && recipe.instructions.length > 0;
  
  // Mostrar vista previa si las instrucciones son largas (> 800 caracteres)
  // Si son cortas, mostrar todo directamente
  const shouldShowPreview = recipe.instructions?.length > 800;
  
  // Texto a mostrar (recortado solo si es necesario)
  const previewInstructions = shouldShowPreview
    ? recipe.instructions?.substring(0, 800) + '...'
    : recipe.instructions;

  return (
    <View style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.title}</Text>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareRecipe}
        >
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Imagen principal */}
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        
        {/* Información rápida */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoItem}>
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.quickInfoLabel}>{t('time')}</Text>
            <Text style={styles.quickInfoValue}>{recipe.time} {t('minutes')}</Text>
          </View>
          
          <View style={styles.quickInfoDivider} />
          
          <View style={styles.quickInfoItem}>
            <Ionicons name="speedometer-outline" size={24} color={colors.primary} />
            <Text style={styles.quickInfoLabel}>{t('difficulty')}</Text>
            <Text style={styles.quickInfoValue}>{translateDifficulty(recipe.difficulty)}</Text>
          </View>
          
          <View style={styles.quickInfoDivider} />
          
          <View style={styles.quickInfoItem}>
            <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
            <Text style={styles.quickInfoLabel}>{t('category')}</Text>
            <Text style={styles.quickInfoValue}>{recipe.category || t('general')}</Text>
          </View>
        </View>

        {/* Ingredientes coincidentes */}
        {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
          <View style={styles.matchedContainer}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <View style={styles.matchedTextContainer}>
              <Text style={styles.matchedTitle}>{t('matchesYourIngredients')}</Text>
              <Text style={styles.matchedIngredients}>
                {recipe.matchedIngredients.join(', ')}
              </Text>
            </View>
          </View>
        )}

        {/* Sección de ingredientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={22} color={colors.text} />
            <Text style={styles.sectionTitle}>{t('ingredients')}</Text>
            <Text style={styles.ingredientsCount}>({recipe.ingredients.length})</Text>
          </View>
          
          <View style={styles.ingredientsGrid}>
            {recipe.ingredients.map((ingredient: string, index: number) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet}>
                  <Ionicons name="ellipse" size={8} color={colors.primary} />
                </View>
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sección de instrucciones  */}
        {hasInstructions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={22} color={colors.text} />
              <Text style={styles.sectionTitle}>{t('instructions')}</Text>
            </View>
            
            {/* Vista previa de instrucciones */}
            <Text style={styles.instructionsText}>
              {previewInstructions}
            </Text>
            
            {/*  mostrar botón para ver instrucciones completas */}
            {/* Esto ayuda al usuario a tener una mejor experiencia de lectura */}
            
            
            {recipe.instructions.length > 1500 && (
              <Text style={styles.longRecipeNote}>
                {t('longRecipeNote')}
              </Text>
            )}
          </View>
        )}

        {/* Video si existe */}
        {recipe.video && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="videocam-outline" size={22} color={colors.text} />
              <Text style={styles.sectionTitle}>{t('watchOnYoutube')}</Text>
            </View>
            
            <CButton
              title={t('watchOnYoutube')}
              onPress={watchVideo}
              variant="secondary"
              size="medium"
            />
          </View>
        )}

        {/* Etiquetas si existen */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetags-outline" size={22} color={colors.text} />
              <Text style={styles.sectionTitle}>{t('tags')}</Text>
            </View>
            
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Espacio para los botones fijos */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Botones fijos en la parte inferior */}
      <View style={styles.fixedActions}>
        {/* Botón para preparar receta */}
        <CButton
          title={t('prepareRecipe')}
          onPress={() => {
            Alert.alert(t('prepareRecipe'), t('recipeSavedMessage'));
          }}
          variant="primary"
          size="large"
          
        />
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            Alert.alert(t('recipeSaved'), t('recipeSavedMessage'));
          }}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.primary} />
          <Text style={styles.saveButtonText}>{t('saveRecipe')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  shareButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    marginTop: -1,
  },
  quickInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  matchedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  matchedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 4,
  },
  matchedIngredients: {
    fontSize: 13,
    color: colors.success,
    opacity: 0.9,
  },
  // Sección normal
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 10,
  },
  ingredientsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
    marginTop: 2,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingRight: 10,
  },
  ingredientBullet: {
    width: 24,
    alignItems: 'center',
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // Estilos específicos para instrucciones
  instructionsText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    textAlign: 'justify',
    marginBottom: 16,
  },
  // Botón para ver instrucciones completas - MEJORADO
  viewFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
    marginTop: 8,
  },
  viewFullButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginHorizontal: 10,
  },
  viewFullIcon: {
    marginLeft: 4,
  },
  longRecipeNote: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
  fixedActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prepareButton: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.primary + '08',
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});