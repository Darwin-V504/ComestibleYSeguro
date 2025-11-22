import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import CInput from "../components/CInput";
import CButton from "../components/CButton";
import { useAuth } from "../contexts/AuthContexts";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getThemeColors } from "../infoutils/theme";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAllowed } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const styles = getStyles(colors);

  const isLoginDisabled = () => {
    return email.trim() === '' || password.trim() === '';
  };

  const handleLogin = () => {
    try {
      const allowed = login(email, password);
      if (allowed) {
        navigation.replace('Tabs', { email });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegister = () => {
    try {
      navigation.navigate('Register');
    } catch (error) {
      console.log("No hay redirección " + error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('signIn')}</Text>
        <CInput
          value={email}
          type='email'
          placeholder={t('email')}
          onChangeText={setEmail}
        />
        <CInput
          value={password}
          type='password'
          placeholder={t('password')}
          onChangeText={setPassword}
        />
        <CButton
          title={t('login')}
          onPress={handleLogin}
          disabled={isLoginDisabled()}
          size="medium"
        />
        <CButton
          title={t('createAccount')}
          variant='tertiary'
          onPress={handleRegister}
          size="medium"
        />
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  }
});