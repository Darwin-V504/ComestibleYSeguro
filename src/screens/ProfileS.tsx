import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import CButton from '../components/CButton';
import { useAuth } from '../contexts/AuthContexts';
import { useInventory } from '../hooksredux/useInventory';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getThemeColors } from '../infoutils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
    const { logout, user, isAllowed } = useAuth();
    const { inventory } = useInventory();
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage, t } = useLanguage();
    const colors = getThemeColors(theme);
    const styles = getStyles(colors);

    const expiringProducts = inventory.filter(item => {
        const today = new Date();
        const inTwoDays = new Date();
        inTwoDays.setDate(today.getDate() + 2);
        const expirationDate = new Date(item.expirationDate);
        return expirationDate <= inTwoDays && expirationDate >= today;
    });

    const totalProducts = inventory.length;

    const handleLogout = () => {    
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Index' }],
        });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color={colors.white} />
                </View>
                <Text style={styles.userEmail}>
                    {user?.email || t('welcome')}
                </Text>
                <Text style={styles.userStatus}>
                    {isAllowed ? t('connected') : t('disconnected')}
                </Text>
            </View>

            {/* Estadísticas */}
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

            {/* Configuración de Idioma */}
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

            {/* Configuración de Tema */}
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

            {/* Acciones */}
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

            {/* Cerrar Sesión */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>{t('session')}</Text>
                <CButton
                    title={t('logout')}
                    onPress={handleLogout}
                    variant="secondary"
                />
            </View>

            {/* Información de la App */}
            <View style={styles.infoSection}>
                <Text style={styles.appName}>Comestible y Seguro</Text>
                <Text style={styles.appDescription}>
                    {t('reducingWaste')}
                </Text>
                <Text style={styles.appVersion}>{t('version')} 1.0.0</Text>
               
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
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userEmail: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
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