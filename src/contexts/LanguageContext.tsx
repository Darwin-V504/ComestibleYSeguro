import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18n } from "i18n-js";
import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../infoutils/translations";

type Language = 'es' | 'en';

type LanguageContextProps = {
    language: Language;
    changeLanguage: (lng: Language) => void;
    t: (key: string) => string;
}

const i18n = new I18n(translations);

// CORREGIDO: Español por defecto en lugar de inglés
i18n.defaultLocale = "es";
i18n.enableFallback = true;

const LanguageContext = createContext<LanguageContextProps | null>(null);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage debe usarse dentro de LanguageProvider")
    return context; 
}

export const LanguageProvider = ({children}: {children: React.ReactNode}) => {
    // CORREGIDO: Español por defecto
    const [language, setLanguage] = useState<Language>("es");

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem("language");
                if (storedLanguage === 'es' || storedLanguage === 'en') {
                    setLanguage(storedLanguage as Language);
                    i18n.locale = storedLanguage;
                } else {
                    // Si no hay idioma guardado, usar español por defecto
                    i18n.locale = "es";
                }
            } catch (error) {
                console.log('Error loading language:', error);
                // En caso de error, usar español por defecto
                i18n.locale = "es";
            }
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (lng: Language) => {
        setLanguage(lng);
        i18n.locale = lng;
        try {
            await AsyncStorage.setItem("language", lng);
        } catch (error) {
            console.log('Error saving language:', error);
        }
    }

    const t = (key: string) => {
        return i18n.t(key);
    }

    return(
        <LanguageContext.Provider value={{language, changeLanguage, t}}>
            {children}
        </LanguageContext.Provider>
    );
}

export { i18n };