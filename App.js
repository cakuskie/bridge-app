import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Text, ActivityIndicator, View } from 'react-native'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './src/services/firebase'
import HomeScreen from './src/screens/HomeScreen'
import SearchScreen from './src/screens/SearchScreen'
import AlertsScreen from './src/screens/AlertsScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import ContractorDashboardScreen from './src/screens/ContractorDashboardScreen'
import ContractorJobsScreen from './src/screens/ContractorJobsScreen'
import ContractorPayoutsScreen from './src/screens/ContractorPayoutsScreen'
import ContractorProfileScreen from './src/screens/ContractorProfileScreen'
import LoginScreen from './src/screens/auth/LoginScreen'
import OfflineBanner from './src/components/OfflineBanner'
import { setupNotificationListeners } from './src/utils/notifications'

const Tab = createBottomTabNavigator()
const AMBER = '#E07B2A'
const MUTED = '#7B8FA6'

const tabBarStyle = {
  backgroundColor: '#0A1628',
  borderTopColor: 'rgba(255,255,255,0.07)',
}

export default function App() {
  const [user, setUser]         = useState(undefined)
  const [userType, setUserType] = useState(null)
  const [navRef, setNavRef]     = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u)
        // Detect user type from Firestore
        const contractorSnap = await getDoc(doc(db, 'contractors', u.uid))
        if (contractorSnap.exists()) {
          setUserType('contractor')
        } else {
          setUserType('homeowner')
        }
      } else {
        setUser(null)
        setUserType(null)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    const cleanup = setupNotificationListeners((screen) => {
      if (navRef) navRef.navigate(screen)
    })
    return cleanup
  }, [navRef])

  if (user === undefined || (user && !userType)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F1F35', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={AMBER} size="large" />
      </View>
    )
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <OfflineBanner />
      <NavigationContainer ref={ref => setNavRef(ref)}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle,
            tabBarActiveTintColor: AMBER,
            tabBarInactiveTintColor: MUTED,
          }}
        >
          {userType === 'contractor' ? (
            <>
              <Tab.Screen name="Leads"    component={ContractorDashboardScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text> }} />
              <Tab.Screen name="Jobs"     component={ContractorJobsScreen}      options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔨</Text> }} />
              <Tab.Screen name="Payouts"  component={ContractorPayoutsScreen}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text> }} />
              <Tab.Screen name="Profile"  component={ContractorProfileScreen}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
            </>
          ) : (
            <>
              <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }} />
              <Tab.Screen name="Search"  component={SearchScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text> }} />
              <Tab.Screen name="Alerts"  component={AlertsScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text> }} />
              <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
            </>
          )}
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
