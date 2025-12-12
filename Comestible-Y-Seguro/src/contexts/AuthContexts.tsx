import { Alert } from 'react-native';
import { createContext, useState,  useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import { useEffect } from 'react';
import { profileService } from '../services/supabaseServices';

type User = {
  id: string;
  email?: string;
  token: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  profile_image_url?: string;
} | null;

type AuthContextType = {
  user: User | null;
  isAllowed: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, profileData?: any) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<void>;
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

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
        
      if (session && session.user) {
        try {
        // Cargar perfil del usuario
        
          const profile = await profileService.getCurrentProfile();
          
          setUser({
            id: session.user.id,
            email: session.user.email || undefined,
            token: session.access_token,
            full_name: profile?.full_name,
            phone: profile?.phone,
            birth_date: profile?.birth_date,
            profile_image_url: profile?.profile_image_url
          });
          setIsAllowed(true);
        } catch (profileError) {
          console.error('Error cargando perfil:', profileError);
          // Usuario sin perfil aún, pero permitir acceso
          setUser({
            id: session.user.id,
            email: session.user.email || undefined,
            token: session.access_token,
          });
          setIsAllowed(true);
        }
        } 
    };

    restoreSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const profile = await profileService.getCurrentProfile();
          
          setUser({
            id: session.user.id,
            email: session.user.email || undefined,
            token: session.access_token,
            full_name: profile?.full_name,
            phone: profile?.phone,
            birth_date: profile?.birth_date,
            profile_image_url: profile?.profile_image_url
          });
          setIsAllowed(true);
        } catch (error) {
          console.error('Error cargando perfil después de login:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAllowed(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
        // El perfil se cargará automáticamente en el listener de onAuthStateChange
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

  const signUp = async (email: string, password: string, profileData?: any): Promise<boolean> => {
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
      // NO intentar crear perfil inmediatamente aquí
      // En su lugar, esperar a que el usuario confirme su email
      // o iniciar sesión manualmente
      
      // Mostrar mensaje de éxito
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta ha sido creada. Por favor revisa tu email para confirmar tu cuenta.",
        [
          {
            text: "OK",
            onPress: () => {
              // Redirigir a Login
              // Esto dependerá de tu navegación
            }
          }
        ]
      );
      
      return true;
    }

    return false;
  } catch (error) {
    Alert.alert("Error", "Error inesperado en el registro");
    return false;
  }
};

  const updateProfile = async (profileData: any) => {
    try {
      await profileService.upsertProfile(profileData);
      
      // Actualizar estado local
      setUser(prev => prev ? { ...prev, ...profileData } : prev);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAllowed, 
      login, 
      logout, 
      signUp,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}