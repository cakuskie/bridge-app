import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { fetchTickerAlerts } from '../services/weather'

const NAVY   = '#0F1F35'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickerAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={s.heading}>Storm Alerts</Text>
        <Text style={s.sub}>Live NWS data — Statewide Texas</Text>
        {loading ? (
          <ActivityIndicator color={AMBER2} style={{ marginTop: 40 }} />
        ) : alerts.map((a, i) => {
          const isActive = a.desc !== 'No Active Alerts'
          return (
            <View key={i} style={[s.card, isActive && s.cardActive]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={[s.badge, isActive && s.badgeActive]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name={isActive ? 'thunderstorm' : 'checkmark-circle'} size={11} color={isActive ? AMBER2 : GREEN} />
                    <Text style={[s.badgeText, isActive && s.badgeTextActive]}>{isActive ? (a.severity ?? 'Advisory') : 'Clear'}</Text>
                  </View>
                </View>
              </View>
              <Text style={s.county}>{a.county}</Text>
              <Text style={s.desc}>{a.desc}</Text>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:         { fontSize: 24, fontWeight: '700', color: WHITE, marginBottom: 4 },
  sub:             { fontSize: 12, color: MUTED, marginBottom: 20 },
  card:            { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardActive:      { backgroundColor: 'rgba(224,123,42,0.1)', borderColor: 'rgba(224,123,42,0.4)' },
  badge:           { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  badgeActive:     { backgroundColor: 'rgba(224,123,42,0.2)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.5)' },
  badgeText:       { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  badgeTextActive: { fontSize: 10, fontWeight: '800', color: AMBER2 },
  county:          { fontSize: 13, fontWeight: '700', color: WHITE, marginBottom: 3 },
  desc:            { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
})
