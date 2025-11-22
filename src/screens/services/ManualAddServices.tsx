import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import { useInventory } from '../../hooksredux/useInventory';
import { Product, ProductCategory } from '../../infoutils/types/Products';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';

const CATEGORIES: ProductCategory[] = [
  'lacteos', 'carnes', 'verduras', 'frutas', 'granos', 'bebidas', 'otros'
];

export default function ManualAddScreen({ navigation }: any) {
  const { addProduct } = useInventory();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  const [productName, setProductName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('otros');
  const [expirationDays, setExpirationDays] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAddProduct = () => {
    if (!productName.trim()) {
      Alert.alert(
        t('error'),
        t('pleaseEnterName')
      );
      return;
    }

    if (!expirationDays || parseInt(expirationDays) <= 0) {
      Alert.alert(
        t('error'),
        t('invalidDays')
      );
      return;
    } else if (!expirationDays || parseInt(expirationDays) >= 365) {
      Alert.alert(
        t('error'),
        t('invalidDays')
      );
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert(
        t('error'),
        t('invalidQuantity')
      );
      return;
    } else if (!quantity || parseInt(quantity) >= 80) {
      Alert.alert(
        t('error'),
        t('invalidQuantity')
      );
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      barcode: `manual_${Date.now()}`,
      name: productName.trim(),
      category: selectedCategory,
    };

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(expirationDays));

    addProduct(newProduct, expirationDate, parseInt(quantity));

    const unitText = parseInt(quantity) > 1 ? t('product') : t('product');

    Alert.alert(
      t('productAdded'),
      `${productName} (${quantity} ${unitText}) ${t('addedToPantry')}`,
      [
        {
          text: t('keepAdding'),
          onPress: () => {
            setProductName('');
            setExpirationDays('7');
            setQuantity('1');
          }
        },
        {
          text: t('viewPantry'),
          onPress: () => navigation.navigate('Tabs', { screen: 'Inventory' })
        }
      ]
    );
  };

  const isFormValid = productName.trim() !== '' && expirationDays !== '' && quantity !== '';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('addProductManually')}</Text>

        <CInput
          value={productName}
          type='text'
          placeholder={t('productName')}
          onChangeText={setProductName}
        />

        <View style={styles.section}>
          <Text style={styles.label}>{t('category')}</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <CButton
                key={category}
                title={t(category)}
                onPress={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'primary' : 'tertiary'}
                size="small"
              />
            ))}
          </View>
        </View>

        <CInput
          value={quantity}
          type='number'
          placeholder={t('quantity')}
          onChangeText={setQuantity}
          required
        />

        <CInput
          value={expirationDays}
          type='number'
          placeholder={t('daysUntilExpire')}
          onChangeText={setExpirationDays}
          required
        />

        <View style={styles.buttonsContainer}>
          <CButton
            title={t('cancel')}
            onPress={() => navigation.goBack()}
            variant="tertiary"
            size="small"
          />
          <CButton
            title={t('addProduct')}
            onPress={handleAddProduct}
            disabled={!isFormValid}
            size="small"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
});