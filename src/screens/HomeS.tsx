import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import CButton from '../components/CButton';
import { useInventory } from '../hooksredux/useInventory'; // ← Asegurar este import
import { useAuth } from '../contexts/AuthContexts';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../infoutils/theme';
import { InventoryItem } from '../infoutils/theme/types/Products'; // ← Este tipo tiene Dates
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation, route }: any) {
  const { inventory } = useInventory(); // ← Esto ya devuelve Dates
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);
  const [expiringProducts, setExpiringProducts] = useState<InventoryItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const today = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    
    // Ensure expirationDate is compared as a Date/timestamp (handles string or Date)
    const expiring = inventory
      .filter(item => {
        const expDate = new Date(item.expirationDate).getTime();
        return expDate <= inTwoDays.getTime() && expDate >= today.getTime();
      })
      .map(item => ({
        ...item,
        addedDate: new Date(item.addedDate),
        expirationDate: new Date(item.expirationDate),
      }));
    setExpiringProducts(expiring);
  }, [inventory]);


  const handleScanProduct = () => {
    navigation.navigate('ScanProduct');
  };

  const handleViewRecipes = () => {
    navigation.navigate('Recipes');
  };

  const handleViewInventory = () => {
    navigation.navigate('Tabs', { screen: 'Inventory' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>{t('welcome')}, {user?.email || t('user')}</Text>
        <Text style={styles.subtitle}>{t('managePantry')}</Text>
      </View>

      {/* Resumen Rápido */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{inventory.length}</Text>
          <Text style={styles.statLabel}>{t('productsManaged')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="warning-outline" size={24} color={colors.accent} />
          <Text style={styles.statNumber}>{expiringProducts.length}</Text>
          <Text style={styles.statLabel}>{t('avoidingWaste')}</Text>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.actionsContainer}>
        <CButton
          title={t('scanProduct')}
          onPress={handleScanProduct}
          variant="primary"
        />
        <CButton
          title={t('viewRecipes')}
          onPress={handleViewRecipes}
          variant="secondary"
        />
        <CButton
          title={t('myPantry')}
          onPress={handleViewInventory}
          variant="tertiary"
        />
      </View>

      {/* Productos por expirar */}
      {expiringProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('expiringSoon')}</Text>
          <View style={styles.expiringList}>
            {expiringProducts.slice(0, 3).map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.expiringItem}
                onPress={handleViewInventory}
              >
                <Ionicons name="time-outline" size={16} color={colors.accent} />
                <Text style={styles.expiringText}>{item.product.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {expiringProducts.length > 3 && (
            <Text style={styles.seeMore}>
              +{expiringProducts.length - 3} {t('moreProducts')}
            </Text>
          )}
        </View>
      )}

      {/* Consejo del día */}
      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={20} color={colors.primary} />
        <Text style={styles.tipText}>
          {t('planMeals')}
        </Text>
      </View>

      {/* Estadísticas de impacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('yourImpact')}</Text>
        <View style={styles.impactStats}>
          <View style={styles.impactItem}>
            <Ionicons name="leaf-outline" size={20} color={colors.success} />
            <Text style={styles.impactText}>
              {t('avoidedWaste')} {expiringProducts.length} {t('product')}
            </Text>
          </View>
          <View style={styles.impactItem}>
            <Ionicons name="cash-outline" size={20} color={colors.success} />
            <Text style={styles.impactText}>
              {t('estimatedSavings')}: ${(expiringProducts.length * 5).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  expiringList: {
    marginBottom: 8,
  },
  expiringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  expiringText: {
    marginLeft: 8,
    color: colors.accent,
    fontSize: 14,
  },
  seeMore: {
    color: colors.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipText: {
    marginLeft: 12,
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontStyle: 'italic',
  },
  impactStats: {
    gap: 12,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    marginLeft: 12,
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
});