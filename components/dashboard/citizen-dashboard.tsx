'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Navigation,
  Search,
  AlertTriangle,
  Activity,
  Clock,
  Car,
  TrafficCone,
  ArrowRight,
  Square,
  Play,
  X,
  Loader2,
  TrendingUp,
  ChevronRight,
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
    const searchQuery = `${trimmed}, India`
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in`
    const res = await fetch(url, { headers: { 'User-Agent': 'DrishtiAI/1.0' } })
    const data = await res.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`
    const fallbackRes = await fetch(fallbackUrl, { headers: { 'User-Agent': 'DrishtiAI/1.0' } })
    const fallbackData = await fallbackRes.json()
    if (fallbackData && fallbackData.length > 0) {
      return [parseFloat(fallbackData[0].lat), parseFloat(fallbackData[0].lon)]
    }
    return null
  } catch {
    return null
  }
}

// OSRM routing — returns ActiveRoute or null
async function fetchOSRMRoute(from: [number, number], to: [number, number]): Promise<ActiveRoute | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null

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

        if (step.name && maneuver !== 'arrive' && step.name !== '') {
          instruction += ` on ${step.name}`
        }

        steps.push({ instruction, distance: Math.round(step.distance) })
      }
    }

    return {
      routeCoords: { coordinates: coords, distance: route.distance, duration: route.duration, steps },
      fromName: '',
      toName: '',
      distance: +(route.distance / 1000).toFixed(1),
      duration: Math.ceil(route.duration / 60),
      steps,
    }
  } catch {
    return null
  }
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

const DEMO_INCIDENTS = [
  'Accident reported near Charbagh Railway Station — expect 15 min delay',
  'Road closure on Hazratganj Ring Road — use alternate via Kaiserbagh',
  'Construction work at Alambagh — single lane traffic',
  'VIP movement — NH 27 partially blocked for 30 minutes',
]

const SIGNAL_CONFIGS = {
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'RED — Stop', ring: 'ring-2 ring-red-500/40' },
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'GREEN — Go', ring: 'ring-2 ring-green-500/40' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-400', label: 'YELLOW — Slow', ring: 'ring-2 ring-yellow-400/40' },
} as const

