'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  distance: number   // km
  duration: number   // minutes
  steps: RouteStep[]
}

// Nominatim geocoding: returns [lat, lng] or null
async function geocode(query: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Lucknow, India')}&format=json&limit=1&countrycodes=in`
    const res = await fetch(url, { headers: { 'User-Agent': 'DrishtiAI/1.0' } })
    const data = await res.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
    return null
  } catch {
    return null
  }
}

// OSRM routing: returns RouteCoords or null
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

        steps.push({
          instruction,
          distance: Math.round(step.distance),
        })
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

// Demo mode data
const DEMO_INCIDENTS = [
  'Accident reported near Charbagh Railway Station — expect 15 min delay',
  'Road closure on Hazratganj Ring Road — use alternate via Kaiserbagh',
  'Construction work at Alambagh — single lane traffic',
  'VIP movement — NH 27 partially blocked for 30 minutes',
]

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

  // Demo mode: auto-rotate incidents and vehicle counts
  useEffect(() => {
    if (!demoMode) {
      setDemoIncident(null)
      return
    }
    const cycle = () => {
      const idx = Math.floor(Math.random() * DEMO_INCIDENTS.length)
      setDemoIncident(DEMO_INCIDENTS[idx])
    }
    cycle()
    const t = setInterval(cycle, 8000)
    return () => clearInterval(t)
  }, [demoMode])

  // Navigation step advance
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
        setError(`Could not find location: "${source}". Try adding Lucknow landmarks like "Hazratganj" or "Charbagh".`)
        return
      }
      if (!toCoords) {
        setError(`Could not find location: "${destination}". Try adding Lucknow landmarks like "Gomti Nagar" or "Alambagh".`)
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
    setError(null)
  }

  const currentStep = activeRoute?.steps[navStep]
  const nextStep = activeRoute?.steps[navStep + 1]

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {demoMode && demoIncident && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 animate-pulse">
          <span className="text-lg">⚠️</span>
          <span className="font-medium">Live Incident Alert:</span>
          <span>{demoIncident}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planner */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Route Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFindRoute} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">📍 From</label>
                  <Input
                    placeholder="e.g. Hazratganj"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">🏁 To</label>
                  <Input
                    placeholder="e.g. Gomti Nagar"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Routing…
                      </span>
                    ) : (
                      'Find Route'
                    )}
                  </Button>
                  {activeRoute && (
                    <Button type="button" variant="outline" size="sm" onClick={clearRoute}>
                      Clear
                    </Button>
                  )}
                </div>
              </form>

              {/* Route Summary */}
              {activeRoute && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" />
                    </svg>
                    Route Found
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-blue-600 font-bold text-lg">{activeRoute.distance} km</div>
                      <div className="text-muted-foreground">Distance</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-cyan-600 font-bold text-lg">{activeRoute.duration} min</div>
                      <div className="text-muted-foreground">Est. Time</div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-700">
                    {activeRoute.fromName} → {activeRoute.toName}
                  </div>
                </div>
              )}

              {/* Demo Mode Toggle */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Demo Mode</span>
                <button
                  onClick={() => setDemoMode((d) => !d)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${demoMode ? 'bg-cyan-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Panel */}
          {activeRoute && currentStep && (
            <Card className="shadow-sm border border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Live Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white rounded-xl p-3 border border-blue-200">
                  <div className="text-xs text-muted-foreground mb-1">Current Instruction</div>
                  <div className="text-sm font-semibold text-foreground">{currentStep.instruction}</div>
                  <div className="text-xs text-blue-600 mt-1">{formatDistance(currentStep.distance)}</div>
                </div>

                {nextStep && (
                  <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                    <div className="text-xs text-muted-foreground mb-1">Then</div>
                    <div className="text-xs text-foreground/80">{nextStep.instruction}</div>
                  </div>
                )}

                {/* Signal Awareness */}
                <div className="bg-white rounded-xl p-3 border border-blue-200">
                  <div className="text-xs text-muted-foreground mb-1">Next Traffic Signal</div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      navStep % 3 === 0 ? 'bg-red-500' : navStep % 3 === 1 ? 'bg-green-500' : 'bg-yellow-400'
                    }`}>
                      {navStep % 3 === 0 ? 'R' : navStep % 3 === 1 ? 'G' : 'Y'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        {navStep % 3 === 0 ? 'RED — Stop' : navStep % 3 === 1 ? 'GREEN — Go' : 'YELLOW — Slow'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ~{300 + navStep * 150} m ahead • {20 + (navStep % 4) * 10}s remaining
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step counter */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step {navStep + 1} of {activeRoute.steps.length}</span>
                  <div className="flex gap-1">
                    {activeRoute.steps.slice(0, Math.min(8, activeRoute.steps.length)).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${i === navStep ? 'bg-blue-500' : i < navStep ? 'bg-blue-300' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Traffic Map */}
        <div className="lg:col-span-2">
          <TrafficMap
            intersections={intersections}
            onSelectIntersection={setSelectedIntersection}
            routeCoords={activeRoute?.routeCoords}
          />
        </div>
      </div>

      {/* Traffic Prediction for selected intersection */}
      {selectedIntersection && (
        <TrafficPrediction intersection={selectedIntersection} />
      )}

      {/* Intersections Grid */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
          Lucknow Traffic Signals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {intersections.map((intersection) => {
            const hash = intersection.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
            const congestion: 'low' | 'medium' | 'high' = hash % 3 === 0 ? 'high' : hash % 3 === 1 ? 'medium' : 'low'
            const color = { low: '#22c55e', medium: '#f97316', high: '#ef4444' }[congestion]
            const label = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' }[congestion]
            const signal = { low: 'GREEN', medium: 'YELLOW', high: 'RED' }[congestion]
            const vehicles = Math.floor((hash * 7) % 100) + 20
            return (
              <Card
                key={intersection.id}
                className="shadow-sm border border-border cursor-pointer hover:shadow-md hover:border-cyan-300 transition-all"
                onClick={() => setSelectedIntersection(intersection)}
              >
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: color + '22', color }}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-tight mb-1">
                    {intersection.name}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{intersection.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>🚦 {signal}</span>
                    <span>🚗 {vehicles}</span>
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
