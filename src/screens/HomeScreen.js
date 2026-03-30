import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const NAVY   = '#0F1F35'
const AMBER  = '#E07B2A'
const AMBER2 = '#F59E0B'
const GREEN  = '#10B981'
const MUTED  = '#7B8FA6'
const WHITE  = '#FAFAFA'
const RED    = '#EF4444'

const REPORT_LINKS = [
  {
    icon: '🚫',
    title: 'Report a Storm Chaser',
    body: 'Solicited after a storm? Report them in 60 seconds.',
    url: 'https://bridgeverified.com/report',
    color: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    textColor: '#FCA5A5',
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
    title: 'Texas Storm Chaser Report',
    body: 'See real data on predatory contractors across Texas.',
    url: 'https://bridgeverified.com/report/texas',
    color: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
    textColor: '#93C5FD',
  },
]

export default function HomeScreen() {
  const [profile, setProfile]       = useState(null)
  const [photoUri, setPhotoUri]     = useState(null)
  const [loading, setLoading]       = useState(true)

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
      // Save to Firestore
      const uid = auth.currentUser?.uid
      if (uid) {
        await updateDoc(doc(db, 'homeowners', uid), { propertyPhoto: uri })
      }
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
      if (uid) {
        await updateDoc(doc(db, 'homeowners', uid), { propertyPhoto: uri })
      }
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

        {/* Greeting */}
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
          {/* Camera button overlay */}
          <TouchableOpacity style={s.cameraBtn} onPress={handlePhotoPress}>
            <Text style={{ fontSize: 18 }}>📷</Text>
          </TouchableOpacity>
        </View>

        {/* Address */}
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

        {/* Report links */}
        <Text style={s.sectionTitle}>Homeowner Tools</Text>
        {REPORT_LINKS.map(link => (
          <TouchableOpacity
            key={link.title}
            style={[s.linkCard, { backgroundColor: link.color, borderColor: link.border }]}
            onPress={() => Linking.openURL(link.url)}
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
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  greeting:            { fontSize: 26, fontWeight: '700', color: WHITE, marginBottom: 20 },
  photoBox:            { width: '100%', height: 200, borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 10, position: 'relative' },
  photo:               { width: '100%', height: '100%' },
  photoPlaceholder:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText:{ fontSize: 13, color: MUTED, marginTop: 4 },
  cameraBtn:           { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 100, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  address:             { fontSize: 13, color: MUTED, marginBottom: 16 },
  protectedBanner:     { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  shieldWrap:          { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  protectedTitle:      { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 4 },
  protectedSub:        { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  sectionTitle:        { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  linkCard:            { borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  linkIcon:            { fontSize: 24, flexShrink: 0 },
  linkTitle:           { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  linkBody:            { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
})
