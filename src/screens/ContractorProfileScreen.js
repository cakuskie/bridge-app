import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { auth, db } from '../services/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { ALL_SERVICES, updateContractorServices } from '../services/contractorService'

const NAVY=  '#0F1F35'
const AMBER= '#E07B2A'
const AMBER2='#F59E0B'
const GREEN= '#10B981'
const BLUE=  '#3B82F6'
const MUTED= '#7B8FA6'
const WHITE= '#FAFAFA'

export default function ContractorProfileScreen() {
  const user = auth.currentUser
  const [profile, setProfile]   = useState(null)
  const [services, setServices] = useState([])
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'contractors', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        setProfile(data)
        setServices(data.services || [])
      }
      setLoading(false)
    })
  }, [])

  const toggleService = (svc) => {
    setServices(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc])
    setSaved(false)
  }

  const handleSaveServices = async () => {
    setSaving(true)
    await updateContractorServices(user.uid, services)
    setSaving(false)
    setSaved(true)
  }

  const handleSignOut = async () => {
    try { await signOut(auth) } catch (e) { console.error(e) }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={AMBER} size="large" />
      </View>
    )
  }

  const menuItems = [
    {
      icon: 'clipboard',
      label: 'Verification Status',
      onPress: () => Alert.alert(
        'Verification Status',
        profile?.bgc_status === 'clear'
          ? 'Your background check is complete and your Bridge Verified badge is active.'
          : 'Your verification is in progress. You will be notified by email once complete.',
        [{ text: 'OK' }]
      ),
    },
    {
      icon: 'shield-checkmark',
      label: 'Insurance & License',
      onPress: () => Alert.alert(
        'Insurance & License',
        'To update your insurance certificate or license information, please visit bridgeverified.com from a web browser.',
        [{ text: 'OK' }]
      ),
    },
    {
      icon: 'location',
      label: 'Service Area',
      onPress: () => Alert.alert(
        'Service Area',
        profile?.serviceArea
          ? `Your current service area: ${profile.serviceArea}. To update your service area, please visit bridgeverified.com from a web browser.`
          : 'To set or update your service area, please visit bridgeverified.com from a web browser.',
        [{ text: 'OK' }]
      ),
    },
    {
      icon: 'card',
      label: 'Subscription & Billing',
      onPress: () => Alert.alert(
        'Subscription & Billing',
        'Your Bridge Pro subscription is managed at bridgeverified.com. Visit from a web browser to update your payment method or view billing history.',
        [{ text: 'OK' }]
      ),
    },
    {
      icon: 'notifications',
      label: 'Notification Settings',
      onPress: () => Alert.alert(
        'Notification Settings',
        'Storm alert notifications can be managed in your device Settings under Notifications → Bridge.',
        [{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'OK', style: 'cancel' }]
      ),
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Ionicons name="home" size={32} color={BLUE} />
          </View>
          <Text style={s.name}>{profile?.company || user?.displayName || 'Your Company'}</Text>
          <Text style={s.email}>{user?.email}</Text>
          <View style={s.badges}>
            <View style={s.badgeGreen}><Text style={s.badgeGreenText}>Bridge Verified</Text></View>
            <View style={s.badgeBlue}><Text style={s.badgeBlueText}>BGC</Text></View>
            <View style={s.badgeAmber}><Text style={s.badgeAmberText}>Insured</Text></View>
          </View>
          <View style={s.statsRow}>
            <View style={s.stat}><Text style={s.statN}>{profile?.rating ?? '5.0'}</Text><Text style={s.statL}>Rating</Text></View>
            <View style={s.stat}><Text style={s.statN}>{profile?.jobsCompleted ?? 0}</Text><Text style={s.statL}>Jobs Done</Text></View>
            <View style={s.stat}><Text style={s.statN}>{profile?.avgResponse ?? '--'}</Text><Text style={s.statL}>Avg Response</Text></View>
          </View>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Services Offered</Text>
          <Text style={s.sectionSub}>Homeowners filter by these</Text>
        </View>
        <View style={s.servicesGrid}>
          {ALL_SERVICES.map(svc => {
            const on = services.includes(svc)
            return (
              <TouchableOpacity key={svc} onPress={() => toggleService(svc)} style={[s.svcRow, on && s.svcRowOn]}>
                <View style={[s.checkbox, on && s.checkboxOn]}>
                  {on && <Ionicons name="checkmark" size={13} color={WHITE} />}
                </View>
                <Text style={[s.svcLabel, on && s.svcLabelOn]}>{svc}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSaveServices}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color={WHITE} size="small" />
            : <Text style={s.saveBtnText}>{saved ? 'Services Saved ✓' : 'Save Services'}</Text>
          }
        </TouchableOpacity>

        <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Account</Text>
        <View style={s.menuCard}>
          {menuItems.map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={18} color={AMBER2} style={{ marginRight: 14 }} />
              <Text style={s.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={s.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  profileCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  avatar:         { width: 72, height: 72, borderRadius: 18, backgroundColor: 'rgba(59,130,246,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name:           { fontSize: 20, fontWeight: '700', color: WHITE, marginBottom: 4 },
  email:          { fontSize: 13, color: MUTED, marginBottom: 14 },
  badges:         { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  badgeGreen:     { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  badgeGreenText: { fontSize: 10, fontWeight: '800', color: GREEN },
  badgeBlue:      { backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  badgeBlueText:  { fontSize: 10, fontWeight: '800', color: '#93C5FD' },
  badgeAmber:     { backgroundColor: 'rgba(224,123,42,0.15)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  badgeAmberText: { fontSize: 10, fontWeight: '800', color: AMBER2 },
  statsRow:       { flexDirection: 'row', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, overflow: 'hidden' },
  stat:           { flex: 1, alignItems: 'center', padding: 12, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },
  statN:          { fontSize: 16, fontWeight: '700', color: WHITE },
  statL:          { fontSize: 9, color: MUTED, marginTop: 2 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:   { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 },
  sectionSub:     { fontSize: 11, color: MUTED },
  servicesGrid:   { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  svcRow:         { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 12 },
  svcRowOn:       { backgroundColor: 'rgba(224,123,42,0.06)' },
  checkbox:       { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxOn:     { backgroundColor: AMBER, borderColor: AMBER },
  svcLabel:       { fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  svcLabelOn:     { color: WHITE, fontWeight: '600' },
  saveBtn:        { backgroundColor: AMBER, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnText:    { color: WHITE, fontWeight: '800', fontSize: 14 },
  menuCard:       { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuRow:        { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  menuLabel:      { flex: 1, fontSize: 14, color: WHITE },
  signOutBtn:     { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.06)', marginBottom: 20 },
  signOutText:    { fontSize: 14, fontWeight: '700', color: '#FCA5A5' },
})
