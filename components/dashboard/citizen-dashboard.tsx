'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin, Navigation, Search, AlertTriangle, Activity, Clock,
  Car, TrafficCone, ArrowRight, Square, Play, X, Loader2,
  TrendingUp, ChevronRight, Locate, Maximize2,
} from 'lucide-react'
import TrafficMap from './traffic-map'
import TrafficPrediction from './traffic-prediction'
import type { RouteCoords } from './traffic-map-inner'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

interface RouteStep {
  instruction: string
  distance: number
}

interface ActiveRoute {
  routeCoords: RouteCoords
  fromName: string
  toName: string
  distance: number
  duration: number
  steps: RouteStep[]
}

// Nominatim geocoding — returns [lat, lng] or null
async function geocode(query: string): Promise<[number, number] | null> {
  try {
    const trimmed = query.trim()
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${trimmed}, India`)}&format=json&limit=1&countrycodes=in`
    const res = await fetch(url, { headers: { 'User-Agent': 'DrishtiAI/1.0' } })
    const data = await res.json()
    if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    const fb = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'DrishtiAI/1.0' } }
    )
    const fbData = await fb.json()
    if (fbData && fbData.length > 0) return [parseFloat(fbData[0].lat), parseFloat(fbData[0].lon)]
    return null
  } catch { return null }
}

// OSRM routing — returns ActiveRoute or null
async function fetchOSRMRoute(from: [number, number], to: [number, number]): Promise<ActiveRoute | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`
    const data = await (await fetch(url)).json()
    if (data.code !== 'Ok' || !data.routes?.length) return null

    const route = data.routes[0]
    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    )
    const steps: RouteStep[] = []
    for (const leg of route.legs) {
      for (const step of leg.steps) {
        const maneuver = step.maneuver?.type || 'continue'
        const modifier = step.maneuver?.modifier || ''
        let instruction = ''
        if (maneuver === 'depart') instruction = `Head ${modifier || 'forward'}`
        else if (maneuver === 'turn' && modifier === 'left') instruction = 'Turn left'
        else if (maneuver === 'turn' && modifier === 'right') instruction = 'Turn right'
        else if (maneuver === 'turn' && modifier === 'slight left') instruction = 'Keep slight left'
        else if (maneuver === 'turn' && modifier === 'slight right') instruction = 'Keep slight right'
        else if (maneuver === 'turn' && modifier === 'sharp left') instruction = 'Turn sharp left'
        else if (maneuver === 'turn' && modifier === 'sharp right') instruction = 'Turn sharp right'
        else if (maneuver === 'continue') instruction = 'Continue straight'
        else if (maneuver === 'roundabout') instruction = 'Enter roundabout'
        else if (maneuver === 'arrive') instruction = 'Arrive at destination'
        else instruction = step.name ? `Continue on ${step.name}` : 'Continue'
        if (step.name && maneuver !== 'arrive' && step.name !== '') instruction += ` on ${step.name}`
        steps.push({ instruction, distance: Math.round(step.distance) })
      }
    }
    return {
      routeCoords: { coordinates: coords, distance: route.distance, duration: route.duration, steps },
      fromName: '', toName: '',
      distance: +(route.distance / 1000).toFixed(1),
      duration: Math.ceil(route.duration / 60),
      steps,
    }
  } catch { return null }
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`
}

const DEMO_INCIDENTS = [
  { msg: '🚨 VIP movement active — NH 27 partially blocked for 30 minutes', urgent: true },
  { msg: '🚑 Emergency vehicle corridor active near Hazratganj. Please yield.', urgent: true },
  { msg: '⚠️ Heavy congestion at Aminabad Market — expect 20 min delay', urgent: false },
  { msg: '🚧 Road closure on Ring Road — divert via Kaiserbagh', urgent: false },
  { msg: '🚨 Accident reported at Charbagh — emergency services dispatched', urgent: true },
]

