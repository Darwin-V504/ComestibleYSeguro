import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import StackNavigator from './src/navigation/StackNavigator';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider } from './src/contexts/AuthContexts';
import { store } from './src/store';
// Cambiando rama default de main a master, hacer commit push para verificar si todo está correcto
// Componente para el StatusBar dinámico
function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <NavigationContainer>
            <AuthProvider>
              <StackNavigator />
            </AuthProvider>
          </NavigationContainer>
        </ThemeProvider>
      </LanguageProvider>
    </Provider>
  );
}