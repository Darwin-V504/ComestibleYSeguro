import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeS';
import ProfileScreen from '../screens/ProfileS';
import InventoryScreen from '../screens/InventoryS';
import RecipesScreen from '../screens/services/RecipeServices';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';

export type TabsParamList = {
    Home: { newItem?: string } | undefined;
    Inventory: undefined;
    Recipes: undefined;
    Profile: undefined;
}

const Tab = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
    const inventory = useAppSelector(state => state.inventory.items);
    const [expiringCount, setExpiringCount] = useState(0);

    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        const expiring = inventory.filter(item => {
            const expDate = new Date(item.expirationDate);
            // ignore invalid/ unparsable dates
            if (isNaN(expDate.getTime())) return false;
            return expDate <= tomorrow;
        });
        setExpiringCount(expiring.length);
    }, [inventory]);

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#2E8B57',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E8E8E8',
                },
                headerStyle: {
                    backgroundColor: '#2E8B57',
                },
                headerTintColor: '#FFFFFF',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                    title: 'Mi Despensa',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Recipes"
                component={RecipesScreen}
                options={{
                    title: 'Recetas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="restaurant" size={size} color={color} />
                    ),
                    tabBarBadge: expiringCount > 0 ? expiringCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: '#FF6B6B',
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}