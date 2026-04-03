import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Polygon, Text as SvgText } from 'react-native-svg'
import { loginUser, registerUser } from '../../services/firebase'

const NAVY  = '#0F1F35'
const AMBER = '#E07B2A'
const MUTED = '#7B8FA6'
const WHITE = '#FAFAFA'

function BridgeLogo() {
  const size = 80
  const cx = size / 2
  const cy = size / 2
  const r  = size / 2
  const pts = [0,1,2,3,4,5].map(i => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
  return (
    <View style={{ alignItems: 'center', marginBottom: 8 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Polygon points={pts} fill="#E07B2A" />
        <SvgText
          x={cx} y={cy}
          textAnchor="middle"
          alignmentBaseline="central"
          fontFamily="Georgia, serif"
          fontSize={size * 0.56}
          fontWeight="700"
          fill="white"
        >B</SvgText>
      </Svg>
    </View>
  )
}

export default function LoginScreen() {
  const [mode, setMode]     = useState('login')
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '', address: '', zip: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await loginUser(form.email, form.password)
      } else {
        await registerUser('homeowner', form)
      }
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth.*\)/, '').trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">

          <BridgeLogo />
          <Text style={s.tagline}>Bridging the gap between doubt and clarity.</Text>

          <View style={s.toggle}>
            <TouchableOpacity style={[s.tBtn, mode === 'login' && s.tBtnOn]} onPress={() => setMode('login')}>
              <Text style={[s.tBtnText, mode === 'login' && s.tBtnTextOn]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tBtn, mode === 'signup' && s.tBtnOn]} onPress={() => setMode('signup')}>
              <Text style={[s.tBtnText, mode === 'signup' && s.tBtnTextOn]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <TextInput style={s.input} placeholder="Full Name" placeholderTextColor={MUTED} value={form.name} onChangeText={v => update('name', v)} />
          )}

          <TextInput style={s.input} placeholder="Email" placeholderTextColor={MUTED} value={form.email} onChangeText={v => update('email', v)} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor={MUTED} value={form.password} onChangeText={v => update('password', v)} secureTextEntry />

          {mode === 'signup' && (
            <>
              <TextInput style={s.input} placeholder="Phone" placeholderTextColor={MUTED} value={form.phone} onChangeText={v => update('phone', v)} keyboardType="phone-pad" />
              <TextInput style={s.input} placeholder="Property Address" placeholderTextColor={MUTED} value={form.address} onChangeText={v => update('address', v)} />
              <TextInput style={s.input} placeholder="ZIP Code" placeholderTextColor={MUTED} value={form.zip} onChangeText={v => update('zip', v)} keyboardType="numeric" />
            </>
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={WHITE} />
              : <Text style={s.submitText}>{mode === 'login' ? 'Sign In →' : 'Create Account →'}</Text>
            }
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>Are you a contractor?</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity style={s.contractorBtn} onPress={() => Linking.openURL('https://bridgeverified.com')}>
            <Text style={s.contractorText}>Join as a Contractor →</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  wrap:          { flexGrow: 1, padding: 28, justifyContent: 'center' },
  tagline:       { fontSize: 13, color: MUTED, textAlign: 'center', marginBottom: 32 },
  toggle:        { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tBtn:          { flex: 1, padding: 10, borderRadius: 9, alignItems: 'center' },
  tBtnOn:        { backgroundColor: AMBER },
  tBtnText:      { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  tBtnTextOn:    { color: WHITE },
  input:         { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, fontSize: 14, color: WHITE, marginBottom: 12 },
  error:         { fontSize: 13, color: '#FCA5A5', marginBottom: 12, textAlign: 'center' },
  submitBtn:     { backgroundColor: AMBER, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText:    { color: WHITE, fontWeight: '800', fontSize: 15 },
  divider:       { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 10 },
  divLine:       { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  divText:       { fontSize: 12, color: MUTED },
  contractorBtn: { borderWidth: 1, borderColor: 'rgba(224,123,42,0.4)', borderRadius: 14, padding: 16, alignItems: 'center' },
  contractorText:{ color: AMBER, fontWeight: '700', fontSize: 14 },
})
