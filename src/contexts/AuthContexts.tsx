import { View, Text, StyleSheet, Alert } from 'react-native';
import { createContext, useState, ReactNode, useContext } from 'react';
import { navigationRef } from '../navigation/NavigationService';
import { RootStackParamList } from '../navigation/StackNavigator';
import { supabase } from '../services/supabaseClient';
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

type User = {
    id: string;
    email?: string;
    token: string;
} | null;

type AuthContextType = {
    user: User | null;
    isAllowed: boolean;
    login: (email: string, password: string) => Promise<boolean>; 
    logout: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<boolean>; 
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe estar dentro de AuthProvider');
    return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    //Completar el useEffect para utilizarlo
    useEffect(() => {
        const restoreSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession(); 
            
            if (session && session.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || undefined,
                    token: session.access_token,
                });
                setIsAllowed(true);
            }
        };
        restoreSession();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                Alert.alert("Error al iniciar sesión", error.message);
                return false;
            }
            
            if (data.session && data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email || undefined,
                    token: data.session.access_token,
                });
                setIsAllowed(true);
                return true;
            }
        

            
            return false;
        } catch (error) {
            Alert.alert("Error", "Error inesperado al iniciar sesión");
            return false;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAllowed(false);
    }
    //Para registro
    const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            Alert.alert("Error en registro", error.message);
            return false;
        }
        
        if (data.user) {
            // Usuario creado exitosamente
            return true;
        }
        
        return false;
    } catch (error) {
        Alert.alert("Error", "Error inesperado en el registro");
        return false;
    }
};

    return (
        <AuthContext.Provider value={{ user, isAllowed, login, logout, signUp }}>
            {children}
        </AuthContext.Provider>
    );
}