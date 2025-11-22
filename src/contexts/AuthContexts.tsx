import {View,Text,StyleSheet} from 'react-native';
import  { createContext, useState, ReactNode, useContext } from 'react';
import { navigationRef } from '../navigation/NavigationService';
import { RootStackParamList } from '../navigation/StackNavigator';

type User = {
    email: string;
    
} | null;
type AuthContextType = {
    user: User | null;
    isAllowed: boolean;
    login: (email: string, password: string ) => boolean;
    logout: () => void;
};
 const AuthContext = createContext<AuthContextType | null >(null);
 export const useAuth = () => {
    const context =  useContext(AuthContext);
    if (!context) throw new Error('useAuth debe estar dentro de AuthProvider');
    return context;
    
 }
   export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User>(null);
    const [isAllowed, setIsAllowed] = useState<boolean>(false);

    const login = (email: string): boolean => {
        const allowed = email.endsWith('.com');
        if (allowed) {
            setUser({email});
            setIsAllowed(allowed);
        }
        console.log("auth context: + "+allowed);
        return allowed;
    };
    const logout = () => {
        setUser(null);
        setIsAllowed (false);
    }

    return(
        <AuthContext.Provider value= {{user, isAllowed, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
   }
   
