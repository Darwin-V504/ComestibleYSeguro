import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import CButton from '../../components/CButton';
import { useInventory } from '../../hooksredux/useInventory';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';

// Definir el tipo para la base de datos de productos
type ProductDatabase = {
  [key: string]: {
    name: string;
    category: string;
    expirationDays: number;
  };
};
type update = {

}

// Informacion de Codigo de barras personalizado para codigos de barra EAN13
const PRODUCT_DATABASE: ProductDatabase = {
  '104590705201': { name: 'Oreo', category: 'otros', expirationDays: 7 },
  '129304301933': { name: 'Leche', category: 'lácteos', expirationDays: 7},
  '114678134562': { name: 'Pan Integral', category: 'granos', expirationDays: 5 },
  '112185028403': { name: 'Manzanas', category: 'frutas', expirationDays: 14 },
  '119583019484': { name: 'Pechuga de Pollo', category: 'carnes', expirationDays: 3 },
  '129059284055': { name: 'Zanahorias', category: 'verduras', expirationDays: 10 },
};

export default function ScanProductScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const { addProduct } = useInventory();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setCameraActive(false);

    // Usar solo los primeros 12 dígitos
    const baseCode = data.substring(0, 12);

    const productData = PRODUCT_DATABASE[baseCode];

    if (productData) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + productData.expirationDays);

      const newProduct = {
        id: Date.now().toString(),
        barcode: data,
        name: productData.name,
        category: productData.category as any,
      };

      addProduct(newProduct, expirationDate,);

      Alert.alert(
        t('productAdded'),
        `${productData.name} ${t('addedToPantry')}`,
        [
          {
            text: t('continue'),
            onPress: () => {
              setScanned(false);
              setCameraActive(true);
            }
          },
          {
            text: t('viewPantry'),
            onPress: () => navigation.navigate('Tabs', { screen: 'Inventory' })
          }
        ]
      );
    } else {
      Alert.alert(
        t('productNotFound'),
        t('productNotFoundMessage'),
        [
          {
            text: t('tryAgain'),
            onPress: () => {
              setScanned(false);
              setCameraActive(true);
            }
          },
          {
            text: t('addManually'),
            onPress: () => navigation.navigate('ManualAdd')
          }
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{t('requestingPermission')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{t('cameraPermission')}</Text>
        <CButton title={t('grantPermission')} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraActive ? (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>{t('focusBarcode')}</Text>
          </View>
        </CameraView>
      ) : (
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.placeholderText}>{t('cameraInactive')}</Text>
        </View>
      )}

      <View style={styles.controls}>
        <CButton
          title={cameraActive ? t('stopScan') : t('startScan')}
          onPress={() => {
            setCameraActive(!cameraActive);
            setScanned(false);
          }}
          variant={cameraActive ? 'secondary' : 'primary'}
        />
        <CButton
          title={t('addManually')}
          onPress={() => navigation.navigate('ManualAdd')}
          variant="tertiary"
        />
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scanText: {
    marginTop: 20,
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  placeholderText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  controls: {
    padding: 16,
    backgroundColor: colors.card,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
});