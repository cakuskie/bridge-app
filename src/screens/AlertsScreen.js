import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const NAVY   = '#0F1F35'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'

const MOCK_ALERTS = [
  { id: 1, type: 'Hail Warning', county: 'Bexar County', desc: '1.25" hail · ETA 18 min', time: '2 min ago', active: true },
  { id: 2, type: 'Flash Flood Watch', county: 'Harris County', desc: 'Resolved', time: 'Yesterday', active: false },
  { id: 3, type: 'Wind Advisory', county: 'Collin County', desc: '45mph gusts · Resolved', time: '3 days ago', active: false },
  { id: 4, type: 'Hail Warning', county: 'Bexar County', desc: '0.75" · 1 booking made', time: '1 wk ago', active: false },
]

export default function AlertsScreen() {
  const [alerts] = useState(MOCK_ALERTS)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={s.heading}>Storm Alerts</Text>

        {alerts.map(a => (
          <View key={a.id} style={[s.card, a.active && s.cardActive]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={[s.badge, a.active && s.badgeActive]}>
                <Text style={[s.badgeText, a.active && s.badgeTextActive]}>
                  {a.active ? '⚡ Active' : a.type}
                </Text>
              </View>
              <Text style={s.time}>{a.time}</Text>
            </View>
            <Text style={s.county}>{a.county}</Text>
            <Text style={s.desc}>{a.desc}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:       { fontSize: 24, fontWeight: '700', color: WHITE, marginBottom: 20 },
  card:          { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardActive:    { backgroundColor: 'rgba(224,123,42,0.1)', borderColor: 'rgba(224,123,42,0.4)' },
  badge:         { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  badgeActive:   { backgroundColor: 'rgba(224,123,42,0.2)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.5)' },
  badgeText:     { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  badgeTextActive:{ fontSize: 10, fontWeight: '800', color: AMBER2 },
  time:          { fontSize: 11, color: MUTED },
  county:        { fontSize: 13, fontWeight: '700', color: WHITE, marginBottom: 3 },
  desc:          { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
})
