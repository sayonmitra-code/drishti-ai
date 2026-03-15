'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Car, Activity } from 'lucide-react'

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
  timing_seconds: number
}

export default function IntersectionMonitoring({
  intersection,
  aiMode = false,
}: {
  intersection: Intersection
  aiMode?: boolean
}) {
  const [signals, setSignals] = useState<SignalData[]>([])
  const [vehicleCounts, setVehicleCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/intersections/${intersection.id}/data`)
        const data = await response.json()
        setSignals(data.signals || [])
        setVehicleCounts(data.vehicleCounts || {})
      } catch (error) {
        console.error('Error fetching intersection data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, aiMode ? 5000 : 10000)
    return () => clearInterval(interval)
  }, [intersection.id, aiMode])

  const handleSignalChange = async (signalId: string, newStatus: string) => {
    if (aiMode) return
    try {
      await fetch('/api/signals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_id: signalId, status: newStatus }),
      })
      setSignals((prev) => prev.map((s) => (s.id === signalId ? { ...s, status: newStatus } : s)))
    } catch (error) {
      console.error('Error updating signal:', error)
    }
  }

  const statusStyle: Record<string, { bg: string; border: string; text: string; dot: string; btn: string }> = {
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-500',
      btn: 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      dot: 'bg-yellow-500',
      btn: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25',
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      dot: 'bg-green-500',
      btn: 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25',
    },
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Signal Monitoring — {intersection.name}
          </span>
          {aiMode && (
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Brain className="w-2.5 h-2.5" />
              AI Controlled
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {signals.map((signal) => {
              const style = statusStyle[signal.status] || statusStyle.red
              const count = vehicleCounts[signal.id] || 0
              const aiRec = count > 40 ? '+15s green' : count < 15 ? '-10s red' : 'Optimal'
              return (
                <div
                  key={signal.id}
                  className={`p-4 rounded-xl border ${style.bg} ${style.border} space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{signal.signal_name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Car className="w-2.5 h-2.5" />
                        {count} vehicles queued
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${style.dot} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-xs font-bold uppercase">
                        {signal.status.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${style.text}`}>
                      {signal.status.toUpperCase()} — {signal.timing_seconds}s
                    </span>
                    <span className="text-slate-500 text-[11px] italic">
                      AI: {aiRec}
                    </span>
                  </div>

                  {!aiMode && (
                    <div className="flex gap-1.5">
                      {['red', 'yellow', 'green'].map((s) => {
                        const ss = statusStyle[s]
                        return (
                          <button
                            key={s}
                            onClick={() => handleSignalChange(signal.id, s)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${ss.btn} ${signal.status === s ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-500/50 opacity-100' : 'opacity-60 hover:opacity-90'}`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {aiMode && (
                    <div className="text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 flex items-center gap-2">
                      <Brain className="w-3 h-3 flex-shrink-0" />
                      AI recommendation: {aiRec} — auto-applying
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
