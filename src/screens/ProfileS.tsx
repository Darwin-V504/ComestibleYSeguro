
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Image } from 'react-native';
import CButton from '../components/CButton';
import { useAuth } from '../contexts/AuthContexts';
import { useInventory } from '../hooksredux/useInventory';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getThemeColors } from '../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useClient } from '../hooksredux/useClient';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { useState, useEffect } from 'react';

export default function ProfileScreen({ navigation }: any) {
    const { logout, user, isAllowed } = useAuth();
    const { inventory } = useInventory();
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage, t } = useLanguage();
    const { client, updateProfilePicture } = useClient(); 
    const colors = getThemeColors(theme);
    const styles = getStyles(colors);

    const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

    const expiringProducts = inventory.filter(item => {
        const today = new Date();
        const inTwoDays = new Date();
        inTwoDays.setDate(today.getDate() + 2);
        const expirationDate = new Date(item.expirationDate);
        return expirationDate <= inTwoDays && expirationDate >= today;
    });

    const totalProducts = inventory.length;

    // solicitar permisos de galeria
    useEffect(() => {
        (async () => {
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasGalleryPermission(galleryStatus.status === 'granted');
        })();
    }, []);

    // seleccionar imagen
    const pickImage = async () => {
        if (hasGalleryPermission === false) {
            Alert.alert(
                t('permissionRequired'),
                t('needGalleryAccess'),
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('openSettings'), onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                updateProfilePicture(selectedImage.uri);
                
                Alert.alert(t('success'), t('photoUpdateSuccess'));
            }
        } catch (error) {
            console.error("Error seleccionando imagen:", error);
            Alert.alert(t('error'), t('galleryError'));
        }
    };

    // tomar foto con traducciones
    const takePhoto = async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        
        if (cameraStatus.status !== 'granted') {
            Alert.alert(
                t('permissionRequired'),
                t('needCameraAccess'),
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('openSettings'), onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        try {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const takenPhoto = result.assets[0];
                updateProfilePicture(takenPhoto.uri);
                
                Alert.alert(t('success'), t('photoUpdateSuccess'));
            }
        } catch (error) {
            console.error("Error tomando foto:", error);
            Alert.alert(t('error'), t('cameraError'));
        }
    };

    // Cambiar foto con traducciones
    const showImageOptions = () => {
        Alert.alert(
            t('changeProfilePhoto'),
            t('selectPhotoSource'),
            [
                {
                    text: t('takePhoto'),
                    onPress: takePhoto
                },
                {
                    text: t('chooseFromGallery'),
                    onPress: pickImage
                },
                {
                    text: t('cancel'),
                    style: "cancel"
                }
            ]
        );
    };

    const handleLogout = () => {    
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Index' }],
        });
    };

    return (
        <ScrollView style={styles.container}>
           
            <View style={styles.header}>
                {/* Icono de foto */}
                <TouchableOpacity onPress={showImageOptions} style={styles.avatarContainer}>
                    {client.profileImage ? (
                        <Image 
                            source={{ uri: client.profileImage }} 
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color={colors.white} />
                        </View>
                    )}
                    {/* Editar foto de perfil */}
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={16} color={colors.white} />
                    </View>
                </TouchableOpacity>

                <Text style={styles.userEmail}>
                    {client.name || user?.email || t('welcome')}
                </Text>
                <Text style={styles.userStatus}>
                    {isAllowed ? t('connected') : t('disconnected')}
                </Text>
            </View>

            

            {/* estadisticas */}
            <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>{t('yourStats')}</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Ionicons name="cube" size={24} color={colors.primary} />
                        <Text style={styles.statNumber}>{totalProducts}</Text>
                        <Text style={styles.statLabel}>{t('productsManaged')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="warning" size={24} color={colors.accent} />
                        <Text style={styles.statNumber}>{expiringProducts.length}</Text>
                        <Text style={styles.statLabel}>{t('avoidingWaste')}</Text>
                    </View>
                </View>
            </View>

            {/* Config de idioma */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>{t('language')}</Text>
                <View style={styles.languageSetting}>
                    <View style={styles.languageInfo}>
                        <Ionicons name="language" size={24} color={colors.primary} />
                        <View style={styles.languageText}>
                            <Text style={styles.languageLabel}>{t('currentLanguage')}</Text>
                            <Text style={styles.languageDescription}>
                                {language === 'es' ? t('spanish') : t('english')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.languageButtons}>
                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                language === 'es' && styles.languageButtonActive
                            ]}
                            onPress={() => changeLanguage('es')}
                        >
                            <Text style={[
                                styles.languageButtonText,
                                language === 'es' && styles.languageButtonTextActive
                            ]}>
                                ES
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                language === 'en' && styles.languageButtonActive
                            ]}
                            onPress={() => changeLanguage('en')}
                        >
                            <Text style={[
                                styles.languageButtonText,
                                language === 'en' && styles.languageButtonTextActive
                            ]}>
                                EN
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* config de tema */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>{t('appearance')}</Text>
                <View style={styles.themeSetting}>
                    <View style={styles.themeInfo}>
                        <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.primary} />
                        <View style={styles.themeText}>
                            <Text style={styles.themeLabel}>
                                {theme === 'dark' ? t('darkMode') : t('lightMode')}
                            </Text>
                            <Text style={styles.themeDescription}>
                                {t('themeActivated')}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: colors.lightGray, true: colors.primarySoft }}
                        thumbColor={theme === 'dark' ? colors.primary : colors.white}
                    />
                </View>
            </View>

            {/* actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>{t('actions')}</Text>
                <CButton
                    title={t('quickScan')}
                    onPress={() => navigation.navigate('ScanProduct')}
                    variant="primary"
                />
                <CButton
                    title={t('viewMyPantry')}
                    onPress={() => navigation.navigate('Tabs', { screen: 'Inventory' })}
                    variant="secondary"
                />
                <CButton
                    title={t('suggestedRecipesBtn')}
                    onPress={() => navigation.navigate('Recipes')}
                    variant="tertiary"
                />
            </View>

            {/* logout */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>{t('session')}</Text>
                <CButton
                    title={t('logout')}
                    onPress={handleLogout}
                    variant="secondary"
                />
            </View>

            {/* info app */}
            <View style={styles.infoSection}>
                <Text style={styles.appName}>Comestible y Seguro</Text>
                <Text style={styles.appDescription}>
                    {t('reducingWaste')}
                </Text>
                <Text style={styles.appVersion}>{t('version')} 1.2</Text>
            </View>
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.primary,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.white,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    userEmail: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
        textAlign: 'center',
    },
    userStatus: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
    },
    statsSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 0.48,
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
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
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    settingsSection: {
        padding: 20,
    },
    languageSetting: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    languageText: {
        marginLeft: 12,
        flex: 1,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    languageDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    languageButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    languageButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colors.backgroundAlt,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    languageButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    languageButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    languageButtonTextActive: {
        color: colors.white,
    },
    themeSetting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    themeText: {
        marginLeft: 12,
    },
    themeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    themeDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    actionsSection: {
        padding: 20,
        gap: 12,
    },
    infoSection: {
        alignItems: 'center',
        padding: 20,
        marginBottom: 20,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    appDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    appVersion: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 8,
    },
});