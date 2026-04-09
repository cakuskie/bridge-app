import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../services/firebase'

const NAVY=  '#0F1F35'
const AMBER= '#E07B2A'
const AMBER2='#F59E0B'
const GREEN= '#10B981'
const MUTED= '#7B8FA6'
const WHITE= '#FAFAFA'

export default function ContractorDashboardScreen() {
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const q = query(collection(db, 'leads'), where('contractorId', '==', uid), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function handleAccept(leadId) {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: 'quoted',
        updatedAt: serverTimestamp()
      })
    } catch (e) {
      Alert.alert('Error', 'Could not accept lead. Please try again.')
    }
  }

  async function handleDecline(leadId) {
    Alert.alert(
      'Decline Lead',
      'Are you sure you want to decline this lead?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'leads', leadId), {
                status: 'declined',
                updatedAt: serverTimestamp()
              })
            } catch (e) {
              Alert.alert('Error', 'Could not decline lead. Please try again.')
            }
          }
        }
      ]
    )
  }

  const activeLeads = leads.filter(l => l.status === 'new')
  const completed   = leads.filter(l => l.status === 'complete')
  const monthGMV    = completed.reduce((sum, l) => sum + (l.jobValue || 0), 0)

  const statusColor = (s) => {
    if (s === 'new')         return { bg: 'rgba(224,123,42,0.15)', text: AMBER2, label: 'NEW' }
    if (s === 'quoted')      return { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD', label: 'QUOTED' }
    if (s === 'in_progress') return { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD', label: 'IN PROGRESS' }
    if (s === 'complete')    return { bg: 'rgba(16,185,129,0.15)', text: GREEN, label: 'COMPLETE' }
    return { bg: 'rgba(255,255,255,0.1)', text: MUTED, label: s }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={s.muted}>Bridge Pro · Contractor</Text>
        <Text style={s.heading}>Dashboard</Text>

        <View style={s.stormBanner}>
          <Ionicons name="thunderstorm" size={16} color={AMBER2} style={{ marginRight: 8, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.stormBadge}>STORM ALERT IN YOUR AREA</Text>
            <Text style={s.stormTitle}>Hail Warning — Bexar County</Text>
            <Text style={s.stormBody}>New homeowner requests incoming. Respond fast to rank higher.</Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{activeLeads.length}</Text>
            <Text style={s.statLabel}>New Leads</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: GREEN }]}>${monthGMV.toLocaleString()}</Text>
            <Text style={s.statLabel}>Month GMV</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: AMBER2 }]}>4.9</Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Incoming Requests</Text>
        {loading ? (
          <ActivityIndicator color={AMBER} style={{ marginTop: 20 }} />
        ) : leads.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="notifications-outline" size={36} color={MUTED} style={{ marginBottom: 12 }} />
            <Text style={s.emptyText}>No leads yet — you'll be notified when a storm alert fires in your area.</Text>
          </View>
        ) : leads.map(lead => {
          const sc = statusColor(lead.status)
          return (
            <View key={lead.id} style={[s.leadCard, lead.status === 'new' && s.leadCardNew]}>
              <View style={s.leadTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.leadName}>{lead.homeownerName || 'Homeowner'}</Text>
                  <Text style={s.leadAddr}>{lead.address || 'Address on file'}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[s.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
              </View>
              <Text style={s.leadService}>{lead.serviceType || 'Storm repair'} · EagleView report available</Text>
              {lead.status === 'new' && (
                <View style={s.leadBtns}>
                  <TouchableOpacity
                    style={s.btnAccept}
                    activeOpacity={0.8}
                    onPress={() => handleAccept(lead.id)}
                  >
                    <Text style={s.btnAcceptText}>Accept Lead</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.btnDecline}
                    activeOpacity={0.8}
                    onPress={() => handleDecline(lead.id)}
                  >
                    <Text style={s.btnDeclineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:       { fontSize: 26, fontWeight: '700', color: WHITE, marginBottom: 16 },
  muted:         { fontSize: 12, color: MUTED, marginBottom: 4 },
  stormBanner:   { backgroundColor: 'rgba(224,123,42,0.12)', borderWidth: 1, borderColor: 'rgba(224,123,42,0.4)', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start' },
  stormBadge:    { fontSize: 10, fontWeight: '800', color: AMBER2, letterSpacing: 0.5, marginBottom: 4 },
  stormTitle:    { fontSize: 14, fontWeight: '700', color: WHITE, marginBottom: 3 },
  stormBody:     { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox:       { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, alignItems: 'center' },
  statNum:       { fontSize: 22, fontWeight: '700', color: WHITE },
  statLabel:     { fontSize: 10, color: MUTED, marginTop: 2 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  emptyCard:     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText:     { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },
  leadCard:      { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 10 },
  leadCardNew:   { backgroundColor: 'rgba(224,123,42,0.08)', borderColor: 'rgba(224,123,42,0.25)' },
  leadTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  leadName:      { fontSize: 13, fontWeight: '700', color: WHITE },
  leadAddr:      { fontSize: 11, color: MUTED, marginTop: 2 },
  statusBadge:   { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:    { fontSize: 9, fontWeight: '800' },
  leadService:   { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
  leadBtns:      { flexDirection: 'row', gap: 8 },
  btnAccept:     { flex: 1, backgroundColor: AMBER, borderRadius: 10, padding: 10, alignItems: 'center' },
  btnAcceptText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  btnDecline:    { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnDeclineText:{ color: 'rgba(255,255,255,0.5)', fontSize: 12 },
})
