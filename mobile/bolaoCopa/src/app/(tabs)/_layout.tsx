import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#1B7A4E',
        tabBarInactiveTintColor: '#8896A6',
        tabBarShowLabel: true,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F2F4',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          elevation: 0,
          shadowOpacity: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="partidas"
        options={{
          title: 'Jogos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "football" : "football-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meusPalpites"
        options={{
          title: 'Palpites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "podium" : "podium-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
