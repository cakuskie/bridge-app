import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Text } from 'react-native'

import HomeScreen from './src/screens/HomeScreen'
import SearchScreen from './src/screens/SearchScreen'
import AlertsScreen from './src/screens/AlertsScreen'
import ProfileScreen from './src/screens/ProfileScreen'

const Tab = createBottomTabNavigator()

const NAVY = '#0F1F35'
const AMBER = '#E07B2A'
const MUTED = '#7B8FA6'

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#0A1628', borderTopColor: 'rgba(255,255,255,0.07)' },
            tabBarActiveTintColor: AMBER,
            tabBarInactiveTintColor: MUTED,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }} />
          <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text> }} />
          <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text> }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
