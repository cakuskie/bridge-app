import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getVerifiedContractors } from '../services/contractorService'
import { fetchHeroCondition } from '../services/weather'

const NAVY   = '#0F1F35'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'
const BLUE   = '#3B82F6'

export default function HomeScreen() {
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    getVerifiedContractors()
      .then(setContractors)
      .finally(() => setLoading(false))

    fetchHeroCondition()
      .then(setWeather)
      .finally(() => setWeatherLoading(false))
  }, [])

  const hasAlert = weather && weather.level !== 'clear'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Header */}
        <Text style={s.muted}>Good morning,</Text>
        <Text style={s.heading}>Bridge</Text>

        {/* Live Storm Alert Card */}
        <View style={[s.alertCard, !hasAlert && s.alertCardClear]}>
          {weatherLoading ? (
            <ActivityIndicator color={AMBER} />
          ) : (
            <>
              <View style={[s.alertBadge, !hasAlert && s.alertBadgeClear]}>
                <Text style={[s.alertBadgeText, !hasAlert && s.alertBadgeTextClear]}>
                  {hasAlert ? '⚡ ACTIVE ALERT' : '✅ ALL CLEAR'}
                </Text>
              </View>
              <Text style={s.alertTitle}>
                {hasAlert ? `${weather.label} — ${weather.location}` : 'No Active Alerts'}
              </Text>
              <Text style={s.alertBody}>
                {hasAlert
                  ? `${contractors.length} verified contractors available in your area.`
                  : 'No active storm warnings across Texas right now.'}
              </Text>
              {hasAlert && (
                <View style={s.alertBtns}>
                  <TouchableOpacity style={s.btnPrimary}>
                    <Text style={s.btnPrimaryText}>Find Contractor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.btnGhost}>
                    <Text style={s.btnGhostText}>View Map</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Contractors */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Bridge Verified Pros</Text>
          <Text style={s.sectionLink}>See All</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={AMBER} style={{ marginTop: 20 }} />
        ) : contractors.length === 0 ? (
          <Text style={s.muted}>No verified contractors yet — check back soon.</Text>
        ) : contractors.map(c => (
          <View key={c.id} style={s.contractorCard}>
            <View style={s.contractorAvatar}>
              <Text style={{ fontSize: 20 }}>🏠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.contractorName}>{c.company || c.name}</Text>
              <Text style={s.contractorSub}>{c.serviceArea ?? 'Texas'}</Text>
              <View style={s.badges}>
                <View style={s.badgeGreen}><Text style={s.badgeGreenText}>✓ Verified</Text></View>
                <View style={s.badgeBlue}><Text style={s.badgeBlueText}>✓ BGC</Text></View>
              </View>
            </View>
            <Text style={s.rating}>⭐ {c.rating ?? '5.0'}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:            { fontSize: 28, fontWeight: '700', color: WHITE, marginBottom: 20 },
  muted:              { fontSize: 13, color: MUTED, marginBottom: 4 },
  alertCard:          { backgroundColor: 'rgba(224,123,42,0.12)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.4)', borderRadius: 16, padding: 16, marginBottom: 24 },
  alertCardClear:     { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' },
  alertBadge:         { backgroundColor: 'rgba(224,123,42,0.2)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.5)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  alertBadgeClear:    { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
  alertBadgeText:     { fontSize: 10, fontWeight: '800', color: AMBER2 },
  alertBadgeTextClear:{ color: GREEN },
  alertTitle:         { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 6 },
  alertBody:          { fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 20, marginBottom: 12 },
  alertBtns:          { flexDirection: 'row', gap: 8 },
  btnPrimary:         { flex: 1, backgroundColor: AMBER, borderRadius: 10, padding: 12, alignItems: 'center' },
  btnPrimaryText:     { color: WHITE, fontWeight: '800', fontSize: 13 },
  btnGhost:           { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, paddingHorizontal: 16, alignItems: 'center' },
  btnGhostText:       { color: 'rgba(255,255,255,0.65)', fontWeight: '600', fontSize: 13 },
  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:       { fontSize: 14, fontWeight: '700', color: WHITE },
  sectionLink:        { fontSize: 12, color: BLUE },
  contractorCard:     { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  contractorAvatar:   { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  contractorName:     { fontSize: 14, fontWeight: '700', color: WHITE },
  contractorSub:      { fontSize: 11, color: MUTED, marginTop: 2 },
  badges:             { flexDirection: 'row', gap: 6, marginTop: 6 },
  badgeGreen:         { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  badgeGreenText:     { fontSize: 9, fontWeight: '800', color: GREEN },
  badgeBlue:          { backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  badgeBlueText:      { fontSize: 9, fontWeight: '800', color: '#93C5FD' },
  rating:             { fontSize: 12, color: AMBER2 },
})
