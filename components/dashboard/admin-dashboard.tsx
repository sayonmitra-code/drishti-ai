'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import IntersectionMonitoring from './intersection-monitoring'
import TrafficAnalytics from './traffic-analytics'
import AIRecommendations from './ai-recommendations'
import TrafficPrediction from './traffic-prediction'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

interface Incident {
  id: string
  type: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved'
  reportedAt: string
  description: string
}

interface ScheduledSignal {
  id: string
  intersectionName: string
  time: string
  duration: number
  mode: 'green-wave' | 'emergency' | 'peak-hour' | 'night-mode'
  active: boolean
}

interface SystemAlert {
  id: string
  message: string
  type: 'info' | 'warning' | 'error'
  timestamp: string
}

function getInitialIncidents(intersections: Intersection[]): Incident[] {
  return [
    {
      id: 'inc-001',
      type: 'Signal Malfunction',
      location: intersections[0]?.name || 'Hazratganj Chauraha',
      severity: 'high',
      status: 'open',
      reportedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      description: 'North arm signal stuck on RED for 25 minutes. Manual override required.',
    },
    {
      id: 'inc-002',
      type: 'Heavy Congestion',
      location: intersections[1]?.name || 'Charbagh Railway Station',
      severity: 'medium',
      status: 'in-progress',
      reportedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      description: 'Train arrival caused 2x normal vehicle density. AI adjusting timings.',
    },
    {
      id: 'inc-003',
      type: 'Road Accident',
      location: intersections[4]?.name || 'Aminabad Market Crossing',
      severity: 'critical',
      status: 'in-progress',
      reportedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      description: 'Two-vehicle collision blocking East arm. Emergency services dispatched.',
    },
    {
      id: 'inc-004',
      type: 'Power Failure',
      location: intersections[2]?.name || 'Alambagh Bus Terminal',
      severity: 'high',
      status: 'resolved',
      reportedAt: new Date(Date.now() - 120 * 60000).toISOString(),
      description: 'Signal controller UPS failure. Backup power restored. Monitoring.',
    },
  ]
}

function getInitialSchedules(intersections: Intersection[]): ScheduledSignal[] {
  return [
    {
      id: 'sch-001',
      intersectionName: intersections[0]?.name || 'Hazratganj Chauraha',
      time: '08:00',
      duration: 120,
      mode: 'peak-hour',
      active: true,
    },
    {
      id: 'sch-002',
      intersectionName: intersections[1]?.name || 'Charbagh Railway Station',
      time: '17:30',
      duration: 90,
      mode: 'peak-hour',
      active: true,
    },
    {
      id: 'sch-003',
      intersectionName: 'All Intersections',
      time: '23:00',
      duration: 480,
      mode: 'night-mode',
      active: false,
    },
    {
      id: 'sch-004',
      intersectionName: intersections[3]?.name || 'Gomti Nagar Viram Khand',
      time: '09:00',
      duration: 60,
      mode: 'green-wave',
      active: false,
    },
  ]
}

