import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginS from '../screens/LoginS';
import RegisterS from '../screens/RegisterS';
import HomeS from '../screens/HomeS';
import TabsNavigator from './TabsNavigator';
import IndexS from '../screens/IndexS';
import ScanProductScreen from '../screens/services/ScanProductS';
import RecipesScreen from '../screens/services/RecipeServices';
import ManualAddScreen from '../screens/services/ManualAddServices'; 
import RecipeDetailScreen from '../screens/services/RecipeDetailScreen';


export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Tabs: { email: string };
    Home: { newItem?: string };
    Index: undefined;
    ScanProduct: undefined;
    Recipes: undefined;
    ManualAdd: undefined; 
    RecipeDetail: { recipeId: string  };

}


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName='Index' 
                         screenOptions={{ 
                             headerShown: false,
                             animation: 'slide_from_right' 
                         }}>
            <Stack.Screen name="Index" component={IndexS} />
            <Stack.Screen name="Login" component={LoginS} />
            <Stack.Screen name="Register" component={RegisterS} />
            <Stack.Screen name="Tabs" component={TabsNavigator} />
            <Stack.Screen 
                name="ScanProduct" 
                component={ScanProductScreen}
                options={{
                    headerShown: true,
                    title: 'Escanear Producto',
                    headerStyle: { backgroundColor: '#2E8B57' },
                    headerTintColor: '#FFFFFF',
                }}
            />
            <Stack.Screen 
                name="Recipes" 
                component={RecipesScreen}
                options={{
                    headerShown: true,
                    title: 'Recetas Sugeridas',
                    headerStyle: { backgroundColor: '#2E8B57' },
                    headerTintColor: '#FFFFFF',
                }}
            />
            <Stack.Screen 
                name="ManualAdd" 
                component={ManualAddScreen}
                options={{
                    headerShown: true,
                    title: 'Agregar Producto',
                    headerStyle: { backgroundColor: '#2E8B57' },
                    headerTintColor: '#ffffffff',
                }}
            />
            <Stack.Screen
            name="RecipeDetail"
            component={RecipeDetailScreen}
            options={({
                route
            }) => ({
                headerShown: true,
                title: 'Detalles de Receta',
                headerStyle: { backgroundColor: '#2E8B57' },
                headerTintColor: '#FFFFFF',
         
            })}
            />
            

        </Stack.Navigator>
    );
}