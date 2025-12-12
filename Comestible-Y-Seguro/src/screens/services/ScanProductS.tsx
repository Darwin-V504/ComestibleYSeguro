import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import CButton from '../../components/CButton';
import { useInventory } from '../../hooksredux/useInventory';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getThemeColors } from '../../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/supabaseServices';

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setCameraActive(false);
    
    try {
      // Buscar producto en Supabase
      const productData = await productService.getProductByBarcode(data);
      
      if (productData) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + productData.typical_expiration_days);
        
        const newProduct = {
          id: productData.id, // Usar ID de Supabase
          barcode: productData.barcode,
          name: productData.name,
          category: 'otros' as any,
        };

        addProduct(newProduct, expirationDate);
        
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
    } catch (error) {
      console.error('Error escaneando producto:', error);
      Alert.alert(
        "Error",
        "Error al buscar el producto. Intenta de nuevo."
      );
      setScanned(false);
      setCameraActive(true);
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