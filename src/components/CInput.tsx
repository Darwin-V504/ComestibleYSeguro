import { Button,KeyboardTypeOptions,StyleSheet,Text, TextInput, Touchable, TouchableOpacity, View } from "react-native";
import {MaterialIcons, Ionicons} from "@expo/vector-icons";
import { useState } from "react";

type Props = {
    required? : boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    value: string;
    placeholder : string;
    onChangeText: (text: string) => void;
}

export default function CInput ({type = "text", required, value, placeholder, onChangeText}: Props){
    const [isSecureText, setIsSecureText] = useState(type === "password");
    const isPasswordField = type === 'password';
   
    const icon = type === 'email' ? 'email' : 
                    type === 'password' ? 'lock' : ''

    const keyboardType: KeyboardTypeOptions = 
        type==='email'? 'email-address' : 
        type === 'number' ? 'numeric' :
        'default';

        //funcion para calcular errores de validacion
        //output: string
    const getError = () => {
        if (type === 'email' && !value.includes('@')) return 'Correo invalido';
        if (type === 'password' && value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        // validar campos obligatorios
    }
    const error = getError();    
    return(
        //wrapper
        <View style={styles.wrapper}>
            {/* //inputContainer */}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <MaterialIcons name={icon as any } size={20} color="#000000" />
                <TextInput 
                 placeholder={placeholder}
                 value={value} 
                 onChangeText={onChangeText}
                 onBlur={()=>{}}
                 secureTextEntry={isSecureText}
                 style={styles.input}
                 />
                
              { isPasswordField && <TouchableOpacity 
                    onPress={
                        ()=>{
                            setIsSecureText(!isSecureText);
                        }
                    }
                > 
                    <Ionicons name={isSecureText ? 'eye' : 'eye-off'} size={22} />
                </TouchableOpacity>}
            </View>
            { error && <Text style={styles.inputError}> {error} </Text>}
        </View>
    );
}

const styles = StyleSheet.create({
   wrapper:{
        marginBottom: 10,
   },
    inputContainer: {
        //distribucion de componentes
        flexDirection: 'row',
        alignItems: 'center',
        //estilizacion de input
        borderWidth: 1,
        borderColor:'#ccc',
        borderRadius: 8, 
        paddingHorizontal: 13,
        backgroundColor: '#f9f9f9',
    },
    input:{
        //agregando espacio al componente input nativo
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '80%',
    },
    inputError: {
        borderColor: 'red',
        color: 'red'
    }
})