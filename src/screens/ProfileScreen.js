import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, getUserProfile } from '../services/firebase'

const NAVY   = '#0F1F35'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'
const BLUE   = '#3B82F6'

export default function ProfileScreen() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        const p = await getUserProfile(u.uid)
        setProfile(p)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function handleSignOut() {
    await signOut(auth)
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={AMBER} />
      </SafeAreaView>
    )
  }

  const isContractor = profile?._collection === 'contractors'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={s.heading}>Profile</Text>

        {/* Avatar card */}
        <View style={s.verifiedCard}>
          <View style={s.avatarWrap}>
            <Text style={{ fontSize: 32 }}>{isContractor ? '🔨' : '🏠'}</Text>
          </View>
          <Text style={s.name}>{profile?.name ?? user?.displayName ?? 'Bridge User'}</Text>
          <Text style={s.sub}>{isContractor ? 'Contractor' : 'Homeowner'} · {profile?.serviceArea ?? profile?.zip ?? 'Texas'}</Text>
          <View style={s.badges}>
            <View style={s.badgeGreen}>
              <Text style={s.badgeGreenText}>
                {profile?.status === 'active' ? '✅ Active' : '⏳ Pending Verification'}
              </Text>
            </View>
            {!isContractor && (
              <View style={s.badgeAmber}>
                <Text style={s.badgeAmberText}>🚫 Decal Available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile rows */}
        <View style={s.card}>
          {[
            { label: 'Name',         value: profile?.name },
            { label: 'Email',        value: profile?.email ?? user?.email },
            { label: 'Phone',        value: profile?.phone },
            { label: 'Address',      value: profile?.address },
            { label: 'ZIP',          value: profile?.zip },
            { label: 'Company',      value: profile?.company },
            { label: 'Service Area', value: profile?.serviceArea },
          ].filter(r => r.value).map((row, i, arr) => (
            <View key={row.label} style={[s.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.rowLabel}>{row.label}</Text>
              <Text style={s.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={s.card}>
          {[
            { icon: '📋', label: 'Insurance Wizard' },
            { icon: '🚫', label: 'Anti-Chaser Decal' },
            { icon: '⚡', label: 'Alert Settings' },
            { icon: '🔒', label: 'Privacy & Security' },
          ].map((item, i, arr) => (
            <TouchableOpacity key={item.label} style={[s.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={s.linkLabel}>{item.label}</Text>
              </View>
              <Text style={{ color: MUTED, fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:        { fontSize: 24, fontWeight: '700', color: WHITE, marginBottom: 20 },
  verifiedCard:   { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatarWrap:     { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(59,130,246,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name:           { fontSize: 18, fontWeight: '700', color: WHITE, marginBottom: 4 },
  sub:            { fontSize: 13, color: MUTED, marginBottom: 12 },
  badges:         { flexDirection: 'row', gap: 8 },
  badgeGreen:     { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  badgeGreenText: { fontSize: 11, fontWeight: '700', color: GREEN },
  badgeAmber:     { backgroundColor: 'rgba(224,123,42,0.15)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  badgeAmberText: { fontSize: 11, fontWeight: '700', color: AMBER2 },
  card:           { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 4, marginBottom: 16 },
  row:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowLabel:       { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue:       { fontSize: 13, color: WHITE, maxWidth: '60%', textAlign: 'right' },
  linkLabel:      { fontSize: 14, color: WHITE, fontWeight: '500' },
  signOutBtn:     { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 40 },
  signOutText:    { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
})
