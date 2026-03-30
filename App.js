import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Text, ActivityIndicator, View } from 'react-native'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './src/services/firebase'
import HomeScreen from './src/screens/HomeScreen'
import SearchScreen from './src/screens/SearchScreen'
import AlertsScreen from './src/screens/AlertsScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import LoginScreen from './src/screens/auth/LoginScreen'
import OfflineBanner from './src/components/OfflineBanner'
import { setupNotificationListeners } from './src/utils/notifications'

const Tab = createBottomTabNavigator()
const AMBER = '#E07B2A'
const MUTED = '#7B8FA6'

export default function App() {
  const [user, setUser]           = useState(undefined)
  const [navRef, setNavRef]       = useState(null)

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null))
    return unsub
  }, [])

  // Notification tap listener — navigates to Alerts screen when user taps a push
  useEffect(() => {
    const cleanup = setupNotificationListeners((screen) => {
      if (navRef) navRef.navigate(screen)
    })
    return cleanup
  }, [navRef])

  // Loading state
  if (user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F1F35', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={AMBER} size="large" />
      </View>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen />
      </SafeAreaProvider>
    )
  }

  // Logged in
  return (
    <SafeAreaProvider>
      <OfflineBanner />
      <NavigationContainer ref={ref => setNavRef(ref)}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#0A1628', borderTopColor: 'rgba(255,255,255,0.07)' },
            tabBarActiveTintColor: AMBER,
            tabBarInactiveTintColor: MUTED,
          }}
        >
          <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }} />
          <Tab.Screen name="Search"  component={SearchScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text> }} />
          <Tab.Screen name="Alerts"  component={AlertsScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text> }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
