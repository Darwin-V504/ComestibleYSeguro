import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type Props = {
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    value: string;
    placeholder: string;
    onChangeText?: (text: string) => void;
    editable?: boolean;
    icon?: React.ReactNode;
};

export default function CInput({
    type = "text",
    required,
    value,
    placeholder,
    onChangeText,
    editable = true,       
    icon,              
}: Props) {

    const [isSecureText, setIsSecureText] = useState(type === "password");
    const isPasswordField = type === "password";

    // icono por defecto solo si NO mandas uno manual
    const defaultIcon = type === "email" ? "email" :
                        type === "password" ? "lock" :
                        null;

    const keyboardType: KeyboardTypeOptions =
        type === "email" ? "email-address" :
            type === "number" ? "numeric" :
                "default";

    const getError = () => {
        if (type === "email" && !value.includes("@")) return "Correo inválido";
        if (type === "password" && value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
        return "";
    };

    const error = getError();

    return (
        <View style={styles.wrapper}>

            {/* INPUT */}
            <View style={[styles.inputContainer, error && styles.inputError]}>

                {/* ICONO IZQUIERDO */}
                {icon ? (
                    <View style={{ marginRight: 10 }}>
                        {icon}
                    </View>
                ) : (
                    defaultIcon && (
                        <MaterialIcons
                            name={defaultIcon as any}
                            size={20}
                            color="#000000"
                            style={{ marginRight: 10 }}
                        />
                    )
                )}

                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isSecureText}
                    editable={editable}                 // 👈 AHORA FUNCIONA
                    keyboardType={keyboardType}
                    style={styles.input}
                />

                {/* BOTÓN OJO SOLO SI ES PASSWORD */}
                {isPasswordField && (
                    <TouchableOpacity
                        onPress={() => setIsSecureText(!isSecureText)}
                    >
                        <Ionicons
                            name={isSecureText ? "eye" : "eye-off"}
                            size={22}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* ERROR */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 13,
        backgroundColor: "#f9f9f9",
    },
    input: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        flex: 1, // 👈 mejora para que no rompa el layout
    },
    inputError: {
        borderColor: "red",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 3,
        marginLeft: 5,
    },
});
