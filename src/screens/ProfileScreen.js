import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { onAuthStateChanged, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { auth, db, getUserProfile } from '../services/firebase'

const NAVY   = '#0F1F35'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const RED    = '#EF4444'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'
const BLUE   = '#3B82F6'

export default function ProfileScreen({ navigation }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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

  async function handleSignOut() { await signOut(auth) }

  async function handleDeleteAccount() {
    // Step 1 — confirm intent
    Alert.alert(
      'Delete Account',
      'This will permanently delete your Bridge account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete My Account', style: 'destructive', onPress: confirmDelete },
      ]
    )
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      const u = auth.currentUser
      if (!u) return

      const collection = profile?._collection ?? 'homeowners'

      // Delete Firestore document
      await deleteDoc(doc(db, collection, u.uid))

      // Delete Firebase Auth account
      // (Firebase requires recent login — catch the error and prompt re-auth if needed)
      await deleteUser(u)

    } catch (err) {
      setDeleting(false)
      if (err.code === 'auth/requires-recent-login') {
        // Re-auth flow for email/password users
        Alert.prompt(
          'Confirm Your Password',
          'Please re-enter your password to complete account deletion.',
          async (password) => {
            try {
              const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
              await reauthenticateWithCredential(auth.currentUser, credential)
              await deleteDoc(doc(db, profile?._collection ?? 'homeowners', auth.currentUser.uid))
              await deleteUser(auth.currentUser)
            } catch (e) {
              Alert.alert('Error', 'Could not delete account. Please try again or contact support@bridgeverified.com')
            }
          },
          'secure-text'
        )
      } else {
        Alert.alert('Error', 'Could not delete account. Please contact support@bridgeverified.com')
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={AMBER} />
      </SafeAreaView>
    )
  }

  const isContractor = profile?._collection === 'contractors'

  const quickLinks = [
    {
      icon: 'document-text',
      label: 'Insurance Wizard',
      onPress: () => Alert.alert('Insurance Wizard', 'The Insurance Wizard helps you understand your coverage. This feature is opening soon.'),
    },
    {
      icon: 'ban',
      label: 'Anti-Chaser Decal',
      onPress: () => Alert.alert('Anti-Chaser Decal', 'Request your free Bridge decal at bridgeverified.com/decal'),
    },
    {
      icon: 'notifications',
      label: 'Alert Settings',
      onPress: () => Alert.alert('Alert Settings', 'Storm alert preferences can be managed in your device notification settings.', [{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'OK', style: 'cancel' }]),
    },
    {
      icon: 'lock-closed',
      label: 'Privacy & Security',
      onPress: () => Alert.alert('Privacy & Security', 'View our privacy policy at bridgeverified.com/privacy'),
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={s.heading}>Profile</Text>

        {/* Verified card */}
        <View style={s.verifiedCard}>
          <View style={s.avatarWrap}>
            <Ionicons name={isContractor ? 'hammer' : 'home'} size={32} color={BLUE} />
          </View>
          <Text style={s.name}>{profile?.name ?? user?.displayName ?? 'Bridge User'}</Text>
          <Text style={s.sub}>{isContractor ? 'Contractor' : 'Homeowner'} · {profile?.serviceArea ?? profile?.zip ?? 'Texas'}</Text>
          <View style={s.badges}>
            <View style={s.badgeGreen}>
              <Text style={s.badgeGreenText}>{profile?.status === 'active' ? 'Active' : 'Pending'}</Text>
            </View>
            {!isContractor && (
              <View style={s.badgeAmber}>
                <Text style={s.badgeAmberText}>Decal Available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info rows */}
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

        {/* Quick links — all have onPress now */}
        <View style={s.card}>
          {quickLinks.map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[s.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name={item.icon} size={18} color={AMBER2} />
                <Text style={s.linkLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete account — Apple requirement */}
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={handleDeleteAccount}
          disabled={deleting}
          activeOpacity={0.7}
        >
          {deleting
            ? <ActivityIndicator color={RED} size="small" />
            : <Text style={s.deleteText}>Delete Account</Text>
          }
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
  row:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', minHeight: 52 },
  rowLabel:       { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue:       { fontSize: 13, color: WHITE, maxWidth: '60%', textAlign: 'right' },
  linkLabel:      { fontSize: 14, color: WHITE, fontWeight: '500' },
  signOutBtn:     { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  signOutText:    { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  deleteBtn:      { borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  deleteText:     { fontSize: 14, fontWeight: '600', color: 'rgba(239,68,68,0.7)' },
})
