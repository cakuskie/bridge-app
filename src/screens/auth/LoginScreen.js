import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Polygon, Text as SvgText } from 'react-native-svg'
import { loginUser, registerUser } from '../../services/firebase'

const NAVY  = '#0F1F35'
const AMBER = '#E07B2A'
const AMBER2= '#F59E0B'
const GREEN = '#10B981'
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

const ACCOUNT_TYPES = ['Homeowner', 'Contractor']

export default function LoginScreen() {
  const [mode, setMode]         = useState('login')
  const [accountType, setAccountType] = useState('Homeowner')
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '', address: '', zip: '', company: '', serviceArea: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

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
        const type = accountType === 'Contractor' ? 'contractor' : 'homeowner'
        await registerUser(type, form)
      }
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth.*\)/, '').trim())
    } finally {
      setLoading(false)
    }
  }

  const isContractor = accountType === 'Contractor' && mode === 'signup'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">

          <BridgeLogo />
          <Text style={s.tagline}>Bridging the gap between doubt and clarity.</Text>

          {/* Sign In / Create Account toggle */}
          <View style={s.toggle}>
            <TouchableOpacity style={[s.tBtn, mode === 'login' && s.tBtnOn]} onPress={() => setMode('login')} activeOpacity={0.8}>
              <Text style={[s.tBtnText, mode === 'login' && s.tBtnTextOn]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tBtn, mode === 'signup' && s.tBtnOn]} onPress={() => setMode('signup')} activeOpacity={0.8}>
              <Text style={[s.tBtnText, mode === 'signup' && s.tBtnTextOn]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Account type selector — only show on signup */}
          {mode === 'signup' && (
            <View style={s.typeRow}>
              {ACCOUNT_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeBtn, accountType === t && s.typeBtnOn]}
                  onPress={() => setAccountType(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.typeBtnText, accountType === t && s.typeBtnTextOn]}>
                    {t === 'Homeowner' ? '🏠 Homeowner' : '🔨 Contractor'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Contractor info banner */}
          {isContractor && (
            <View style={s.contractorBanner}>
              <Text style={s.contractorBannerTitle}>Contractor Account</Text>
              <Text style={s.contractorBannerBody}>
                Create your account below to access the Bridge contractor dashboard. To unlock lead responses, complete your background check and subscription at bridgeverified.com after signing up.
              </Text>
            </View>
          )}

          {/* Common fields */}
          {mode === 'signup' && (
            <TextInput
              style={s.input}
              placeholder="Full Name"
              placeholderTextColor={MUTED}
              value={form.name}
              onChangeText={v => update('name', v)}
            />
          )}

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor={MUTED}
            value={form.email}
            onChangeText={v => update('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor={MUTED}
            value={form.password}
            onChangeText={v => update('password', v)}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
          />

          {/* Homeowner-specific fields */}
          {mode === 'signup' && accountType === 'Homeowner' && (
            <>
              <TextInput
                style={s.input}
                placeholder="Phone"
                placeholderTextColor={MUTED}
                value={form.phone}
                onChangeText={v => update('phone', v)}
                keyboardType="phone-pad"
              />
              <TextInput
                style={s.input}
                placeholder="Property Address"
                placeholderTextColor={MUTED}
                value={form.address}
                onChangeText={v => update('address', v)}
                autoComplete="street-address"
                textContentType="streetAddressLine1"
              />
              <TextInput
                style={s.input}
                placeholder="ZIP Code"
                placeholderTextColor={MUTED}
                value={form.zip}
                onChangeText={v => update('zip', v)}
                keyboardType="numeric"
              />
            </>
          )}

          {/* Contractor-specific fields */}
          {isContractor && (
            <>
              <TextInput
                style={s.input}
                placeholder="Company Name"
                placeholderTextColor={MUTED}
                value={form.company}
                onChangeText={v => update('company', v)}
              />
              <TextInput
                style={s.input}
                placeholder="Phone"
                placeholderTextColor={MUTED}
                value={form.phone}
                onChangeText={v => update('phone', v)}
                keyboardType="phone-pad"
              />
              <TextInput
                style={s.input}
                placeholder="Service Area (e.g. San Antonio, TX)"
                placeholderTextColor={MUTED}
                value={form.serviceArea}
                onChangeText={v => update('serviceArea', v)}
                autoComplete="postal-address"
                textContentType="addressCity"
              />
            </>
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            style={s.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={WHITE} />
              : <Text style={s.submitText}>{mode === 'login' ? 'Sign In →' : 'Create Account →'}</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  wrap:                  { flexGrow: 1, padding: 28, justifyContent: 'center' },
  tagline:               { fontSize: 13, color: MUTED, textAlign: 'center', marginBottom: 32 },
  toggle:                { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tBtn:                  { flex: 1, padding: 10, borderRadius: 9, alignItems: 'center' },
  tBtnOn:                { backgroundColor: AMBER },
  tBtnText:              { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  tBtnTextOn:            { color: WHITE },
  typeRow:               { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn:               { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, alignItems: 'center' },
  typeBtnOn:             { borderColor: AMBER, backgroundColor: 'rgba(224,123,42,0.1)' },
  typeBtnText:           { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  typeBtnTextOn:         { color: AMBER2 },
  contractorBanner:      { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 12, padding: 14, marginBottom: 16 },
  contractorBannerTitle: { fontSize: 13, fontWeight: '700', color: GREEN, marginBottom: 6 },
  contractorBannerBody:  { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18 },
  input:                 { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, fontSize: 14, color: WHITE, marginBottom: 12 },
  error:                 { fontSize: 13, color: '#FCA5A5', marginBottom: 12, textAlign: 'center' },
  submitBtn:             { backgroundColor: AMBER, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText:            { color: WHITE, fontWeight: '800', fontSize: 15 },
})
