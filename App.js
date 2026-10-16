import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import Constants from 'expo-constants';

// Icônes
import { Home, PieChart, Plus, Settings, User } from 'lucide-react-native';

import { auth } from './src/config/firebase';
import { COLORS } from './src/constants/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BudgetProvider } from './src/context/BudgetContext';
import { DaretProvider } from './src/context/DaretContext';

// Écrans
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddScreen from './src/screens/AddScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import Sando9tiScreen from './src/screens/Sando9tiScreen';

// Écrans Daret
import { DaretListScreen, CreateDaretScreen } from './src/screens/DaretListScreen';
import { DaretDetailScreen } from './src/screens/DaretDetailScreen';

// --- CONFIG NOTIFICATIONS (désactivées dans Expo Go et sur le web) ---
const isExpoGo = Constants.appOwnership === 'expo';
const canUseNotifications = !isExpoGo && Platform.OS !== 'web';

if (canUseNotifications) {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('Notifications indisponibles :', e?.message);
  }
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- BARRE DE NAVIGATION (TABS) ---
function AppTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 10, marginBottom: 5 },
      }}
    >
      {/* 1. ACCUEIL */}
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />

      {/* 2. STATS */}
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarIcon: ({ color }) => <PieChart color={color} size={24} /> }}
      />

      {/* 3. BOUTON CENTRAL (+) */}
      <Tab.Screen
        name="AjoutTab"
        component={AddScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Ajout');
          },
        })}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                backgroundColor: COLORS.secondary,
                width: 50,
                height: 50,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 25,
                elevation: 5,
                shadowColor: COLORS.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <Plus color="#fff" size={28} strokeWidth={3} />
            </View>
          ),
          tabBarLabel: '',
        }}
      />

      {/* 4. RÉGLAGES */}
      <Tab.Screen
        name="Réglages"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color }) => <Settings color={color} size={24} /> }}
      />

      {/* 5. PROFIL */}
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
}

// --- NAVIGATION PRINCIPALE (STACK) ---
function MainNavigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Écrans Principaux */}
          <Stack.Screen name="MainTabs" component={AppTabs} />

          {/* Écrans Modales / Secondaires */}
          <Stack.Screen
            name="Ajout"
            component={AddScreen}
            options={{ presentation: 'modal', headerShown: true, title: 'Nouvelle Opération' }}
          />

          {/* Écrans Daret */}
          <Stack.Screen
            name="DaretList"
            component={DaretListScreen}
            options={{ title: 'Mes Darets', headerShown: false }}
          />
          <Stack.Screen name="CreateDaret" component={CreateDaretScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="DaretDetail" component={DaretDetailScreen} />

          {/* Écran Sando9ti */}
          <Stack.Screen name="Sando9ti" component={Sando9tiScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <DaretProvider>
          <NavigationContainer>
            <MainNavigation />
          </NavigationContainer>
        </DaretProvider>
      </BudgetProvider>
    </ThemeProvider>
  );
}