import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform } from "react-native";
import CInput from "../components/CInput";
import CButton from "../components/CButton";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../infoutils/theme";

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


    const handleRegisterToTabs = () => {
            try {
                navigation.navigate('Index', { email });
            } catch (error) {
                console.log(error);
            }
        }

        return(
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.titletxt}> Crea tu usuario</Text>
                    <CInput
                        value={fullName}
                        type='text'
                        placeholder={'Nombre completo'}
                        onChangeText={setFullName} />
                    <CInput
                        value={email}
                        type='email'
                        placeholder={'Correo electronico'}
                        onChangeText={setEmail}/>
                    <CInput
                        value={password}
                        type='password'
                        placeholder={'Contraseña'}
                        onChangeText={setPassword} />
                    <CInput
                        value={confirmPassword}
                        type='password'
                        placeholder={'Confirmar contraseña'}
                        onChangeText={setConfirmPassword} />
                    <CInput
                        value={phone}
                        type='number'
                        placeholder={'Telefono'}
                        onChangeText={setPhone} />
                    <CInput
                        value={birthDate}
                        type='text'
                        placeholder={'Fecha de nacimiento (YYYY-MM-DD)'}
                        onChangeText={setBirthDate} />

                    <CButton title={'Registrarme'} onPress={handleRegisterToTabs} />
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