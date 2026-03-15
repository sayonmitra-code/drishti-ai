'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

export default function IntersectionMonitoring({ intersection }: { intersection: Intersection }) {
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
    const interval = setInterval(fetchData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [intersection.id])

  const handleSignalChange = async (signalId: string, newStatus: string) => {
    try {
      await fetch('/api/signals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal_id: signalId,
          status: newStatus,
        }),
      })

      setSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status: newStatus } : s))
      )
    } catch (error) {
      console.error('Error updating signal:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'yellow':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'green':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Signal Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-white/60 text-center py-8">Loading signals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{signal.signal_name}</h4>
                    <p className="text-white/60 text-sm">
                      Vehicles: {vehicleCounts[signal.id] || 0}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold uppercase ${getStatusColor(
                      signal.status
                    )}`}
                  >
                    {signal.status.charAt(0)}
                  </div>
                </div>

                <div className="flex gap-2">
                  {['red', 'yellow', 'green'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleSignalChange(signal.id, status)}
                      className={`flex-1 py-2 px-2 rounded text-xs font-semibold transition ${
                        signal.status === status
                          ? 'opacity-100 scale-105'
                          : 'opacity-60 hover:opacity-80'
                      } ${getStatusColor(status)}`}
                    >
                      {status.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/50 text-xs">
                    Timing: {signal.timing_seconds}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
