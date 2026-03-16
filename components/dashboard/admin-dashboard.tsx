'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  AlertTriangle,
  TrafficCone,
  Car,
  BarChart2,
  Brain,
  Siren,
  Radio,
  Settings2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Route,
  Info,
  AlertCircle,
  Ambulance,
  Crown,
  Navigation,
  ArrowRight,
  CheckCheck,
  Ban,
  ScrollText,
  Flame,
  FileDown,
  Trash2,
} from 'lucide-react'
import IntersectionMonitoring from './intersection-monitoring'
import TrafficAnalytics from './traffic-analytics'
import AIRecommendations from './ai-recommendations'
import TrafficPrediction from './traffic-prediction'
import TrafficMap from './traffic-map'

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

interface LogEntry {
  id: string
  timestamp: Date
  type: 'ai' | 'manual' | 'vip' | 'emergency' | 'system'
  message: string
  severity: 'info' | 'warning' | 'critical'
}

type SignalMode = 'ai' | 'manual'
type ManualSignal = 'red' | 'yellow' | 'green'

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

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function getInitialLogs(): LogEntry[] {
  return [
    { id: 'log-init-3', timestamp: new Date(Date.now() - 1800000), type: 'ai', message: 'AI recommendation applied — Aminabad signal timing optimized', severity: 'info' },
    { id: 'log-init-2', timestamp: new Date(Date.now() - 2700000), type: 'ai', message: 'Traffic signal at Hazratganj updated — GREEN phase extended 15s', severity: 'info' },
    { id: 'log-init-1', timestamp: new Date(Date.now() - 3600000), type: 'system', message: 'System initialized — AI Mode activated', severity: 'info' },
  ]
}

