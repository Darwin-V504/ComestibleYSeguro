import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContexts";
import { Ionicons } from "@expo/vector-icons"; 
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../infoutils/theme";

//props de menuItem que nos ayudan a controlar las pantallas y el auth
type MenuItem = {
  title: string;
  screen: string;
  requiresAuth: boolean;
  Exit: boolean;
  onPress?: () => void; 
};

export default function IndexS({navigation }: any) {
//crear estado para controlar si el menu esta abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAllowed, logout } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  //Funcion para cerrar sesion desde indexS
  const handleLogout = () => {    
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  }

// establecer los items del menu con sus props de MenuItem
  const menuItems: MenuItem[] = [
    { title: "Login", screen: "Login", requiresAuth: false, Exit: false },
    { title: "Register", screen: "Register", requiresAuth: false, Exit: false },
    { title: "Home", screen: "Tabs", requiresAuth: true, Exit: true },
    { 
      title: "Cerrar Sesión", 
      screen: "Index", 
      requiresAuth: true, 
      Exit: true,
      onPress: handleLogout // asignar handleLogout
    },
  ];

// funcion flecha para abrir pantallas del menu, se manda en parametros los items de MenuItem
  const handleMenuPress = (item: MenuItem) => {
    //  Si tiene onPress el title que lo ejecute
    if (item.onPress) {
      item.onPress();
    } else if (item.requiresAuth && !isAllowed) {
      // Si requiere auth y no está logueado, redirigir a Login
      navigation.navigate("Login" as never);
    } else {
      // Si está logueado o no requiere auth, ir a la pantalla directamente
      navigation.navigate(item.screen as never);
    }
    //Para cerrar menu al seleccionar una opcion
    setIsMenuOpen(false);
  };

  /// funcion flecha para cambiar estado del menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

   return (
    <View style={styles.container}>
        {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido a Comestible y Seguro</Text>
        <Text style={styles.subtitle}>
          {isAllowed 
            ? `Hola ${user?.email}, estás conectado` : "Explora todas las funciones - Inicia sesión cuando lo necesites"
          }
        </Text>
      </View>
      
      {/* Botón del menu con Ionicons */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Menú lateral */}
      {isMenuOpen && (
        <View style={styles.menuOverlay}>
          <View style={styles.menuPanel}>
            {/* Header del menú con ícono de cerrar */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                style={styles.closeIconButton}
                onPress={() => setIsMenuOpen(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {user && (
              <Text style={styles.userInfo}>
                Conectado como: {user.email}
              </Text>
            )}

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item)}
              >
                <Text style={styles.menuItemText}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.overlayBackground} 
            onPress={() => setIsMenuOpen(false)}
          />
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
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row-reverse',
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    width: 280,
    backgroundColor: colors.card,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeIconButton: {
    padding: 5,
  },
  userInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 18,
    color: colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});