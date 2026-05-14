import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import MapaScreen from './src/screens/MapaScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#1a1a2e',
            borderTopColor: '#252540',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#4f8ef7',
          tabBarInactiveTintColor: '#555',
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen
          name="Mapa"
          component={MapaScreen}
          options={{
            title: 'Mapa',
            headerTitle: '🗺️  Check-in Academia',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text>,
          }}
        />
        <Tab.Screen
          name="Historico"
          component={HistoricoScreen}
          options={{
            title: 'Histórico',
            headerTitle: '📋  Meus Check-ins',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