const DIVERSION_ROUTES = [
  { id: 'div-001', name: 'Shaheed Path Bypass', from: 'Vibhuti Khand', to: 'Kanpur Road', status: 'available' as const },
  { id: 'div-002', name: 'Lohia Path Corridor', from: 'Hazratganj', to: 'Gomti Nagar', status: 'available' as const },
  { id: 'div-003', name: 'Faizabad Road Alternate', from: 'Indira Nagar', to: 'Chinhat', status: 'available' as const },
]

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
  const [signalMode, setSignalMode] = useState<SignalMode>('ai')
  const [manualSignal, setManualSignal] = useState<ManualSignal>('red')
  const [allRedMode, setAllRedMode] = useState(false)
  const [activeDiversion, setActiveDiversion] = useState<string | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>(() => getInitialIncidents(intersections))
  const [schedules, setSchedules] = useState<ScheduledSignal[]>(() => getInitialSchedules(intersections))
  const [alerts, setAlerts] = useState<SystemAlert[]>(getSystemAlerts)
  const [activeTab, setActiveTab] = useState('command')

  // VIP Corridor state
  const [vipActive, setVipActive] = useState(false)
  const [vipFrom, setVipFrom] = useState('')
  const [vipTo, setVipTo] = useState('')
  const [vipProgressStep, setVipProgressStep] = useState(0)
  const [vipCorridorRoute, setVipCorridorRoute] = useState<string[]>([])
  const [vipActivatedAt, setVipActivatedAt] = useState<Date | null>(null)

  // Ambulance Priority state
  const [ambulanceActive, setAmbulanceActive] = useState(false)
  const [ambulanceRoute, setAmbulanceRoute] = useState('')
  const [ambulanceProgressStep, setAmbulanceProgressStep] = useState(0)
  const [ambulanceCorridorRoute, setAmbulanceCorridorRoute] = useState<string[]>([])

  // Emergency type (new quick-activate buttons)
  const [emergencyType, setEmergencyType] = useState<'ambulance' | 'fire' | 'police' | null>(null)

  // System Logs
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>(getInitialLogs)
  const [exportNotice, setExportNotice] = useState(false)

  const addLog = useCallback((type: LogEntry['type'], message: string, severity: LogEntry['severity'] = 'info') => {
    setSystemLogs(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      type,
      message,
      severity,
    }, ...prev.slice(0, 99)])
  }, [])

  // Predefined ambulance waypoints per route option
  const AMBULANCE_WAYPOINTS: Record<string, string[]> = {
    'Gomti Nagar → King George Medical University': ['Gomti Nagar', 'Vibhuti Khand', 'Civil Lines', 'Hazratganj Chauraha'],
    'Charbagh → Balrampur Hospital': ['Charbagh Railway Station', 'Lalbagh Junction', 'Kaiserbagh Intersection', 'Hazratganj Chauraha'],
    'Alambagh → Ram Manohar Lohia Hospital': ['Alambagh', 'Aashiana', 'Charbagh Railway Station', 'Kaiserbagh Intersection'],
    'Indira Nagar → Civil Hospital': ['Indira Nagar', 'Aliganj', 'Nirala Nagar', 'Hazratganj Chauraha'],
  }

  // Simulate real-time alerts
  useEffect(() => {
    const liveAlerts: Array<{ message: string; type: SystemAlert['type'] }> = [
      { message: 'Vehicle count spike detected — AI adjusting signal timings', type: 'warning' },
      { message: 'Green wave synchronisation active on Gomti Nagar corridor', type: 'info' },
      { message: 'Pedestrian crossing demand high at Hazratganj — extended walk phase', type: 'info' },
    ]
    const interval = setInterval(() => {
      const entry = liveAlerts[Math.floor(Math.random() * liveAlerts.length)]
      const newAlert: SystemAlert = {
        id: `alt-live-${Date.now()}`,
        message: entry.message,
        type: entry.type,
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
      const msg = emergencyMode
        ? 'Emergency corridor deactivated — normal signal operation resumed'
        : `Emergency Green Corridor ACTIVATED at ${selectedIntersection.name}`
      const newAlert: SystemAlert = {
        id: `alt-emergency-${Date.now()}`,
        message: msg,
        type: emergencyMode ? 'info' : 'warning',
        timestamp: new Date().toISOString(),
      }
      setAlerts((prev) => [newAlert, ...prev])
      addLog('emergency', msg, emergencyMode ? 'info' : 'critical')
    } catch (error) {
      console.error('Error toggling emergency mode:', error)
    } finally {
      setEmergencyLoading(false)
    }
  }

  const handleActivateVIP = () => {
    if (!vipFrom || !vipTo) return
    // Build a simulated corridor: from → up to 2 intermediate intersections → to
    const fromIdx = intersections.findIndex((i) => i.name === vipFrom)
    const toIdx = intersections.findIndex((i) => i.name === vipTo)
    const midpoints = intersections
      .filter((i) => i.name !== vipFrom && i.name !== vipTo)
      .slice(Math.min(fromIdx, toIdx), Math.min(fromIdx, toIdx) + 2)
      .map((i) => i.name)
    const route = [vipFrom, ...midpoints, vipTo]
    setVipCorridorRoute(route)
    setVipActive(true)
    setVipProgressStep(0)
    setVipActivatedAt(new Date())
    const msg = `VIP Green Corridor ACTIVATED: ${vipFrom} → ${vipTo}. Signals along route synchronized.`
    setAlerts((prev) => [
      {
        id: `alt-vip-${Date.now()}`,
        message: msg,
        type: 'warning',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
    addLog('vip', msg, 'warning')
  }

  const handleDeactivateVIP = () => {
    setVipActive(false)
    setVipProgressStep(0)
    setVipActivatedAt(null)
    const msg = 'VIP Corridor deactivated — normal signal operation resumed.'
    setAlerts((prev) => [
      {
        id: `alt-vip-end-${Date.now()}`,
        message: msg,
        type: 'info',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
    addLog('vip', msg, 'info')
  }

  const handleActivateAmbulance = () => {
    if (!ambulanceRoute) return
    const waypoints = AMBULANCE_WAYPOINTS[ambulanceRoute] ?? [ambulanceRoute.split(' → ')[0] ?? ambulanceRoute]
    setAmbulanceCorridorRoute(waypoints)
    setAmbulanceActive(true)
    setAmbulanceProgressStep(0)
    const msg = `AMBULANCE PRIORITY ACTIVE on ${ambulanceRoute}. Route cleared — signals turning green.`
    setAlerts((prev) => [
      {
        id: `alt-amb-${Date.now()}`,
        message: msg,
        type: 'error',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
    addLog('emergency', msg, 'critical')
  }

  const handleDeactivateAmbulance = () => {
    setAmbulanceActive(false)
    setAmbulanceProgressStep(0)
    const msg = 'Ambulance priority corridor cleared — normal operation resumed.'
    setAlerts((prev) => [
      {
        id: `alt-amb-end-${Date.now()}`,
        message: msg,
        type: 'info',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
    addLog('emergency', msg, 'info')
  }

  const handleActivateEmergencyType = (type: 'ambulance' | 'fire' | 'police') => {
    if (emergencyType === type) {
      setEmergencyType(null)
      const labels = { ambulance: 'Ambulance Corridor', fire: 'Fire Brigade Route', police: 'Police Emergency' }
      addLog('emergency', `${labels[type]} deactivated — normal operation resumed.`, 'info')
    } else {
      setEmergencyType(type)
      const labels = { ambulance: 'Ambulance Corridor', fire: 'Fire Brigade Route', police: 'Police Emergency' }
      const msg = `${labels[type]} ACTIVATED — signals on route set to GREEN, cross traffic to RED.`
      addLog('emergency', msg, 'critical')
    }
  }

  // Simulate VIP corridor progress
  useEffect(() => {
    if (!vipActive) return
    const total = vipCorridorRoute.length
    const interval = setInterval(() => {
      setVipProgressStep((prev) => (prev < total - 1 ? prev + 1 : prev))
    }, 3000)
    return () => clearInterval(interval)
  }, [vipActive, vipCorridorRoute.length])

  // Simulate ambulance priority progress
  useEffect(() => {
    if (!ambulanceActive) return
    const total = ambulanceCorridorRoute.length
    const interval = setInterval(() => {
      setAmbulanceProgressStep((prev) => (prev < total - 1 ? prev + 1 : prev))
    }, 2500)
    return () => clearInterval(interval)
  }, [ambulanceActive, ambulanceCorridorRoute.length])

  const handleIncidentStatusChange = useCallback(
    (id: string, status: Incident['status']) => {
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status } : inc)))
    },
    []
  )

  const handleToggleSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }, [])

  const handleManualSignalUpdate = async (signal: ManualSignal) => {
    if (!selectedIntersection) return
    setManualSignal(signal)
    try {
      await fetch('/api/signals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intersection_id: selectedIntersection.id,
          status: signal,
        }),
      })
      const msg = `Manual override: ${selectedIntersection.name} set to ${signal.toUpperCase()}`
      const newAlert: SystemAlert = {
        id: `alt-manual-${Date.now()}`,
        message: msg,
        type: 'info',
        timestamp: new Date().toISOString(),
      }
      setAlerts((prev) => [newAlert, ...prev])
      addLog('manual', msg, 'info')
    } catch (error) {
      console.error('Error updating signal:', error)
    }
  }

  const handleSignalModeChange = (mode: SignalMode) => {
    setSignalMode(mode)
    const msg = mode === 'ai'
      ? 'Switched to AI Mode — Automated Signal Control activated'
      : 'Switched to Manual Mode — Direct Control enabled'
    addLog(mode === 'ai' ? 'ai' : 'manual', msg, 'info')
  }

  const handleAllRed = () => {
    const next = !allRedMode
    setAllRedMode(next)
    const msg = next
      ? 'ALL-RED MODE ACTIVATED — All intersections set to RED for emergency clearance'
      : 'All-Red emergency mode deactivated — signals resuming normal operation'
    const newAlert: SystemAlert = {
      id: `alt-allred-${Date.now()}`,
      message: msg,
      type: next ? 'error' : 'info',
      timestamp: new Date().toISOString(),
    }
    setAlerts((prev) => [newAlert, ...prev])
    addLog('emergency', msg, next ? 'critical' : 'info')
  }

  const handleDiversion = (divId: string) => {
    setActiveDiversion((prev) => (prev === divId ? null : divId))
    const route = DIVERSION_ROUTES.find((r) => r.id === divId)
    if (route) {
      const newAlert: SystemAlert = {
        id: `alt-div-${Date.now()}`,
        message: activeDiversion === divId
          ? `Traffic diversion cancelled: ${route.name}`
          : `Traffic diversion ACTIVATED: ${route.name} (${route.from} → ${route.to})`,
        type: activeDiversion === divId ? 'info' : 'warning',
        timestamp: new Date().toISOString(),
      }
      setAlerts((prev) => [newAlert, ...prev])
    }
  }

  function getCongestionBadge(id: string) {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    if (hash % 3 === 0) return { label: 'HIGH', color: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-500' }
    if (hash % 3 === 1) return { label: 'MEDIUM', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' }
    return { label: 'LOW', color: 'bg-green-500/15 text-green-400 border-green-500/30', dot: 'bg-green-500' }
  }

  const openIncidents = incidents.filter((i) => i.status !== 'resolved').length
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length

  const severityConfig: Record<Incident['severity'], { badge: string; border: string }> = {
    low: { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30', border: 'border-l-blue-400' },
    medium: { badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', border: 'border-l-orange-400' },
    high: { badge: 'bg-red-500/15 text-red-400 border-red-500/30', border: 'border-l-red-400' },
    critical: { badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30', border: 'border-l-purple-500' },
  }

  const modeConfig: Record<ScheduledSignal['mode'], string> = {
    'green-wave': 'bg-green-500/15 text-green-400 border-green-500/30',
    'emergency': 'bg-red-500/15 text-red-400 border-red-500/30',
    'peak-hour': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    'night-mode': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }

  const alertConfig = {
    info:    { bar: 'border-l-blue-400 bg-blue-500/5',   icon: <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> },
    warning: { bar: 'border-l-orange-400 bg-orange-500/5', icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /> },
    error:   { bar: 'border-l-red-400 bg-red-500/5',     icon: <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /> },
  }

  const logTypeStyle: Record<LogEntry['type'], string> = {
    ai:        'bg-purple-50 text-purple-700 border-purple-200',
    manual:    'bg-blue-50 text-blue-700 border-blue-200',
    vip:       'bg-yellow-50 text-yellow-700 border-yellow-200',
    emergency: 'bg-red-50 text-red-700 border-red-200',
    system:    'bg-gray-50 text-gray-700 border-gray-200',
  }


  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      {(emergencyMode || allRedMode || emergencyType) && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border ${
          allRedMode
            ? 'bg-red-500/15 border-red-500/40 text-red-300'
            : 'bg-orange-500/15 border-orange-500/40 text-orange-300'
        }`}>
          <Siren className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div>
            <span className="font-bold mr-2">
              {allRedMode
                ? 'ALL-RED EMERGENCY MODE ACTIVE'
                : emergencyType
                ? `${emergencyType.toUpperCase()} CORRIDOR ACTIVE`
                : 'EMERGENCY GREEN CORRIDOR ACTIVE'}
            </span>
            <span className="text-sm opacity-80">
              {allRedMode
                ? 'All traffic signals across network set to RED. Emergency clearance in progress.'
                : emergencyType
                ? `${emergencyType} corridor activated. Signals on route: GREEN | Cross traffic: RED`
                : `Emergency vehicle corridor activated at ${selectedIntersection?.name}. Signals cleared.`}
            </span>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">Live</span>
            </div>
            <div className="text-2xl font-bold text-white">{intersections.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Signals Monitored</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              {criticalIncidents > 0 && (
                <span className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded-full">Critical</span>
              )}
            </div>
            <div className="text-2xl font-bold text-white">{openIncidents}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active Incidents</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <Brain className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-2xl font-bold text-white">94.2%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">AI Accuracy</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <Car className="w-4 h-4 text-blue-400 mb-1" />
            <div className="text-2xl font-bold text-white">
              {intersections.reduce((acc, i) => {
                const hash = i.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                return acc + Math.floor((hash * 7) % 100) + 20
              }, 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Vehicles Tracked</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <TrendingDown className="w-4 h-4 text-green-400 mb-1" />
            <div className="text-2xl font-bold text-white">-18%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Congestion Reduction</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900 border border-slate-800 p-1 gap-1 flex-wrap h-auto">
          {[
            { value: 'command',   label: 'Traffic Command', Icon: TrafficCone },
            { value: 'vip',       label: 'VIP Movement',    Icon: Crown },
            { value: 'emergency', label: 'Emergency Mgmt',  Icon: Siren },
            { value: 'analytics', label: 'Analytics',       Icon: BarChart2 },
            { value: 'logs',      label: 'System Logs',     Icon: ScrollText },
          ].map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-400 text-slate-500 flex items-center gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TRAFFIC COMMAND TAB ─────────────────────────────────────────── */}
        <TabsContent value="command" className="space-y-6 mt-4">
          {/* Global Traffic Mode */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Global Traffic Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSignalModeChange('ai')}
                  className={`flex flex-col items-center justify-center gap-2 py-7 rounded-xl border text-sm font-bold transition-all ${
                    signalMode === 'ai'
                      ? 'bg-purple-600/25 border-purple-500/60 text-purple-200 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Brain className={`w-9 h-9 ${signalMode === 'ai' ? 'text-purple-400' : 'text-slate-600'}`} />
                  {signalMode === 'ai' ? 'AI MODE ACTIVE' : 'AI MODE'}
                  <span className={`text-xs font-normal ${signalMode === 'ai' ? 'text-purple-300/80' : 'text-slate-600'}`}>
                    {signalMode === 'ai' ? 'Automated Signal Control' : 'Click to activate'}
                  </span>
                </button>
                <button
                  onClick={() => handleSignalModeChange('manual')}
                  className={`flex flex-col items-center justify-center gap-2 py-7 rounded-xl border text-sm font-bold transition-all ${
                    signalMode === 'manual'
                      ? 'bg-orange-600/25 border-orange-500/60 text-orange-200 shadow-lg shadow-orange-500/10'
                      : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Settings2 className={`w-9 h-9 ${signalMode === 'manual' ? 'text-orange-400' : 'text-slate-600'}`} />
                  MANUAL MODE
                  <span className={`text-xs font-normal ${signalMode === 'manual' ? 'text-orange-300/80' : 'text-slate-600'}`}>
                    {signalMode === 'manual' ? 'Direct Control' : 'Click to activate'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Intersection Selector + Signal Control */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Select Intersection
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-72 overflow-y-auto space-y-1.5">
                {intersections.map((intersection) => {
                  const badge = getCongestionBadge(intersection.id)
                  const isSelected = selectedIntersection?.id === intersection.id
                  return (
                    <button
                      key={intersection.id}
                      onClick={() => setSelectedIntersection(intersection)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-slate-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate pr-2">{intersection.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${badge.color}`}>{badge.label}</span>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  Signal Control — {selectedIntersection?.name || 'No intersection selected'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {signalMode === 'ai' && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-medium">
                      <Brain className="w-3.5 h-3.5" />
                      AI Adaptive Control Active
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      The AI system is continuously optimizing signal timings based on real-time vehicle density,
                      queue length predictions, and historical traffic patterns. No manual intervention required.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { label: 'Cycle Efficiency', value: '87%', positive: true },
                        { label: 'Queue Reduction', value: '23%', positive: true },
                        { label: 'Avg Wait Time', value: '42s', positive: false },
                        { label: 'Throughput', value: '+18%', positive: true },
                      ].map(({ label, value, positive }) => (
                        <div key={label} className="bg-slate-800/60 rounded-lg p-2.5 text-center border border-slate-700">
                          <div className={`text-sm font-bold ${positive ? 'text-green-400' : 'text-blue-400'}`}>{value}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {signalMode === 'manual' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-orange-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Manual mode active. AI control suspended. Use with caution.
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Set Signal State</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { color: 'red' as ManualSignal, bg: 'bg-red-500/20 border-red-500/50 text-red-300', active: 'bg-red-500 border-red-500 text-white', dot: 'bg-red-400', label: 'RED' },
                          { color: 'yellow' as ManualSignal, bg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300', active: 'bg-yellow-500 border-yellow-500 text-black', dot: 'bg-yellow-400', label: 'YELLOW' },
                          { color: 'green' as ManualSignal, bg: 'bg-green-500/20 border-green-500/50 text-green-300', active: 'bg-green-500 border-green-500 text-white', dot: 'bg-green-400', label: 'GREEN' },
                        ].map(({ color, bg, active, dot, label }) => (
                          <button
                            key={color}
                            onClick={() => handleManualSignalUpdate(color)}
                            className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-bold transition-all ${
                              manualSignal === color ? active : bg
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full ${manualSignal === color ? 'bg-white/30' : dot} shadow-lg`} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-400 font-medium mb-3">Emergency Controls</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleEmergencyToggle}
                      disabled={emergencyLoading}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
                        emergencyMode
                          ? 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-green-300 hover:border-green-500/40'
                      }`}
                    >
                      <Siren className={`w-4 h-4 flex-shrink-0 ${emergencyMode ? 'animate-pulse' : ''}`} />
                      <div className="text-left">
                        <div>{emergencyMode ? 'Deactivate' : 'Activate'} Green Corridor</div>
                        <div className="text-[10px] opacity-70 font-normal">Emergency vehicle passage</div>
                      </div>
                    </button>
                    <button
                      onClick={handleAllRed}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
                        allRedMode
                          ? 'bg-red-500/25 border-red-500/60 text-red-300'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-red-300 hover:border-red-500/40'
                      }`}
                    >
                      <Shield className={`w-4 h-4 flex-shrink-0 ${allRedMode ? 'text-red-400' : ''}`} />
                      <div className="text-left">
                        <div>{allRedMode ? 'Cancel' : 'Activate'} All-Red Mode</div>
                        <div className="text-[10px] opacity-70 font-normal">Network-wide emergency stop</div>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Incidents + Schedules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Active Incidents
                  </span>
                  <span className="text-xs font-medium text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                    {openIncidents} open
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className={`p-3 rounded-lg bg-slate-800/60 border-l-2 border border-slate-700/50 ${severityConfig[inc.severity].border}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-200">{inc.type}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${severityConfig[inc.severity].badge}`}>
                            {inc.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                          {inc.location}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 flex-shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {timeAgo(inc.reportedAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">{inc.description}</p>
                    {inc.status !== 'resolved' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleIncidentStatusChange(inc.id, 'in-progress')}
                          className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                            inc.status === 'in-progress'
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                              : 'text-slate-500 border-slate-700 hover:text-orange-400 hover:border-orange-500/40'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleIncidentStatusChange(inc.id, 'resolved')}
                          className="text-[10px] px-2 py-1 rounded border text-slate-500 border-slate-700 hover:text-green-400 hover:border-green-500/40 transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Scheduled Signal Programs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 rounded-xl border transition-all ${
                      schedule.active ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${modeConfig[schedule.mode]}`}>
                        {schedule.mode.replace('-', ' ').toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleToggleSchedule(schedule.id)}
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                          schedule.active ? 'bg-cyan-600' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                          schedule.active ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-slate-200 truncate">{schedule.intersectionName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{schedule.time}</span>
                      <span>{schedule.duration} min</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Traffic Diversion */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-400" />
                Traffic Diversion System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-4">
                Redirect traffic away from congested routes. Citizens will automatically receive updated routing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIVERSION_ROUTES.map((route) => {
                  const isActive = activeDiversion === route.id
                  return (
                    <div
                      key={route.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isActive ? 'bg-blue-500/15 border-blue-500/40' : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${isActive ? 'text-blue-300' : 'text-slate-200'}`}>{route.name}</span>
                        {isActive && (
                          <span className="text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Activity className="w-2.5 h-2.5" />Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">{route.from} → {route.to}</p>
                      <button
                        onClick={() => handleDiversion(route.id)}
                        className={`w-full text-xs py-1.5 rounded-lg border transition-all font-medium ${
                          isActive
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30'
                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-blue-300 hover:border-blue-500/40'
                        }`}
                      >
                        {isActive ? 'Cancel Diversion' : 'Activate Diversion'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── VIP MOVEMENT TAB ────────────────────────────────────────────── */}
        <TabsContent value="vip" className="space-y-6 mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  VIP Corridor Management
                </span>
                {vipActive ? (
                  <span className="flex items-center gap-1.5 text-[11px] bg-green-500/15 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    CORRIDOR ACTIVE
                  </span>
                ) : (
                  <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-500 px-2.5 py-1 rounded-full">
                    INACTIVE
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-slate-400">
                Create a green corridor for VIP movement. AI will synchronize signals sequentially along the route,
                temporarily diverting cross-traffic.
              </p>

              {!vipActive ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">From Location</label>
                    <input
                      value={vipFrom}
                      onChange={(e) => setVipFrom(e.target.value)}
                      placeholder="Enter origin (city / intersection name)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">To Location</label>
                    <input
                      value={vipTo}
                      onChange={(e) => setVipTo(e.target.value)}
                      placeholder="Enter destination (city / intersection name)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                  <button
                    onClick={handleActivateVIP}
                    disabled={!vipFrom || !vipTo}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-sm font-semibold hover:bg-yellow-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Crown className="w-4 h-4" />
                    Activate VIP Corridor
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm font-semibold">
                      <Navigation className="w-4 h-4" />
                      {vipFrom} <ArrowRight className="w-3.5 h-3.5" /> {vipTo}
                    </div>
                    <div className="space-y-1.5">
                      {vipCorridorRoute.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {idx <= vipProgressStep ? (
                            <CheckCheck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                          )}
                          <span className={idx <= vipProgressStep ? 'text-green-400 font-medium' : 'text-slate-500'}>
                            {point}
                          </span>
                          {idx === vipProgressStep && (
                            <span className="text-[10px] bg-green-500/15 border border-green-500/30 text-green-400 px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">
                              GREEN
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-yellow-500/20">
                      Signals synchronized: {vipCorridorRoute.length} intersections set to GREEN
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                    <span className="font-semibold">Citizen Alert Preview:</span>{' '}
                    VIP movement active. Some routes may be diverted.
                  </div>

                  {vipActivatedAt && (
                    <p className="text-[11px] text-slate-500">
                      Activated at: {fmtTime(vipActivatedAt)}
                    </p>
                  )}

                  <button
                    onClick={handleDeactivateVIP}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium hover:text-slate-200 hover:bg-slate-700 transition-all"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Deactivate Corridor
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EMERGENCY MANAGEMENT TAB ────────────────────────────────────── */}
        <TabsContent value="emergency" className="space-y-6 mt-4">
          {/* 3 Emergency Type Buttons */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Siren className="w-4 h-4 text-red-400" />
                Emergency Vehicle Routing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-slate-400">
                Activate a priority corridor for emergency vehicles. Signals on the route will turn GREEN;
                cross traffic will be halted immediately.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { type: 'ambulance' as const, label: 'Ambulance Corridor', Icon: Ambulance, bg: 'bg-red-500/20 border-red-500/50 text-red-300',    active: 'bg-red-600/40 border-red-500 text-red-200' },
                  { type: 'fire'      as const, label: 'Fire Brigade Route', Icon: Flame,     bg: 'bg-orange-500/20 border-orange-500/50 text-orange-300', active: 'bg-orange-600/40 border-orange-500 text-orange-200' },
                  { type: 'police'    as const, label: 'Police Emergency',   Icon: Shield,    bg: 'bg-blue-500/20 border-blue-500/50 text-blue-300',   active: 'bg-blue-600/40 border-blue-500 text-blue-200' },
                ]).map(({ type, label, Icon, bg, active }) => (
                  <button
                    key={type}
                    onClick={() => handleActivateEmergencyType(type)}
                    className={`flex flex-col items-center gap-3 py-7 rounded-xl border text-sm font-semibold transition-all ${emergencyType === type ? active : bg}`}
                  >
                    <Icon className={`w-8 h-8 ${emergencyType === type ? 'animate-pulse' : ''}`} />
                    {label}
                    {emergencyType === type && (
                      <span className="text-[10px] font-normal opacity-80">Click to deactivate</span>
                    )}
                  </button>
                ))}
              </div>

              {emergencyType && (
                <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <Siren className="w-4 h-4 animate-pulse" />
                    EMERGENCY CORRIDOR ACTIVE — {emergencyType.toUpperCase()}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Simulated route: Hazratganj Chauraha → Lalbagh Junction → Kaiserbagh Intersection
                  </p>
                  <div className="flex flex-wrap gap-3 text-[11px]">
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-semibold">
                      Signals on route: GREEN
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-semibold">
                      Cross traffic: RED
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                    <span className="font-semibold">Citizen Alert:</span>{' '}
                    Emergency vehicle on route. Please yield and clear the way immediately.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All-Red Mode + Ambulance Routing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  All-Red Emergency Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[11px] text-slate-400">
                  Set all intersections across the network to RED simultaneously. Use for mass emergency
                  clearance or critical incidents requiring a full network stop.
                </p>
                <button
                  onClick={handleAllRed}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border text-sm font-bold transition-all ${
                    allRedMode
                      ? 'bg-red-600/30 border-red-500/60 text-red-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-red-300 hover:border-red-500/40'
                  }`}
                >
                  <Shield className={`w-5 h-5 ${allRedMode ? 'text-red-400 animate-pulse' : ''}`} />
                  {allRedMode ? 'CANCEL ALL-RED MODE' : 'ACTIVATE ALL-RED MODE'}
                </button>
                {allRedMode && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                    All {intersections.length} intersections currently set to RED. Network in emergency lockdown.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ambulance Priority Routing */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-red-400" />
                  Ambulance Priority Routing
                  {ambulanceActive && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      ACTIVE
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!ambulanceActive ? (
                  <>
                    <select
                      value={ambulanceRoute}
                      onChange={(e) => setAmbulanceRoute(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500/50"
                    >
                      <option value="">Select route…</option>
                      <option value="Gomti Nagar → King George Medical University">Gomti Nagar → KGMU</option>
                      <option value="Charbagh → Balrampur Hospital">Charbagh → Balrampur Hospital</option>
                      <option value="Alambagh → Ram Manohar Lohia Hospital">Alambagh → RML Hospital</option>
                      <option value="Indira Nagar → Civil Hospital">Indira Nagar → Civil Hospital</option>
                    </select>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      All signals along the route will turn GREEN and cross-traffic will be halted immediately.
                    </div>
                    <button
                      onClick={handleActivateAmbulance}
                      disabled={!ambulanceRoute}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-medium hover:bg-red-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Siren className="w-3.5 h-3.5" />
                      Activate Emergency Priority
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 text-red-300 text-xs font-semibold mb-2">
                        <Ambulance className="w-3.5 h-3.5" />
                        {ambulanceRoute}
                      </div>
                      <div className="space-y-1.5">
                        {ambulanceCorridorRoute.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {idx < ambulanceProgressStep ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            ) : idx === ambulanceProgressStep ? (
                              <Ambulance className="w-3.5 h-3.5 text-red-400 flex-shrink-0 animate-pulse" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                            )}
                            <span className={
                              idx < ambulanceProgressStep
                                ? 'text-slate-500 line-through'
                                : idx === ambulanceProgressStep
                                ? 'text-red-400 font-medium'
                                : 'text-slate-400'
                            }>{point}</span>
                            {idx === ambulanceProgressStep && (
                              <span className="text-[10px] bg-green-500/15 border border-green-500/30 text-green-400 px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">CLEAR</span>
                            )}
                            {idx > ambulanceProgressStep && (
                              <span className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">STOP</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleDeactivateAmbulance}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium hover:text-slate-200 hover:bg-slate-700 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Clear Emergency Route
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ANALYTICS TAB ───────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { Icon: Car,       iconCls: 'text-blue-400',   value: '45,230',  label: 'Total Vehicles Today',    sub: '+12% vs yesterday' },
              { Icon: Clock,     iconCls: 'text-orange-400', value: '2.3 min', label: 'Average Wait Time',       sub: '-8% vs yesterday' },
              { Icon: Zap,       iconCls: 'text-green-400',  value: '87%',     label: 'Signal Efficiency',       sub: '+3% this week' },
              { Icon: Ambulance, iconCls: 'text-red-400',    value: '4.2 min', label: 'Emergency Response Time', sub: '-0.5 min avg' },
            ].map(({ Icon, iconCls, value, label, sub }) => (
              <Card key={label} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-4 pb-3">
                  <Icon className={`w-5 h-5 ${iconCls} mb-2`} />
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
                  <div className="text-[10px] text-green-400 mt-1">{sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedIntersection && (
            <>
              <TrafficAnalytics intersection={selectedIntersection} />
              <AIRecommendations intersection={selectedIntersection} />
              <TrafficPrediction intersection={selectedIntersection} />
              <IntersectionMonitoring intersection={selectedIntersection} />
            </>
          )}
        </TabsContent>

        {/* ── SYSTEM LOGS TAB ─────────────────────────────────────────────── */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-cyan-400" />
                  Event Log — Control Actions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // TODO: In production, generate a CSV/PDF report of control actions
                      setExportNotice(true)
                      setTimeout(() => setExportNotice(false), 3000)
                    }}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <FileDown className="w-3 h-3" />
                    Export
                  </button>
                  <button
                    onClick={() => setSystemLogs([])}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exportNotice && (
                <div className="mb-3 flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  Export ready — in production this would download a CSV/PDF report of all {systemLogs.length} log entries.
                </div>
              )}
              {systemLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No log entries. Actions will be recorded here.
                </p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {systemLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${logTypeStyle[log.type]}`}
                    >
                      <span className="font-mono font-semibold flex-shrink-0 opacity-70">
                        {fmtTime(log.timestamp)}
                      </span>
                      <span className="flex-1">{log.message}</span>
                      <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                        log.severity === 'critical'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : log.severity === 'warning'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Live System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-60 overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-lg border-l-2 border border-slate-800 ${alertConfig[alert.type].bar}`}
                >
                  <div className="flex items-start gap-2">
                    {alertConfig[alert.type].icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{timeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
