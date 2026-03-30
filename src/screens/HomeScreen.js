import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Linking, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const NAVY   = '#0F1F35'
const NAVY2  = '#162840'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'

const REPORT_OPTIONS = [
  {
    icon: '🏛️',
    title: 'Texas Dept. of Insurance',
    body: 'File a complaint about a contractor or adjuster with the TDI.',
    url: 'https://www.tdi.texas.gov/consumer/complaintprocess.html',
    color: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.35)',
    textColor: '#93C5FD',
  },
  {
    icon: '⚖️',
    title: 'Texas Attorney General',
    body: 'Report deceptive contractor practices to the TX AG Consumer Protection division.',
    url: 'https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint',
    color: 'rgba(224,123,42,0.12)',
    border: 'rgba(224,123,42,0.35)',
    textColor: AMBER2,
  },
  {
    icon: '🔍',
    title: 'BBB Scam Tracker',
    body: 'Report and research scam contractors in your area via the Better Business Bureau.',
    url: 'https://www.bbb.org/scamtracker',
    color: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.35)',
    textColor: '#FCA5A5',
  },
]

const HOMEOWNER_LINKS = [
  {
    icon: '🚫',
    title: 'Report a Storm Chaser',
    body: 'Solicited after a storm? Report them through an official channel.',
    color: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    textColor: '#FCA5A5',
    isReport: true,
  },
  {
    icon: '🏅',
    title: 'Get Your Anti-Chaser Decal',
    body: 'Free physical decal shipped to your door. Tell chasers you\'re protected.',
    url: 'https://bridgeverified.com/decal',
    color: 'rgba(224,123,42,0.08)',
    border: 'rgba(224,123,42,0.3)',
    textColor: AMBER2,
  },
  {
    icon: '📊',
    title: 'Texas Storm Chaser Impact Report',
    body: 'See real data on predatory contractors across Texas.',
    url: 'https://bridgeverified.com/report/texas',
    color: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
    textColor: '#93C5FD',
  },
]

export default function HomeScreen() {
  const [profile, setProfile]         = useState(null)
  const [photoUri, setPhotoUri]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [reportModal, setReportModal] = useState(false)

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    getDoc(doc(db, 'homeowners', uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        setProfile(data)
        if (data.propertyPhoto) setPhotoUri(data.propertyPhoto)
      }
      setLoading(false)
    })
  }, [])

  const firstName = profile?.name?.split(' ')[0]
    || auth.currentUser?.displayName?.split(' ')[0]
    || 'there'

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to add a property photo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      setPhotoUri(uri)
      const uid = auth.currentUser?.uid
      if (uid) await updateDoc(doc(db, 'homeowners', uid), { propertyPhoto: uri })
    }
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a property photo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      setPhotoUri(uri)
      const uid = auth.currentUser?.uid
      if (uid) await updateDoc(doc(db, 'homeowners', uid), { propertyPhoto: uri })
    }
  }

  function handlePhotoPress() {
    Alert.alert(
      'Property Photo',
      'Add a photo of your home',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickPhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={AMBER} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={s.greeting}>Hello, {firstName} 👋</Text>

        {/* Property photo box */}
        <View style={s.photoBox}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={s.photo} resizeMode="cover" />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🏠</Text>
              <Text style={s.photoPlaceholderText}>Add a photo of your property</Text>
            </View>
          )}
          <TouchableOpacity style={s.cameraBtn} onPress={handlePhotoPress}>
            <Text style={{ fontSize: 18 }}>📷</Text>
          </TouchableOpacity>
        </View>

        {profile?.address && (
          <Text style={s.address}>📍 {profile.address}</Text>
        )}

        {/* Protected banner */}
        <View style={s.protectedBanner}>
          <View style={s.shieldWrap}>
            <Text style={{ fontSize: 28 }}>🛡️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.protectedTitle}>This Property Is Protected By Bridge</Text>
            <Text style={s.protectedSub}>Verified contractors only. Storm chasers, move along.</Text>
          </View>
        </View>

        {/* Homeowner tools */}
        <Text style={s.sectionTitle}>Homeowner Tools</Text>
        {HOMEOWNER_LINKS.map(link => (
          <TouchableOpacity
            key={link.title}
            style={[s.linkCard, { backgroundColor: link.color, borderColor: link.border }]}
            onPress={() => link.isReport ? setReportModal(true) : Linking.openURL(link.url)}
          >
            <Text style={s.linkIcon}>{link.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.linkTitle, { color: link.textColor }]}>{link.title}</Text>
              <Text style={s.linkBody}>{link.body}</Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={reportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Report a Storm Chaser</Text>
            <Text style={s.modalSub}>Choose where to file your report:</Text>

            {REPORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.title}
                style={[s.reportCard, { backgroundColor: opt.color, borderColor: opt.border }]}
                onPress={() => {
                  setReportModal(false)
                  Linking.openURL(opt.url)
                }}
              >
                <View style={[s.reportIconWrap, { borderColor: opt.border }]}>
                  <Text style={{ fontSize: 24 }}>{opt.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.reportTitle, { color: opt.textColor }]}>{opt.title}</Text>
                  <Text style={s.reportBody}>{opt.body}</Text>
                </View>
                <Text style={{ color: MUTED, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={s.cancelBtn} onPress={() => setReportModal(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  greeting:             { fontSize: 26, fontWeight: '700', color: WHITE, marginBottom: 20 },
  photoBox:             { width: '100%', height: 200, borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 10, position: 'relative' },
  photo:                { width: '100%', height: '100%' },
  photoPlaceholder:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 13, color: MUTED, marginTop: 4 },
  cameraBtn:            { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 100, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  address:              { fontSize: 13, color: MUTED, marginBottom: 16 },
  protectedBanner:      { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  shieldWrap:           { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  protectedTitle:       { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 4 },
  protectedSub:         { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  sectionTitle:         { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  linkCard:             { borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  linkIcon:             { fontSize: 24, flexShrink: 0 },
  linkTitle:            { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  linkBody:             { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  // Modal
  modalOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet:           { backgroundColor: NAVY2, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle:          { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 100, alignSelf: 'center', marginBottom: 20 },
  modalTitle:           { fontSize: 20, fontWeight: '700', color: WHITE, marginBottom: 6 },
  modalSub:             { fontSize: 13, color: MUTED, marginBottom: 20 },
  reportCard:           { borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  reportIconWrap:       { width: 48, height: 48, borderRadius: 14, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reportTitle:          { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  reportBody:           { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 17 },
  cancelBtn:            { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  cancelText:           { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
})
