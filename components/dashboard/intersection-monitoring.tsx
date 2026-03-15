'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    if (aiMode) return // In AI mode, signals are auto-managed
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

  const statusStyle: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Signal Monitoring — {intersection.name}</span>
          {aiMode && (
            <span className="text-xs bg-cyan-100 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full font-medium">
              🤖 AI Controlled
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
                      <h4 className="text-sm font-semibold text-foreground">{signal.signal_name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">🚗 {count} vehicles queued</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${style.dot} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold uppercase">
                        {signal.status.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${style.text}`}>
                      {signal.status.toUpperCase()} — {signal.timing_seconds}s
                    </span>
                    <span className="text-muted-foreground italic">AI: {aiRec}</span>
                  </div>

                  {!aiMode && (
                    <div className="flex gap-1.5">
                      {['red', 'yellow', 'green'].map((s) => {
                        const ss = statusStyle[s]
                        return (
                          <button
                            key={s}
                            onClick={() => handleSignalChange(signal.id, s)}
                            className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${ss.bg} ${ss.border} ${ss.text} ${signal.status === s ? 'ring-2 ring-offset-1 ring-cyan-400 opacity-100' : 'opacity-60 hover:opacity-90'}`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {aiMode && (
                    <div className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-lg p-2">
                      🤖 AI recommendation: {aiRec} — auto-applying
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