export default function CitizenDashboard({
  intersections,
  userId,
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
  const [demoMode, setDemoMode] = useState(false)
  const [demoIncident, setDemoIncident] = useState<string | null>(null)
  const [navStep, setNavStep] = useState(0)
  const [navActive, setNavActive] = useState(false)

  useEffect(() => {
    if (!demoMode) { setDemoIncident(null); return }
    const cycle = () => {
      const idx = Math.floor(Math.random() * DEMO_INCIDENTS.length)
      setDemoIncident(DEMO_INCIDENTS[idx])
    }
    cycle()
    const t = setInterval(cycle, 8000)
    return () => clearInterval(t)
  }, [demoMode])

  useEffect(() => {
    if (!activeRoute) return
    const t = setInterval(() => {
      setNavStep((s) => (s + 1) % activeRoute.steps.length)
    }, 5000)
    return () => clearInterval(t)
  }, [activeRoute])

  const handleFindRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setActiveRoute(null)
    setNavStep(0)

    try {
      const [fromCoords, toCoords] = await Promise.all([geocode(source), geocode(destination)])

      if (!fromCoords) {
        setError(`Location not found: "${source}". Try a city or area name like "Hazratganj, Lucknow".`)
        return
      }
      if (!toCoords) {
        setError(`Location not found: "${destination}". Try a city or area name.`)
        return
      }

      const result = await fetchOSRMRoute(fromCoords, toCoords)
      if (!result) {
        setError('Route calculation failed. Please check the locations and try again.')
        return
      }

      setActiveRoute({ ...result, fromName: source, toName: destination })
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearRoute = () => {
    setActiveRoute(null)
    setNavStep(0)
    setNavActive(false)
    setError(null)
  }

  const currentStep = activeRoute?.steps[navStep]
  const nextStep = activeRoute?.steps[navStep + 1]
  const signalKeys = ['red', 'green', 'yellow'] as const
  const signalKey = signalKeys[navStep % 3]
  const signalStyle = SIGNAL_CONFIGS[signalKey]

  return (
    <div className="space-y-6" id="navigation">
      {/* Incident Banner */}
      {demoMode && demoIncident && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-medium text-amber-400">Live Incident Alert:</span>
          <span className="text-amber-300/90">{demoIncident}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Route Planner */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                Route Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFindRoute} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5 block">
                    <MapPin className="w-3 h-3 text-green-400 inline" />
                    From
                  </label>
                  <Input
                    placeholder="e.g. Hazratganj, Lucknow"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={loading}
                    required
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5 block">
                    <MapPin className="w-3 h-3 text-red-400 inline" />
                    To
                  </label>
                  <Input
                    placeholder="e.g. Gomti Nagar, Lucknow"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={loading}
                    required
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 text-sm"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Find Route
                      </span>
                    )}
                  </Button>
                  {activeRoute && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearRoute}
                      className="border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>

              {/* Route Summary */}
              {activeRoute && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                    <Activity className="w-3.5 h-3.5" />
                    Route Calculated
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/80 rounded-lg p-2.5 text-center border border-slate-700">
                      <div className="text-cyan-300 font-bold text-lg">{activeRoute.distance} km</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Distance</div>
                    </div>
                    <div className="bg-slate-800/80 rounded-lg p-2.5 text-center border border-slate-700">
                      <div className="text-blue-300 font-bold text-lg">{activeRoute.duration} min</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Est. Time</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-300 font-medium truncate">{activeRoute.fromName}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-slate-500" />
                    <span className="text-slate-300 font-medium truncate">{activeRoute.toName}</span>
                  </div>
                  {!navActive ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => { setNavActive(true); setNavStep(0) }}
                      className="w-full bg-green-600 hover:bg-green-500 text-white text-xs font-medium"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Start Navigation
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setNavActive(false)}
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 text-xs"
                    >
                      <Square className="w-3.5 h-3.5 mr-1.5" />
                      Stop Navigation
                    </Button>
                  )}
                </div>
              )}

              {/* Simulation Mode Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Simulation Mode</span>
                <button
                  onClick={() => setDemoMode((d) => !d)}
                  aria-label="Toggle simulation mode"
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${demoMode ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${demoMode ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Panel */}
          {activeRoute && currentStep && (
            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-cyan-400 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" />
                  Live Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current instruction */}
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Current Instruction</div>
                  <div className="text-sm font-semibold text-slate-100">{currentStep.instruction}</div>
                  <div className="text-xs text-cyan-400 mt-1 font-medium">{formatDistance(currentStep.distance)}</div>
                </div>

                {nextStep && (
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Then</div>
                    <div className="text-xs text-slate-300">{nextStep.instruction}</div>
                  </div>
                )}

                {/* ETA and Distance Remaining */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                      <Clock className="w-2.5 h-2.5" />
                      ETA
                    </div>
                    <div className="text-sm font-bold text-blue-300">{Math.max(1, activeRoute.duration - Math.floor(navStep * 0.5))} min</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      Remaining
                    </div>
                    <div className="text-sm font-bold text-cyan-300">{Math.max(0, activeRoute.distance - navStep * 0.2).toFixed(1)} km</div>
                  </div>
                </div>

                {/* Signal Awareness */}
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Next Traffic Signal</div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 ${signalStyle.bg} ${signalStyle.ring}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold ${signalStyle.text}`}>{signalStyle.label}</div>
                      <div className="text-[10px] text-slate-500">
                        {300 + navStep * 150} m ahead &bull; {20 + (navStep % 4) * 10}s remaining
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step counter */}
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Step {navStep + 1} of {activeRoute.steps.length}</span>
                  <div className="flex gap-1">
                    {activeRoute.steps.slice(0, Math.min(8, activeRoute.steps.length)).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${i === navStep ? 'bg-cyan-400' : i < navStep ? 'bg-cyan-800' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Traffic Map */}
        <div className="xl:col-span-3" id="map">
          <TrafficMap
            intersections={intersections}
            onSelectIntersection={setSelectedIntersection}
            routeCoords={activeRoute ? { ...activeRoute.routeCoords, navActive } : undefined}
          />
        </div>
      </div>

      {/* Traffic Prediction */}
      {selectedIntersection && (
        <TrafficPrediction intersection={selectedIntersection} />
      )}

      {/* Intersections Grid */}
      <div id="signals">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full flex-shrink-0" />
          <h2 className="text-base font-bold text-slate-200">Lucknow Traffic Signals</h2>
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
            <Activity className="w-3 h-3" />
            {intersections.length} monitored
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {intersections.map((intersection) => {
            const hash = intersection.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
            const congestion = (hash % 3 === 0 ? 'high' : hash % 3 === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
            const colorMap = { low: '#22c55e', medium: '#f97316', high: '#ef4444' }
            const labelMap = { low: 'LOW', medium: 'MED', high: 'HIGH' }
            const signalMap = { low: 'GREEN', medium: 'YELLOW', high: 'RED' }
            const bgMap = { low: 'bg-green-500/10 border-green-500/20', medium: 'bg-orange-500/10 border-orange-500/20', high: 'bg-red-500/10 border-red-500/20' }
            const textMap = { low: 'text-green-400', medium: 'text-orange-400', high: 'text-red-400' }
            const vehicles = Math.floor((hash * 7) % 100) + 20
            return (
              <Card
                key={intersection.id}
                className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800/80 hover:border-slate-700 transition-all group"
                onClick={() => setSelectedIntersection(intersection)}
              >
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ background: colorMap[congestion] }}
                    />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bgMap[congestion]} ${textMap[congestion]}`}>
                      {labelMap[congestion]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 leading-tight mb-1 group-hover:text-white transition-colors">
                    {intersection.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2.5 line-clamp-2">{intersection.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <TrafficCone className="w-3 h-3" style={{ color: colorMap[congestion] }} />
                      {signalMap[congestion]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {vehicles}
                    </span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
