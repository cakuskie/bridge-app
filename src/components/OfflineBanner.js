import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || !state.isInternetReachable
      setIsOffline(offline)
      Animated.timing(fadeAnim, {
        toValue: offline ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    })
    return () => unsubscribe()
  }, [])

  if (!isOffline) return null

  return (
    <Animated.View style={[s.banner, { opacity: fadeAnim }]}>
      <Text style={s.icon}>📵</Text>
      <Text style={s.text}>No internet connection — storm alerts paused</Text>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: '#1A2B3C',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224,123,42,0.4)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 14 },
  text: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', flex: 1 },
})
