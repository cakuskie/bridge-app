// Bridge Weather Service — React Native
// NWS alerts are free and unlimited — no API key needed
// Tomorrow.io key stored in app config

const TOMORROW_KEY = 'your_tomorrow_api_key_here' // replace when ready

const SEVERITY_RANK = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 }

export function nwsIcon(event = '') {
  const e = event.toLowerCase()
  if (e.includes('tornado'))      return '🌪️'
  if (e.includes('hail'))         return '⚡'
  if (e.includes('flood'))        return '🌊'
  if (e.includes('thunderstorm')) return '⛈️'
  if (e.includes('wind'))         return '💨'
  if (e.includes('winter') || e.includes('snow') || e.includes('ice')) return '❄️'
  return '⚠️'
}

export async function fetchNWSAlerts() {
  const res = await fetch('https://api.weather.gov/alerts/active?area=TX', {
    headers: { 'User-Agent': 'BridgeVerified/1.0 contact@bridgeverified.com' }
  })
  if (!res.ok) throw new Error(`NWS error: ${res.status}`)
  const json = await res.json()
  return (json.features ?? []).map(f => ({
    id:       f.id,
    event:    f.properties.event,
    headline: f.properties.headline,
    area:     f.properties.areaDesc,
    severity: f.properties.severity,
    expires:  f.properties.expires,
  }))
}

export async function fetchTickerAlerts() {
  try {
    const nwsAlerts = await fetchNWSAlerts()
    const significant = nwsAlerts
      .filter(a => ['Minor','Moderate','Severe','Extreme'].includes(a.severity))
      .sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0))

    if (significant.length > 0) {
      const expanded = []
      for (const a of significant) {
        const areas = a.area.split(';').map(s => s.trim()).filter(Boolean)
        for (const area of areas) {
          expanded.push({
            icon:     nwsIcon(a.event),
            county:   area,
            desc:     a.event,
            severity: a.severity,
          })
          if (expanded.length >= 16) break
        }
        if (expanded.length >= 16) break
      }
      return expanded
    }

    return [
      { county: 'Dallas / Fort Worth',    icon: '✅', desc: 'No Active Alerts' },
      { county: 'Houston Metro',           icon: '✅', desc: 'No Active Alerts' },
      { county: 'San Antonio',             icon: '✅', desc: 'No Active Alerts' },
      { county: 'Austin / Central TX',     icon: '✅', desc: 'No Active Alerts' },
      { county: 'Lubbock / Panhandle',     icon: '✅', desc: 'No Active Alerts' },
    ]
  } catch (err) {
    console.error('NWS fetch failed:', err)
    return [{ icon: '📡', county: 'Texas', desc: 'Monitoring…' }]
  }
}

export async function fetchHeroCondition() {
  try {
    const nwsAlerts = await fetchNWSAlerts()
    const top = nwsAlerts
      .filter(a => ['Moderate','Severe','Extreme'].includes(a.severity))
      .sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0))[0]

    if (top) {
      const event = top.event.toLowerCase()
      let icon  = nwsIcon(top.event)
      let level = 'severe'
      let label = top.event
      if (top.severity === 'Extreme') level = 'extreme'
      return { level, icon, label, location: top.area.split(';')[0].trim() }
    }

    return { level: 'clear', icon: '✅', label: 'All Clear', location: 'Texas' }
  } catch {
    return { level: 'clear', icon: '✅', label: 'All Clear', location: 'Texas' }
  }
}
