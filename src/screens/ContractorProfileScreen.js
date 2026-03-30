import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth } from '../services/firebase'
import { signOut } from 'firebase/auth'

const NAVY=  '#0F1F35'
const AMBER= '#E07B2A'
const AMBER2='#F59E0B'
const GREEN= '#10B981'
const BLUE=  '#3B82F6'
const MUTED= '#7B8FA6'
const WHITE= '#FAFAFA'

export default function ContractorProfileScreen() {
  const user = auth.currentUser

  const handleSignOut = async () => {
    try { await signOut(auth) } catch (e) { console.error(e) }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Profile header */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 32 }}>🏠</Text>
          </View>
          <Text style={s.name}>{user?.displayName || 'Your Company'}</Text>
          <Text style={s.email}>{user?.email}</Text>
          <View style={s.badges}>
            <View style={s.badgeGreen}><Text style={s.badgeGreenText}>✓ Bridge Verified</Text></View>
            <View style={s.badgeBlue}><Text style={s.badgeBlueText}>✓ BGC</Text></View>
            <View style={s.badgeAmber}><Text style={s.badgeAmberText}>✓ Insured</Text></View>
          </View>
          <View style={s.statsRow}>
            <View style={s.stat}><Text style={s.statN}>4.9⭐</Text><Text style={s.statL}>Rating</Text></View>
            <View style={s.stat}><Text style={s.statN}>340</Text><Text style={s.statL}>Jobs Done</Text></View>
            <View style={s.stat}><Text style={s.statN}>35m</Text><Text style={s.statL}>Avg Response</Text></View>
          </View>
        </View>

        {/* Services */}
        <Text style={s.sectionTitle}>Services Offered</Text>
        <View style={s.services}>
          {['Storm Repair','Hail Damage','Full Replace','Gutters','Inspections'].map(svc => (
            <View key={svc} style={s.svcChip}><Text style={s.svcText}>{svc}</Text></View>
          ))}
        </View>

        {/* Account settings */}
        <Text style={s.sectionTitle}>Account</Text>
        <View style={s.menuCard}>
          {[
            { icon: '📋', label: 'Verification Status' },
            { icon: '🛡️', label: 'Insurance & License' },
            { icon: '📍', label: 'Service Area' },
            { icon: '💳', label: 'Subscription & Billing' },
            { icon: '🔔', label: 'Notification Settings' },
          ].map(item => (
            <TouchableOpacity key={item.label} style={s.menuRow}>
              <Text style={s.menuIcon}>{item.icon}</Text>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuArrow}>›</Text>
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
  sectionTitle:   { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  services:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  svcChip:        { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 },
  svcText:        { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  menuCard:       { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuRow:        { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  menuIcon:       { fontSize: 18, marginRight: 14 },
  menuLabel:      { flex: 1, fontSize: 14, color: WHITE },
  menuArrow:      { fontSize: 20, color: MUTED },
  signOutBtn:     { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.06)' },
  signOutText:    { fontSize: 14, fontWeight: '700', color: '#FCA5A5' },
})