function getSystemAlerts(): SystemAlert[] {
  return [
    {
      id: 'alt-001',
      message: 'AI model updated — traffic prediction accuracy improved to 94.2%',
      type: 'info',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 'alt-002',
      message: 'High congestion detected at Aminabad — deploying dynamic signal control',
      type: 'warning',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    },
    {
      id: 'alt-003',
      message: 'Signal controller at Charbagh offline for 3 minutes — reconnected',
      type: 'error',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'alt-004',
      message: 'Emergency vehicle detected near Hazratganj — green corridor pre-activated',
      type: 'warning',
      timestamp: new Date(Date.now() - 48 * 60000).toISOString(),
    },
    {
      id: 'alt-005',
      message: 'Daily analytics report generated and ready for download',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  ]
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
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
  const [incidents, setIncidents] = useState<Incident[]>(() => getInitialIncidents(intersections))
  const [schedules, setSchedules] = useState<ScheduledSignal[]>(() => getInitialSchedules(intersections))
  const [alerts, setAlerts] = useState<SystemAlert[]>(getSystemAlerts)
  const [activeTab, setActiveTab] = useState('overview')
  const [newIncidentForm, setNewIncidentForm] = useState(false)
  const [newIncidentData, setNewIncidentData] = useState({
    type: '',
    location: '',
    severity: 'medium' as Incident['severity'],
    description: '',
  })

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        'Vehicle count spike detected — AI adjusting signal timings',
        'Green wave synchronisation active on Gomti Nagar corridor',
        'Pedestrian crossing demand high at Hazratganj — extended walk phase',
      ]
      const types: SystemAlert['type'][] = ['info', 'warning', 'info']
      const idx = Math.floor(Math.random() * messages.length)
      const newAlert: SystemAlert = {
        id: `alt-live-${Date.now()}`,
        message: messages[idx],
        type: types[idx],
        timestamp: new Date().toISOString(),
      }
      setAlerts((prev) => [newAlert, ...prev].slice(0, 20))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

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
      const newAlert: SystemAlert = {
        id: `alt-emergency-${Date.now()}`,
        message: emergencyMode
          ? 'Emergency corridor deactivated — normal signal operation resumed'
          : `Emergency corridor ACTIVATED at ${selectedIntersection.name} — all signals set to GREEN`,
        type: emergencyMode ? 'info' : 'warning',
        timestamp: new Date().toISOString(),
      }
      setAlerts((prev) => [newAlert, ...prev])
    } catch (error) {
      console.error('Error toggling emergency mode:', error)
    } finally {
      setEmergencyLoading(false)
    }
  }

  const handleIncidentStatusChange = useCallback(
    (id: string, status: Incident['status']) => {
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status } : inc)))
    },
    []
  )

  const handleAddIncident = () => {
    if (!newIncidentData.type || !newIncidentData.location || !newIncidentData.description) return
    const incident: Incident = {
      id: `inc-${Date.now()}`,
      ...newIncidentData,
      status: 'open',
      reportedAt: new Date().toISOString(),
    }
    setIncidents((prev) => [incident, ...prev])
    setNewIncidentData({ type: '', location: '', severity: 'medium', description: '' })
    setNewIncidentForm(false)
  }

  const handleToggleSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }, [])

  // Compute congestion badge per intersection
  function getCongestionBadge(id: string) {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    if (hash % 3 === 0) return { label: 'HIGH', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    if (hash % 3 === 1) return { label: 'MEDIUM', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' }
    return { label: 'LOW', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
  }

  const openIncidents = incidents.filter((i) => i.status !== 'resolved').length
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length

  const severityStyle: Record<Incident['severity'], { badge: string; border: string }> = {
    low: { badge: 'bg-blue-100 text-blue-700 border-blue-200', border: 'border-l-blue-400' },
    medium: { badge: 'bg-orange-100 text-orange-700 border-orange-200', border: 'border-l-orange-400' },
    high: { badge: 'bg-red-100 text-red-700 border-red-200', border: 'border-l-red-400' },
    critical: { badge: 'bg-purple-100 text-purple-700 border-purple-200', border: 'border-l-purple-500' },
  }

  const modeStyle: Record<ScheduledSignal['mode'], string> = {
    'green-wave': 'bg-green-100 text-green-700',
    'emergency': 'bg-red-100 text-red-700',
    'peak-hour': 'bg-orange-100 text-orange-700',
    'night-mode': 'bg-slate-100 text-slate-700',
  }

  const alertTypeStyle: Record<SystemAlert['type'], { bar: string; icon: string }> = {
    info: { bar: 'border-l-blue-400 bg-blue-50', icon: 'ℹ️' },
    warning: { bar: 'border-l-orange-400 bg-orange-50', icon: '⚠️' },
    error: { bar: 'border-l-red-400 bg-red-50', icon: '🔴' },
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-foreground">{intersections.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Active Signals</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />All Online
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-foreground">
              {intersections.filter((i) => {
                const h = i.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                return h % 3 === 0
              }).length}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">High Congestion</div>
            <div className="text-xs text-red-600 mt-1">Needs attention</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-4 pb-3">
            <div className={`text-2xl font-bold ${criticalIncidents > 0 ? 'text-purple-600' : 'text-foreground'}`}>
              {openIncidents}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Open Incidents</div>
            <div className={`text-xs mt-1 ${criticalIncidents > 0 ? 'text-purple-600' : 'text-gray-500'}`}>
              {criticalIncidents > 0 ? `${criticalIncidents} critical` : 'All managed'}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-foreground">
              {aiMode ? '🤖 AI' : '🕹 Manual'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Control Mode</div>
            <div className={`text-xs mt-1 ${aiMode ? 'text-cyan-600' : 'text-gray-500'}`}>
              {aiMode ? 'AI controlling signals' : 'Manual override active'}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-foreground">
              {emergencyMode ? '🚨 ON' : 'OFF'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Emergency Corridor</div>
            <div className={`text-xs mt-1 ${emergencyMode ? 'text-red-600' : 'text-gray-500'}`}>
              {emergencyMode ? 'All signals GREEN' : 'Normal operation'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs rounded-lg">📊 Overview</TabsTrigger>
          <TabsTrigger value="signals" className="text-xs rounded-lg">🚦 Signals</TabsTrigger>
          <TabsTrigger value="incidents" className="text-xs rounded-lg relative">
            🚨 Incidents
            {criticalIncidents > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {criticalIncidents}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="text-xs rounded-lg">📅 Scheduling</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs rounded-lg">📈 Analytics</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs rounded-lg">🔔 Alerts</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
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
                    aria-label="Toggle AI mode"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${aiMode ? 'translate-x-8' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                {aiMode ? (
                  <div className="text-xs bg-cyan-50 border border-cyan-200 rounded-lg p-2 text-cyan-800">
                    🟢 AI is active — signals updating every 30 seconds based on vehicle count thresholds.
                  </div>
                ) : (
                  <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-600">
                    AI recommendations visible in the Signals tab. Click &quot;Implement&quot; to apply each one.
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

          {/* Intersection grid overview */}
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">All Intersections — Live Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {intersections.map((intersection) => {
                  const badge = getCongestionBadge(intersection.id)
                  const isSelected = selectedIntersection?.id === intersection.id
                  return (
                    <button
                      key={intersection.id}
                      onClick={() => {
                        setSelectedIntersection(intersection)
                        setActiveTab('signals')
                      }}
                      className={`text-left p-3 rounded-xl border transition-all hover:shadow-md ${
                        isSelected ? 'border-cyan-300 bg-cyan-50' : 'border-border bg-card hover:border-cyan-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${badge.dot} animate-pulse`} />
                        <span className="text-xs font-semibold text-foreground leading-tight line-clamp-1">
                          {intersection.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Click to manage →</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts preview */}
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                Recent System Alerts
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  View all →
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`p-2.5 border-l-4 rounded-r-lg text-xs ${alertTypeStyle[alert.type].bar}`}>
                    <div className="flex items-start gap-2">
                      <span>{alertTypeStyle[alert.type].icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground leading-snug">{alert.message}</p>
                        <p className="text-muted-foreground mt-0.5">{timeAgo(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SIGNALS TAB ─────────────────────────────────────── */}
        <TabsContent value="signals" className="space-y-4">
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
                  <TrafficPrediction intersection={selectedIntersection} />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── INCIDENTS TAB ─────────────────────────────────────── */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{openIncidents}</span> open &nbsp;·&nbsp;
                <span className="font-semibold text-foreground">{incidents.filter(i => i.status === 'resolved').length}</span> resolved
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setNewIncidentForm((v) => !v)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs"
            >
              {newIncidentForm ? '✕ Cancel' : '+ Report Incident'}
            </Button>
          </div>

          {newIncidentForm && (
            <Card className="shadow-sm border border-cyan-200 bg-cyan-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Report New Incident</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Incident Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Signal Malfunction, Accident…"
                      value={newIncidentData.type}
                      onChange={(e) => setNewIncidentData((d) => ({ ...d, type: e.target.value }))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                    <select
                      value={newIncidentData.location}
                      onChange={(e) => setNewIncidentData((d) => ({ ...d, location: e.target.value }))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">Select intersection…</option>
                      {intersections.map((i) => (
                        <option key={i.id} value={i.name}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Severity</label>
                    <select
                      value={newIncidentData.severity}
                      onChange={(e) => setNewIncidentData((d) => ({ ...d, severity: e.target.value as Incident['severity'] }))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                    <input
                      type="text"
                      placeholder="Brief description of the incident…"
                      value={newIncidentData.description}
                      onChange={(e) => setNewIncidentData((d) => ({ ...d, description: e.target.value }))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddIncident}
                  disabled={!newIncidentData.type || !newIncidentData.location || !newIncidentData.description}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs"
                >
                  Submit Incident
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {incidents.map((incident) => {
              const style = severityStyle[incident.severity]
              return (
                <Card key={incident.id} className={`shadow-sm border border-l-4 ${style.border}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${style.badge}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{incident.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            incident.status === 'open' ? 'bg-red-100 text-red-700' :
                            incident.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {incident.status === 'in-progress' ? 'In Progress' : incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          📍 {incident.location} &nbsp;·&nbsp; {timeAgo(incident.reportedAt)}
                        </p>
                        <p className="text-sm text-foreground">{incident.description}</p>
                      </div>
                      {incident.status !== 'resolved' && (
                        <div className="flex gap-2 flex-shrink-0">
                          {incident.status === 'open' && (
                            <button
                              onClick={() => handleIncidentStatusChange(incident.id, 'in-progress')}
                              className="text-xs px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition"
                            >
                              Respond
                            </button>
                          )}
                          <button
                            onClick={() => handleIncidentStatusChange(incident.id, 'resolved')}
                            className="text-xs px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-100 transition"
                          >
                            ✓ Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ── SCHEDULING TAB ─────────────────────────────────────── */}
        <TabsContent value="scheduling" className="space-y-4">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Signal Mode Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Pre-configure signal modes to activate automatically at scheduled times. Activate or deactivate schedules as needed.
              </p>
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      schedule.active ? 'border-cyan-200 bg-cyan-50' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${modeStyle[schedule.mode]}`}>
                            {schedule.mode === 'green-wave' ? '🟢 Green Wave' :
                             schedule.mode === 'emergency' ? '🚨 Emergency' :
                             schedule.mode === 'peak-hour' ? '🔴 Peak Hour' :
                             '🌙 Night Mode'}
                          </span>
                          {schedule.active && (
                            <span className="text-xs text-cyan-700 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{schedule.intersectionName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ⏰ {schedule.time} &nbsp;·&nbsp; ⏱ {schedule.duration} min duration
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleSchedule(schedule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${schedule.active ? 'bg-cyan-500' : 'bg-gray-300'}`}
                        aria-label="Toggle schedule"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${schedule.active ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Signal Mode Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🟢', title: 'Green Wave', desc: 'Synchronises signals along a corridor to allow continuous traffic flow without stops.' },
                  { icon: '🔴', title: 'Peak Hour', desc: 'Increases green time on major arteries during morning and evening rush hours.' },
                  { icon: '🌙', title: 'Night Mode', desc: 'Reduces cycle times and dims signal intensity during low-traffic night hours.' },
                  { icon: '🚨', title: 'Emergency', desc: 'Sets all signals to GREEN on a designated emergency vehicle corridor.' },
                ].map((item) => (
                  <div key={item.title} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{item.icon}</span>
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ANALYTICS TAB ─────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Viewing analytics for:</span>
            <select
              value={selectedIntersection?.id || ''}
              onChange={(e) => {
                const found = intersections.find((i) => i.id === e.target.value)
                if (found) setSelectedIntersection(found)
              }}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {intersections.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          {selectedIntersection && <TrafficAnalytics intersection={selectedIntersection} />}
        </TabsContent>

        {/* ── ALERTS TAB ─────────────────────────────────────── */}
        <TabsContent value="alerts" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{alerts.length} system alerts</p>
            <button
              onClick={() => setAlerts([])}
              className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No system alerts at this time.
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`p-3 border-l-4 rounded-r-lg text-sm ${alertTypeStyle[alert.type].bar}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{alertTypeStyle[alert.type].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground leading-snug">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
