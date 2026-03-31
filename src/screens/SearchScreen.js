import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { getVerifiedContractors, submitLeadRequest } from '../services/contractorService'

const NAVY   = '#0F1F35'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'
const BLUE   = '#3B82F6'

const FILTERS = ['All', 'Insurance', 'Retail', 'Storm Repair', 'Hail Damage', 'Full Replace', 'Gutters', 'Inspections', 'Windows', 'Siding', 'Insurance Claims']

export default function SearchScreen() {
  const [contractors, setContractors] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('All')
  const [selected, setSelected]       = useState(null)
  const [requestSent, setRequestSent] = useState(false)
  const [form, setForm]               = useState({ serviceType: 'Storm Repair', description: '', address: '' })

  useEffect(() => {
    setLoading(true)
    getVerifiedContractors(filter).then(setContractors).finally(() => setLoading(false))
  }, [filter])

  async function handleRequest() {
    if (!selected) return
    await submitLeadRequest(selected.id, 'guest', form)
    setRequestSent(true)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={s.heading}>Find a Contractor</Text>
        <View style={s.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" />
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>Roofing, gutters, windows…</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => { setFilter(f); setSelected(null); setRequestSent(false) }} style={[s.chip, filter === f && s.chipOn]}>
                <Text style={[s.chipText, filter === f && s.chipTextOn]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {loading ? (
          <ActivityIndicator color={AMBER} style={{ marginTop: 20 }} />
        ) : (
          <>
            <Text style={s.countLabel}>{contractors.length} VERIFIED PRO{contractors.length !== 1 ? 'S' : ''}{filter !== 'All' ? ` FOR ${filter.toUpperCase()}` : ' NEAR YOU'}</Text>
            {contractors.length === 0 ? (
              <View style={s.emptyCard}>
                <Ionicons name="search-outline" size={40} color={MUTED} style={{ marginBottom: 12 }} />
                <Text style={s.emptyTitle}>No contractors for this service yet</Text>
                <Text style={s.emptyBody}>Check back soon — we're growing our verified network.</Text>
              </View>
            ) : contractors.map(c => (
              <TouchableOpacity key={c.id} onPress={() => { setSelected(c); setRequestSent(false) }} style={[s.card, selected?.id === c.id && s.cardSelected]}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <View style={s.avatar}><Ionicons name="home" size={20} color={BLUE} /></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={s.name}>{c.company || c.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="star" size={11} color={AMBER2} />
                        <Text style={s.rating}>{c.rating ?? '5.0'}</Text>
                      </View>
                    </View>
                    <Text style={s.sub}>{c.serviceArea ?? 'Texas'}</Text>
                    {c.services && c.services.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                          {c.services.map(svc => (
                            <View key={svc} style={[s.svcTag, svc === filter && s.svcTagOn]}>
                              <Text style={[s.svcTagText, svc === filter && s.svcTagTextOn]}>{svc}</Text>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    )}
                    <View style={s.badges}>
                      <View style={s.badgeGreen}><Text style={s.badgeGreenText}>Bridge Verified</Text></View>
                      <View style={s.badgeBlue}><Text style={s.badgeBlueText}>BGC</Text></View>
                    </View>
                    <TouchableOpacity style={[s.btnPrimary, { marginTop: 10 }]} onPress={() => { setSelected(c); setRequestSent(false) }}>
                      <Text style={s.btnPrimaryText}>Request Quote</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
        {selected && !requestSent && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Request a Quote — {selected.company || selected.name}</Text>
            <Text style={s.label}>SERVICE TYPE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {['Storm Repair', 'Hail Damage', 'Inspection', 'Full Replace'].map(t => (
                <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, serviceType: t }))} style={[s.option, form.serviceType === t && s.optionOn]}>
                  <Text style={[s.optionText, form.serviceType === t && s.optionTextOn]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>PROPERTY ADDRESS</Text>
            <TextInput value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} placeholder="Your property address" placeholderTextColor="rgba(255,255,255,0.3)" style={s.input} />
            <Text style={s.label}>DESCRIBE THE DAMAGE</Text>
            <TextInput value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="Describe what you're seeing…" placeholderTextColor="rgba(255,255,255,0.3)" multiline style={[s.input, { height: 80 }]} />
            <TouchableOpacity style={s.submitBtn} onPress={handleRequest}>
              <Text style={s.submitBtnText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        )}
        {requestSent && (
          <View style={s.confirmCard}>
            <Ionicons name="checkmark-circle" size={48} color={GREEN} style={{ marginBottom: 10 }} />
            <Text style={s.confirmTitle}>Request Sent!</Text>
            <Text style={s.confirmSub}>{selected.company || selected.name} will be in touch shortly.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  heading:        { fontSize: 24, fontWeight: '700', color: WHITE, marginBottom: 16 },
  searchBar:      { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  chip:           { borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 },
  chipOn:         { backgroundColor: AMBER, borderColor: AMBER },
  chipText:       { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  chipTextOn:     { color: WHITE },
  countLabel:     { fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 1, marginBottom: 12 },
  emptyCard:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 32, alignItems: 'center', marginTop: 8 },
  emptyTitle:     { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 6 },
  emptyBody:      { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },
  card:           { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardSelected:   { borderColor: 'rgba(224,123,42,0.4)', backgroundColor: 'rgba(224,123,42,0.06)' },
  avatar:         { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(59,130,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  name:           { fontSize: 14, fontWeight: '700', color: WHITE },
  rating:         { fontSize: 12, color: AMBER2 },
  sub:            { fontSize: 11, color: MUTED, marginTop: 2 },
  svcTag:         { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  svcTagOn:       { backgroundColor: 'rgba(224,123,42,0.15)', borderColor: 'rgba(224,123,42,0.4)' },
  svcTagText:     { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  svcTagTextOn:   { color: AMBER2 },
  badges:         { flexDirection: 'row', gap: 6, marginTop: 8 },
  badgeGreen:     { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  badgeGreenText: { fontSize: 9, fontWeight: '800', color: GREEN },
  badgeBlue:      { backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  badgeBlueText:  { fontSize: 9, fontWeight: '800', color: '#93C5FD' },
  btnPrimary:     { backgroundColor: AMBER, borderRadius: 8, padding: 9, alignItems: 'center' },
  btnPrimaryText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  formCard:       { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, marginTop: 8 },
  formTitle:      { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 16 },
  label:          { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  option:         { borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  optionOn:       { borderColor: AMBER, backgroundColor: 'rgba(224,123,42,0.1)' },
  optionText:     { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  optionTextOn:   { color: AMBER2 },
  input:          { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 11, fontSize: 13, color: WHITE, marginBottom: 14 },
  submitBtn:      { backgroundColor: AMBER, borderRadius: 12, padding: 14, alignItems: 'center' },
  submitBtnText:  { color: WHITE, fontWeight: '800', fontSize: 14 },
  confirmCard:    { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 14, padding: 24, marginTop: 8, alignItems: 'center' },
  confirmTitle:   { fontSize: 16, fontWeight: '700', color: WHITE, marginBottom: 6 },
  confirmSub:     { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
})
