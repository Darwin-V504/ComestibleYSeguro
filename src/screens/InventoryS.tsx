import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useState } from 'react';
import CButton from '../components/CButton';
import ProductCard from '../components/ProductCard';
import { useInventory } from '../hooksredux/useInventory'; 
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getThemeColors } from '../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen({ navigation }: any) {
  const { inventory, removeProduct, updateQuantity } = useInventory(); 
  const [filter, setFilter] = useState<'all' | 'expiring'>('all');
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  const filteredInventory = filter === 'expiring'
    ? inventory.filter(item => {
        const today = new Date();
        const inFourDays = new Date();
        inFourDays.setDate(today.getDate() + 4);
        const expDate = new Date(item.expirationDate);
        
        return !isNaN(expDate.getTime()) && expDate <= inFourDays && expDate >= today;
      })
    : inventory;

  const handleRemoveProduct = (id: string) => {
    Alert.alert(
      t('deleteProduct'),
      t('confirmDelete'),
      [
        { text: t('cancel'), style: "cancel" },
        { text: t('delete'), onPress: () => removeProduct(id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('myPantryTitle')}</Text>
        <CButton
          title={t('scanNew')}
          onPress={() => navigation.navigate('ScanProduct')}
          variant="primary"
          size="small"
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <CButton
          title={t('all')}
          onPress={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'tertiary'}
          size="small"
        />
        <CButton
          title={t('expiring')}
          onPress={() => setFilter('expiring')}
          variant={filter === 'expiring' ? 'primary' : 'tertiary'}
          size="small"
        />
      </View>

      {/* Lista de productos */}
      {filteredInventory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            {filter === 'expiring'
              ? t('noExpiring')
              : t('emptyPantry')}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === 'expiring'
              ? t('expiringInDays')
              : t('scanToAdd')}
          </Text>
          <CButton
            title={t('scanFirstProduct')}
            onPress={() => navigation.navigate('ScanProduct')}
            size="medium"
          />
        </View>
      ) : (
        <FlatList
          data={filteredInventory}
          keyExtractor={(item) => item.product.id}
          renderItem={({ item }) => {
            // convert serializable date strings to Date objects so they match InventoryItem types
            const convertedItem = {
              ...item,
              addedDate: new Date(item.addedDate),
              expirationDate:
                typeof item.expirationDate === 'string'
                  ? new Date(item.expirationDate)
                  : item.expirationDate,
            } as any;
            return (
              <ProductCard
                item={convertedItem}
                onRemove={handleRemoveProduct}
                onUpdateQuantity={updateQuantity}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});