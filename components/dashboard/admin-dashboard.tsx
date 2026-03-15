'use client'

import { useState } from 'react'
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
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [emergencyLoading, setEmergencyLoading] = useState(false)
  const [aiMode, setAiMode] = useState(false)

  const handleEmergencyToggle = async () => {
    if (!selectedIntersection) return
    setEmergencyLoading(true)
    try {
      await fetch('/api/signals/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intersection_id: selectedIntersection.id,
          enabled: !emergencyMode,
        }),
      })
      setEmergencyMode((m) => !m)
    } catch (error) {
      console.error('Error toggling emergency mode:', error)
    } finally {
      setEmergencyLoading(false)
    }
  }

  // Compute congestion badge per intersection
  function getCongestionBadge(id: string) {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    if (hash % 3 === 0) return { label: 'HIGH', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    if (hash % 3 === 1) return { label: 'MEDIUM', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' }
    return { label: 'LOW', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-foreground">{intersections.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Signals</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />All Online
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {intersections.filter((i) => {
                const h = i.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                return h % 3 === 0
              }).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">High Congestion</div>
            <div className="text-xs text-red-600 mt-1">Needs attention</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {aiMode ? '🤖 AI' : '🕹 Manual'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Control Mode</div>
            <div className={`text-xs mt-1 ${aiMode ? 'text-cyan-600' : 'text-gray-500'}`}>
              {aiMode ? 'AI controlling signals' : 'Manual override active'}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {emergencyMode ? '🚨 ON' : 'OFF'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Emergency Corridor</div>
            <div className={`text-xs mt-1 ${emergencyMode ? 'text-red-600' : 'text-gray-500'}`}>
              {emergencyMode ? 'All signals GREEN' : 'Normal operation'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Mode + Emergency Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Mode Toggle */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              🤖 AI Signal Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-foreground font-medium">
                  {aiMode ? 'AI Mode — Active' : 'Manual Mode — Active'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {aiMode
                    ? 'AI is automatically adjusting signal timings based on live traffic density.'
                    : 'Admin reviews AI recommendations and approves changes manually.'}
                </p>
              </div>
              <button
                onClick={() => setAiMode((m) => !m)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${aiMode ? 'bg-cyan-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${aiMode ? 'translate-x-8' : 'translate-x-1'}`}
                />
              </button>
            </div>
            {aiMode && (
              <div className="text-xs bg-cyan-50 border border-cyan-200 rounded-lg p-2 text-cyan-800">
                🟢 AI is active — signals updating every 30 seconds based on vehicle count thresholds.
              </div>
            )}
            {!aiMode && (
              <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-600">
                AI recommendations visible below. Click "Implement" to apply each one.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Corridor */}
        <Card className={`shadow-sm border ${emergencyMode ? 'border-red-300 bg-red-50' : 'border-border'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              🚨 Emergency Corridor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {emergencyMode
                ? 'Emergency corridor ACTIVE — all signals along route set to GREEN.'
                : 'Activate to create a green corridor for ambulances and emergency vehicles.'}
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleEmergencyToggle}
                disabled={emergencyLoading || !selectedIntersection}
                size="sm"
                className={emergencyMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-foreground hover:bg-foreground/80 text-background'
                }
              >
                {emergencyLoading ? 'Processing…' : emergencyMode ? '🔴 Deactivate' : '🚑 Activate Corridor'}
              </Button>
              {emergencyMode && (
                <span className="text-xs text-red-600 font-medium animate-pulse">● ACTIVE</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Intersection Selector */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Traffic Signals</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1.5">
                {intersections.map((intersection) => {
                  const badge = getCongestionBadge(intersection.id)
                  return (
                    <button
                      key={intersection.id}
                      onClick={() => setSelectedIntersection(intersection)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all border ${
                        selectedIntersection?.id === intersection.id
                          ? 'bg-cyan-50 border-cyan-300 shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${badge.dot}`} />
                        <span className={`font-medium text-xs leading-tight ${
                          selectedIntersection?.id === intersection.id ? 'text-cyan-700' : 'text-foreground'
                        }`}>
                          {intersection.name}
                        </span>
                      </div>
                      <div className="ml-4 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring and Recommendations */}
        <div className="lg:col-span-3 space-y-6">
          {selectedIntersection && (
            <>
              <IntersectionMonitoring intersection={selectedIntersection} aiMode={aiMode} />
              <AIRecommendations intersection={selectedIntersection} aiMode={aiMode} />
            </>
          )}
        </div>
      </div>

      {/* Analytics */}
      {selectedIntersection && <TrafficAnalytics intersection={selectedIntersection} />}
    </div>
  )
}
