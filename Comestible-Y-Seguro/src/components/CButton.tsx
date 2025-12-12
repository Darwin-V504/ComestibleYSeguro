import { StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../infoutils/theme";

type Props = {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "tertiary";
    disabled?: boolean;
    size?: "small" | "medium" | "large";
};

const { width } = Dimensions.get('window');

export default function CButton({ 
    title, 
    onPress, 
    variant = "primary", 
    disabled = false,
    size = "medium" 
}: Props) {
    const { theme } = useTheme();
    const colors = getThemeColors(theme);
    const styles = getStyles(variant, disabled, size, colors);

    return (
        <TouchableOpacity 
            style={[styles.button, disabled && styles.disabled]} 
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.buttonTitle}>{title}</Text>
        </TouchableOpacity>
    );
} 

const getStyles = (
    variant: 'primary' | 'secondary' | 'tertiary', 
    disabled: boolean,
    size: 'small' | 'medium' | 'large',
    colors: any
) => {
    const sizeStyles = {
        small: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            width: width * 0.4,
        },
        medium: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            width: width * 0.7,
        },
        large: {
            paddingVertical: 16,
            paddingHorizontal: 24,
            width: width * 0.85,
        }
    };

    return StyleSheet.create({
        button: {
            borderRadius: 8,
            marginBottom: 8,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.black,
            shadowOffset: {
                width: 0,
                height: variant === 'primary' ? 2 : 1,
            },
            shadowOpacity: variant === 'primary' ? 0.2 : 0.1,
            shadowRadius: variant === 'primary' ? 4 : 2,
            elevation: variant === 'primary' ? 4 : 2,
            
            ...sizeStyles[size],
            
            backgroundColor: 
                variant === "primary" ? colors.primary : 
                variant === "secondary" ? colors.primarySoft : 
                colors.card,
            
            borderWidth: variant === "tertiary" ? 1 : 0,
            borderColor: variant === "tertiary" ? colors.primary : 'transparent',
        }, 
        buttonTitle: {
            color: 
                variant === 'primary' ? colors.white : 
                variant === 'secondary' ? colors.text : 
                colors.primary,
            fontWeight: '600',
            fontSize: size === 'small' ? 14 : 16,
            letterSpacing: 0.3,
        },
        disabled: {
            backgroundColor: colors.border,
            borderColor: colors.border,
            shadowOpacity: 0,
            elevation: 0,
        }
    });
};