const SIGNAL_CONFIGS = {
  red:    { bg: 'bg-red-500',    text: 'text-red-500',    label: 'RED — Stop',    ring: 'ring-2 ring-red-500/40' },
  green:  { bg: 'bg-green-500',  text: 'text-green-600',  label: 'GREEN — Go',    ring: 'ring-2 ring-green-500/40' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-600', label: 'YELLOW — Slow', ring: 'ring-2 ring-yellow-400/40' },
} as const

const INCIDENT_ROTATION_MS = 12000
const NAV_STEP_INTERVAL_MS = 5000
const GPS_MAX_AGE_MS = 5000
const MAX_VISIBLE_STEP_DOTS = 8
/** Simulated ETA reduction (minutes) and distance reduction (km) per nav step cycle */
const MINUTES_PER_NAV_STEP = 0.5
const KM_PER_NAV_STEP = 0.2
/** Simulated distance to next signal: starts at 300 m, increases 150 m per step */
const BASE_SIGNAL_DISTANCE_M = 300
const SIGNAL_DISTANCE_INCREMENT_M = 150

export default function CitizenDashboard({
  intersections,
}: {
  intersections: Intersection[]
  userId: string
}) {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null)
  const [incidentIdx, setIncidentIdx] = useState(0)
  const [navStep, setNavStep] = useState(0)
  const [navActive, setNavActive] = useState(false)
  const [gpsPosition, setGpsPosition] = useState<[number, number] | null>(null)
  const [gpsActive, setGpsActive] = useState(false)
  const gpsWatchRef = useRef<number | null>(null)

  // Rotate incidents automatically
  useEffect(() => {
    const t = setInterval(() => setIncidentIdx((i) => (i + 1) % DEMO_INCIDENTS.length), INCIDENT_ROTATION_MS)
    return () => clearInterval(t)
  }, [])

  // Advance nav step while route is active
  useEffect(() => {
    if (!activeRoute) return
    const t = setInterval(() => setNavStep((s) => (s + 1) % activeRoute.steps.length), NAV_STEP_INTERVAL_MS)
    return () => clearInterval(t)
  }, [activeRoute])

  // Clean up GPS watch on unmount
  useEffect(() => {
    return () => { if (gpsWatchRef.current !== null) navigator.geolocation.clearWatch(gpsWatchRef.current) }
  }, [])

  const startGPS = useCallback(() => {
    if (!navigator.geolocation) return
    if (gpsWatchRef.current !== null) navigator.geolocation.clearWatch(gpsWatchRef.current)
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => setGpsPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setGpsActive(false),
      { enableHighAccuracy: true, maximumAge: GPS_MAX_AGE_MS }
    )
    setGpsActive(true)
  }, [])

  const stopGPS = useCallback(() => {
    if (gpsWatchRef.current !== null) { navigator.geolocation.clearWatch(gpsWatchRef.current); gpsWatchRef.current = null }
    setGpsActive(false)
    setGpsPosition(null)
  }, [])

  const handleFindRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true); setActiveRoute(null); setNavStep(0)
    try {
      const [fromCoords, toCoords] = await Promise.all([geocode(source), geocode(destination)])
      if (!fromCoords) { setError(`Location not found: "${source}". Try a city or area name like "Hazratganj, Lucknow".`); return }
      if (!toCoords) { setError(`Location not found: "${destination}". Try a city or area name.`); return }
      const result = await fetchOSRMRoute(fromCoords, toCoords)
      if (!result) { setError('Route calculation failed. Please check the locations and try again.'); return }
      setActiveRoute({ ...result, fromName: source, toName: destination })
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally { setLoading(false) }
  }

  const clearRoute = () => { setActiveRoute(null); setNavStep(0); setNavActive(false); setError(null) }

  const currentStep = activeRoute?.steps[navStep]
  const nextStep = activeRoute?.steps[navStep + 1]
  const signalKeys = ['red', 'green', 'yellow'] as const
  const signalStyle = SIGNAL_CONFIGS[signalKeys[navStep % 3]]
  const incident = DEMO_INCIDENTS[incidentIdx]
  const etaMin = activeRoute ? Math.max(1, activeRoute.duration - Math.floor(navStep * MINUTES_PER_NAV_STEP)) : 0
  const distRemaining = activeRoute ? Math.max(0, activeRoute.distance - navStep * KM_PER_NAV_STEP).toFixed(1) : '0'

  // ── Shared floating nav panel (used both in fullscreen and sidebar) ──
  const RoutePlannerPanel = (
    <div className="space-y-3">
      <form onSubmit={handleFindRoute} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5 block">
            <MapPin className="w-3 h-3 text-green-600 inline" />From
          </label>
          <Input
            placeholder="e.g. Hazratganj, Lucknow"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={loading}
            required
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5 block">
            <MapPin className="w-3 h-3 text-red-500 inline" />To
          </label>
          <Input
            placeholder="e.g. Gomti Nagar, Lucknow"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={loading}
            required
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 text-sm"
          />
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium">
            {loading
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Calculating…</span>
              : <span className="flex items-center gap-2"><Search className="w-4 h-4" />Find Route</span>}
          </Button>
          {activeRoute && (
            <Button type="button" variant="outline" size="sm" onClick={clearRoute} className="border-gray-200 text-gray-500 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* GPS control */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className={gpsActive ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {gpsActive ? 'GPS Active' : 'GPS Off'}
          </span>
        </div>
        {gpsActive
          ? <Button size="sm" variant="outline" onClick={stopGPS} className="h-7 text-xs border-red-200 text-red-500 hover:bg-red-50">Stop GPS</Button>
          : <Button size="sm" variant="outline" onClick={startGPS} className="h-7 text-xs border-green-200 text-green-600 hover:bg-green-50">
              <Locate className="w-3 h-3 mr-1" />Live GPS
            </Button>}
      </div>

      {/* Route summary */}
      {activeRoute && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-semibold text-xs">
            <Activity className="w-3.5 h-3.5" />Route Calculated
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2.5 text-center border border-green-100 shadow-sm">
              <div className="text-green-700 font-bold text-lg">{activeRoute.distance} km</div>
              <div className="text-gray-400 text-[10px] mt-0.5">Distance</div>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center border border-green-100 shadow-sm">
              <div className="text-purple-600 font-bold text-lg">{activeRoute.duration} min</div>
              <div className="text-gray-400 text-[10px] mt-0.5">Est. Time</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="text-gray-700 font-medium truncate">{activeRoute.fromName}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0 text-gray-400" />
            <span className="text-gray-700 font-medium truncate">{activeRoute.toName}</span>
          </div>
          {!navActive
            ? <Button type="button" size="sm" onClick={() => { setNavActive(true); setNavStep(0) }}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium">
                <Play className="w-3.5 h-3.5 mr-1.5" />Start Navigation
              </Button>
            : <Button type="button" size="sm" variant="outline" onClick={() => setNavActive(false)}
                className="w-full border-red-200 text-red-500 hover:bg-red-50 text-xs">
                <Square className="w-3.5 h-3.5 mr-1.5" />Stop Navigation
              </Button>}
        </div>
      )}
    </div>
  )

  // Single return — conditional rendering avoids TypeScript narrowing activeRoute to null
  return (
    <div className="space-y-6" id="navigation">
      {/* Auto incident banner — always visible, cycles every 12 s */}
      <div className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl border ${
        incident.urgent ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${incident.urgent ? 'text-red-500' : 'text-amber-500'}`} />
        <span className="font-semibold text-xs mr-1">{incident.urgent ? 'URGENT:' : 'ALERT:'}</span>
        <span className="text-xs flex-1">{incident.msg}</span>
      </div>

      {activeRoute ? (
        /* ── Fullscreen map overlay when route is active ── */
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <div className="absolute inset-0">
            <TrafficMap
              intersections={intersections}
              onSelectIntersection={setSelectedIntersection}
              routeCoords={{ ...activeRoute.routeCoords, navActive }}
              {...(gpsPosition ? { gpsPosition, centerOnGps: true } : {})}
            />
          </div>

          {/* Close button */}
          <button
            onClick={clearRoute}
            className="absolute top-4 right-4 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-500 hover:shadow-xl transition-all border border-gray-200"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating left panel */}
          <div className="absolute top-4 left-4 z-10 w-72 space-y-3 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <Card className="bg-white/95 backdrop-blur shadow-xl border-gray-200">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-purple-600" />Route Navigation
                  <Maximize2 className="w-3.5 h-3.5 text-purple-400 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">{RoutePlannerPanel}</CardContent>
            </Card>

            {currentStep && (
              <Card className="bg-white/95 backdrop-blur shadow-xl border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1">Current Step</div>
                    <div className="text-sm font-bold text-gray-900">{currentStep.instruction}</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">{formatDistance(currentStep.distance)}</div>
                  </div>
                  {nextStep && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Then</div>
                      <div className="text-xs text-gray-700">{nextStep.instruction}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 ${signalStyle.bg} ${signalStyle.ring}`} />
                    <div>
                      <div className={`text-xs font-semibold ${signalStyle.text}`}>{signalStyle.label}</div>
                      <div className="text-[10px] text-gray-400">{BASE_SIGNAL_DISTANCE_M + navStep * SIGNAL_DISTANCE_INCREMENT_M} m ahead</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Step {navStep + 1} of {activeRoute.steps.length}</span>
                    <div className="flex gap-1">
                      {activeRoute.steps.slice(0, Math.min(MAX_VISIBLE_STEP_DOTS, activeRoute.steps.length)).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === navStep ? 'bg-purple-500' : i < navStep ? 'bg-purple-200' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom overlay: Distance + ETA */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg px-6 py-4">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{distRemaining} km</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Distance Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{etaMin} min</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 justify-center"><Clock className="w-3 h-3" />ETA</div>
              </div>
              <div className="text-center max-w-xs hidden md:block">
                <div className="text-sm font-semibold text-gray-800 truncate">{currentStep?.instruction ?? 'Calculating…'}</div>
                <div className="text-xs text-gray-500 mt-0.5">{activeRoute.fromName} → {activeRoute.toName}</div>
              </div>
              <Button variant="outline" size="sm" onClick={clearRoute} className="border-red-200 text-red-500 hover:bg-red-50">
                <X className="w-4 h-4 mr-1" />End Route
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Normal layout ── */
        <>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-1 space-y-4">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-purple-600" />Route Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>{RoutePlannerPanel}</CardContent>
              </Card>
            </div>

            <div className="xl:col-span-3" id="map">
              <TrafficMap
                intersections={intersections}
                onSelectIntersection={setSelectedIntersection}
                routeCoords={undefined}
                {...(gpsPosition ? { gpsPosition, centerOnGps: true } : {})}
              />
            </div>
          </div>

          {selectedIntersection && <TrafficPrediction intersection={selectedIntersection} />}

          <div id="signals">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full flex-shrink-0" />
              <h2 className="text-base font-bold text-gray-900">Lucknow Traffic Signals</h2>
              <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <Activity className="w-3 h-3" />{intersections.length} monitored
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {intersections.map((intersection) => {
                const hash = intersection.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
                const congestion = (hash % 3 === 0 ? 'high' : hash % 3 === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
                const colorMap  = { low: '#16a34a', medium: '#f97316', high: '#ef4444' }
                const labelMap  = { low: 'LOW', medium: 'MED', high: 'HIGH' }
                const signalMap = { low: 'GREEN', medium: 'YELLOW', high: 'RED' }
                const bgMap     = { low: 'bg-green-50 border-green-200', medium: 'bg-orange-50 border-orange-200', high: 'bg-red-50 border-red-200' }
                const textMap   = { low: 'text-green-600', medium: 'text-orange-500', high: 'text-red-600' }
                const vehicles = Math.floor((hash * 7) % 100) + 20
                return (
                  <Card
                    key={intersection.id}
                    className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-200 transition-all group"
                    onClick={() => setSelectedIntersection(intersection)}
                  >
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: colorMap[congestion] }} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bgMap[congestion]} ${textMap[congestion]}`}>
                          {labelMap[congestion]}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight mb-1 group-hover:text-purple-700 transition-colors">
                        {intersection.name}
                      </p>
                      <p className="text-[11px] text-gray-400 mb-2.5 line-clamp-2">{intersection.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <TrafficCone className="w-3 h-3" style={{ color: colorMap[congestion] }} />{signalMap[congestion]}
                        </span>
                        <span className="flex items-center gap-1"><Car className="w-3 h-3" />{vehicles}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
