import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import CInput from "../components/CInput";
import CButton from "../components/CButton";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../infoutils/theme";
import { useClient } from "../hooksredux/useClient"; 
import { useAuth } from "../contexts/AuthContexts"; 

export default function RegisterScreen({ navigation }: any) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { t } = useLanguage();

    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { theme } = useTheme();
    const colors = getThemeColors(theme);
    const styles = getStyles(colors);

    // hooks
    const { saveClientProfile } = useClient();
    const { login } = useAuth();

    const handleRegisterToTabs = () => {
        try {
            // validar campos
            if (!fullName.trim() || !email.trim() || !password.trim()) {
                Alert.alert("Error", "Por favor completa todos los campos obligatorios");
                return;
            }

            if (password !== confirmPassword) {
                Alert.alert("Error", "Las contraseñas no coinciden");
                return;
            }

            // guardar en redux ClientSlice
            saveClientProfile({
                fullName,
                email,
                phone,
                birthDate
            });

            // Auth de usuario
            const authSuccess = login(email, password);
            
            if (authSuccess) {
                // Redireccion a home con los datos usando redux
                navigation.replace('Tabs', { 
                    screen: 'Home',
                    params: { 
                        userEmail: email,
                        userName: fullName 
                    }
                });
            } else {
                Alert.alert("Error", "No se pudo completar el registro");
            }
            
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Ocurrió un error durante el registro");
        }
    };

    const openDatePicker = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);

        if (date) {
            setSelectedDate(date);
            const formatted = date.toISOString().split("T")[0];
            setBirthDate(formatted);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.titletxt}>Crea tu usuario</Text>

                <CInput
                    value={fullName}
                    type='text'
                    placeholder='Nombre completo'
                    onChangeText={setFullName}
                    icon={<Ionicons name="person-circle-outline" size={22} color={colors.text} />}
                />

                <CInput
                    value={email}
                    type='email'
                    placeholder='Correo electrónico'
                    onChangeText={setEmail}
                    icon={<Ionicons name="mail-outline" size={22} color={colors.text} />}
                />

                <CInput
                    value={password}
                    type='password'
                    placeholder='Contraseña'
                    onChangeText={setPassword}
                    icon={<Ionicons name="lock-closed-outline" size={22} color={colors.text} />}
                />

                <CInput
                    value={confirmPassword}
                    type='password'
                    placeholder='Confirmar contraseña'
                    onChangeText={setConfirmPassword}
                    icon={<Ionicons name="lock-closed-outline" size={22} color={colors.text} />}
                />

                <CInput
                    value={phone}
                    type='number'
                    placeholder='Teléfono'
                    onChangeText={setPhone}
                    icon={<Ionicons name="call-outline" size={22} color={colors.text} />}
                />

                {/* Fecha de nacimiento */}
                <TouchableOpacity onPress={openDatePicker}>
                    <CInput
                        value={birthDate}
                        type='text'
                        placeholder='Fecha de nacimiento (YYYY-MM-DD)'
                        editable={false}
                        icon={<Ionicons name="calendar-outline" size={22} color={colors.text} />}
                    />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        mode="date"
                        value={selectedDate}
                        maximumDate={new Date()} // para que no elijan futuro
                        onChange={onDateChange}
                    />
                )}

                <CButton 
                    title={'Registrarme'} 
                    onPress={handleRegisterToTabs} 
                    disabled={!fullName || !email || !password || !confirmPassword}
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
        borderRadius: 15,
        padding: 30,
        width: '85%',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    titletxt: {
        fontWeight: 'bold',
        fontSize: 21,
        textAlign: 'center',
        marginBottom: 20,
        color: colors.text,
    }
});