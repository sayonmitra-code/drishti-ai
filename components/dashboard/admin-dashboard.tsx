'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import IntersectionMonitoring from './intersection-monitoring'
import TrafficAnalytics from './traffic-analytics'
import AIRecommendations from './ai-recommendations'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

interface SignalData {
  id: string
  signal_name: string
  status: string
  emergency_mode: boolean
}

export default function AdminDashboard({
  intersections,
  userId,
}: {
  intersections: Intersection[]
  userId: string
}) {
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(
    intersections[0] || null
  )
  const [signals, setSignals] = useState<SignalData[]>([])
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEmergencyToggle = async () => {
    if (!selectedIntersection) return

    setLoading(true)
    try {
      const response = await fetch('/api/signals/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intersection_id: selectedIntersection.id,
          enabled: !emergencyMode,
        }),
      })

      const data = await response.json()
      setEmergencyMode(!emergencyMode)
    } catch (error) {
      console.error('Error toggling emergency mode:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Emergency Corridor Control */}
      <Card className="backdrop-blur-md bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">🚨</span> Emergency Corridor Mode
            </CardTitle>
            <Button
              onClick={handleEmergencyToggle}
              disabled={loading || !selectedIntersection}
              className={`${
                emergencyMode
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {loading ? 'Activating...' : emergencyMode ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            {emergencyMode
              ? 'Emergency corridor is ACTIVE. All signals will be set to green in sequence.'
              : 'Click Enable to activate emergency green corridor for ambulances and emergency vehicles.'}
          </p>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Intersection Selector */}
        <div className="lg:col-span-1">
          <Card className="backdrop-blur-md bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Intersections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {intersections.map((intersection) => (
                  <button
                    key={intersection.id}
                    onClick={() => setSelectedIntersection(intersection)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedIntersection?.id === intersection.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm">{intersection.name}</div>
                    <div className="text-xs text-white/50 mt-1">{intersection.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring and Recommendations */}
        <div className="lg:col-span-3 space-y-6">
          {selectedIntersection && (
            <>
              <IntersectionMonitoring intersection={selectedIntersection} />
              <AIRecommendations intersection={selectedIntersection} />
            </>
          )}
        </div>
      </div>

      {/* Analytics */}
      {selectedIntersection && <TrafficAnalytics intersection={selectedIntersection} />}
    </div>
  )
}
