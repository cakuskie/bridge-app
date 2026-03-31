import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { Ionicons } from '@expo/vector-icons'

const NAVY=  '#0F1F35'
const AMBER= '#E07B2A'
const AMBER2='#F59E0B'
const GREEN= '#10B981'
const BLUE=  '#3B82F6'
const MUTED= '#7B8FA6'
const WHITE= '#FAFAFA'

export default function ContractorJobsScreen() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const q = query(
      collection(db, 'leads'),
      where('contractorId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const filters = ['all', 'in_progress', 'complete']
  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

  const jobColor = (s) => {
    if (s === 'in_progress') return { color: '#93C5FD', label: 'IN PROGRESS' }
    if (s === 'complete')    return { color: GREEN, label: '✓ COMPLETE' }
    if (s === 'new')         return { color: AMBER2, label: 'NEW' }
    return { color: MUTED, label: s?.toUpperCase() || 'PENDING' }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <View style={s.header}>
        <Text style={s.heading}>Job Management</Text>
      </View>

      {/* Filter chips */}
      <View style={s.chips}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipOn]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipText, filter === f && s.chipTextOn]}>
              {f === 'all' ? 'All Jobs' : f === 'in_progress' ? 'In Progress' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator color={AMBER} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>📋</Text>
            <Text style={s.emptyText}>No jobs in this category yet.</Text>
          </View>
        ) : filtered.map(job => {
          const jc = jobColor(job.status)
          return (
            <View key={job.id} style={s.jobCard}>
              <View style={s.jobTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.jobName}>{job.homeownerName || 'Homeowner'}</Text>
                  <Text style={s.jobAddr}>{job.address || 'Address on file'}</Text>
                </View>
                <Text style={[s.jobStatus, { color: jc.color }]}>{jc.label}</Text>
              </View>
              <View style={s.jobMeta}>
                <Text style={s.jobMetaText}>🔧 {job.serviceType || 'Storm repair'}</Text>
                {job.jobValue ? <Text style={s.jobMetaText}>💰 ${job.jobValue.toLocaleString()}</Text> : null}
                {job.scheduledDate ? <Text style={s.jobMetaText}>📅 {job.scheduledDate}</Text> : null}
              </View>
              {job.status === 'in_progress' && (
                <TouchableOpacity style={s.btnComplete}>
                  <Text style={s.btnCompleteText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  heading:        { fontSize: 26, fontWeight: '700', color: '#FAFAFA' },
  chips:          { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip:           { borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipOn:         { backgroundColor: AMBER, borderColor: 'transparent' },
  chipText:       { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  chipTextOn:     { color: '#FAFAFA' },
  emptyCard:      { alignItems: 'center', paddingTop: 60 },
  emptyText:      { fontSize: 14, color: MUTED },
  jobCard:        { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 12 },
  jobTop:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  jobName:        { fontSize: 14, fontWeight: '700', color: '#FAFAFA' },
  jobAddr:        { fontSize: 11, color: MUTED, marginTop: 2 },
  jobStatus:      { fontSize: 10, fontWeight: '800' },
  jobMeta:        { flexDirection: 'row', gap: 16, marginBottom: 12 },
  jobMetaText:    { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  btnComplete:    { backgroundColor: GREEN, borderRadius: 10, padding: 11, alignItems: 'center' },
  btnCompleteText:{ color: '#FAFAFA', fontWeight: '800', fontSize: 13 },
})
