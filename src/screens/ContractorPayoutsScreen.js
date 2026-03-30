import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db, auth } from '../services/firebase'

const NAVY=  '#0F1F35'
const AMBER= '#E07B2A'
const AMBER2='#F59E0B'
const GREEN= '#10B981'
const MUTED= '#7B8FA6'
const WHITE= '#FAFAFA'

export default function ContractorPayoutsScreen() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const q = query(
      collection(db, 'leads'),
      where('contractorId', '==', uid),
      where('status', '==', 'complete'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const totalEarned  = payouts.reduce((sum, p) => sum + (p.jobValue || 0), 0)
  const platformFee  = totalEarned * 0.05
  const netEarned    = totalEarned - platformFee

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={s.heading}>Earnings & Payouts</Text>

        {/* Summary card */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total Earned</Text>
            <Text style={s.summaryValue}>${totalEarned.toLocaleString()}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Platform Fee (5%)</Text>
            <Text style={[s.summaryValue, { color: 'rgba(255,255,255,0.45)' }]}>−${platformFee.toLocaleString()}</Text>
          </View>
          <View style={[s.summaryRow, { borderBottomWidth: 0, paddingTop: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[s.summaryLabel, { color: WHITE, fontWeight: '700' }]}>Net Payout</Text>
            <Text style={[s.summaryValue, { color: GREEN, fontSize: 22 }]}>${netEarned.toLocaleString()}</Text>
          </View>
        </View>

        {/* Launch promo */}
        <View style={s.promoCard}>
          <Text style={s.promoTitle}>🎉 Founding Pro — 90-Day Free Period</Text>
          <Text style={s.promoBody}>Platform fees waived for your first 90 days. You're keeping 100% right now.</Text>
        </View>

        {/* Payout history */}
        <Text style={s.sectionTitle}>Completed Jobs</Text>
        {loading ? (
          <ActivityIndicator color={AMBER} style={{ marginTop: 20 }} />
        ) : payouts.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Completed jobs will appear here once marked done.</Text>
          </View>
        ) : payouts.map(p => (
          <View key={p.id} style={s.payoutRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.payoutName}>{p.homeownerName || 'Homeowner'}</Text>
              <Text style={s.payoutAddr}>{p.address || ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.payoutAmt}>${(p.jobValue || 0).toLocaleString()}</Text>
              <View style={s.paidBadge}><Text style={s.paidText}>✓ PAID</Text></View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:      { fontSize: 26, fontWeight: '700', color: '#FAFAFA', marginBottom: 20 },
  summaryCard:  { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 16 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  summaryLabel: { fontSize: 14, color: MUTED },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#FAFAFA' },
  promoCard:    { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 14, padding: 16, marginBottom: 24 },
  promoTitle:   { fontSize: 13, fontWeight: '700', color: GREEN, marginBottom: 4 },
  promoBody:    { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  emptyCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText:    { fontSize: 13, color: MUTED, textAlign: 'center' },
  payoutRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, marginBottom: 10 },
  payoutName:   { fontSize: 13, fontWeight: '700', color: '#FAFAFA' },
  payoutAddr:   { fontSize: 11, color: MUTED, marginTop: 2 },
  payoutAmt:    { fontSize: 15, fontWeight: '700', color: GREEN },
  paidBadge:    { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  paidText:     { fontSize: 9, fontWeight: '800', color: GREEN },
})
