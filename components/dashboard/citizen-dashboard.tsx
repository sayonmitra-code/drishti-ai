'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import TrafficMap from './traffic-map'
import TrafficPrediction from './traffic-prediction'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

interface RouteResult {
  score: number
  intersections: number
  estimatedTime: number
}

export default function CitizenDashboard({
  intersections,
  userId,
}: {
  intersections: Intersection[]
  userId: string
}) {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null)

  const handleFindRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          destination,
          intersections: intersections.map((i) => ({
            id: i.id,
            name: i.name,
            lat: parseFloat(i.latitude),
            lng: parseFloat(i.longitude),
          })),
        }),
      })

      const data = await response.json()
      setRouteResult(data)
    } catch (error) {
      console.error('Error finding route:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planner */}
        <Card className="lg:col-span-1 glass">
          <CardHeader>
            <CardTitle className="gradient-text">Find Route</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFindRoute} className="space-y-4">
              <FieldGroup>
                <FieldLabel className="text-foreground/80">Source</FieldLabel>
                <Input
                  placeholder="Starting location"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={loading}
                  className="bg-background/5 border-border text-foreground placeholder:text-foreground/40"
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel className="text-foreground/80">Destination</FieldLabel>
                <Input
                  placeholder="Ending location"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={loading}
                  className="bg-background/5 border-border text-foreground placeholder:text-foreground/40"
                  required
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                {loading ? 'Finding Route...' : 'Find Optimal Route'}
              </Button>
            </form>

            {routeResult && (
              <div className="mt-6 p-4 glass-sm bg-emerald-500/10 border-emerald-500/30 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Route Score:</span>
                    <span className="text-emerald-500 font-semibold">{routeResult.score.toFixed(1)}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Intersections:</span>
                    <span className="text-foreground">{routeResult.intersections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Est. Time:</span>
                    <span className="text-foreground">{routeResult.estimatedTime} min</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Map */}
        <div className="lg:col-span-2">
          <TrafficMap
            intersections={intersections}
            onSelectIntersection={setSelectedIntersection}
          />
        </div>
      </div>

      {/* Traffic Prediction */}
      {selectedIntersection && (
        <TrafficPrediction intersection={selectedIntersection} />
      )}

      {/* Intersections Grid */}
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-4">Nearby Intersections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="glass cursor-pointer hover:glass-lg glow-cyan transition"
              onClick={() => setSelectedIntersection(intersection)}
            >
              <CardHeader>
                <CardTitle className="text-lg gradient-text">{intersection.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/60 text-sm">{intersection.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
