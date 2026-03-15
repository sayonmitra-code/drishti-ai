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

interface TrafficData {
  hour: number
  congestion: number
  signalStatus: string
}

export default function TrafficPrediction({ intersection }: { intersection: Intersection }) {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch(`/api/traffic/predict?intersection_id=${intersection.id}`)
        const data = await response.json()
        setTrafficData(data.predictions || [])
      } catch (error) {
        console.error('Error fetching traffic data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrafficData()
  }, [intersection.id])

  const currentHour = new Date().getHours()
  const nextHour = trafficData.find((d) => d.hour === (currentHour + 1) % 24)

  return (
    <Card className="backdrop-blur-md bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">
          Traffic Prediction - {intersection.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-white/60 text-center py-8">Loading predictions...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-white/70 text-sm mb-1">Current Hour Congestion</div>
                <div className="text-3xl font-bold text-blue-400">
                  {trafficData.find((d) => d.hour === currentHour)?.congestion || 0}%
                </div>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="text-white/70 text-sm mb-1">Next Hour Prediction</div>
                <div className="text-3xl font-bold text-orange-400">
                  {nextHour?.congestion || 0}%
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-white/70 text-sm mb-1">Signal Status</div>
                <div className="text-2xl font-bold text-green-400">
                  {nextHour?.signalStatus || 'RED'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">24-Hour Forecast</h4>
              <div className="space-y-2">
                {trafficData.map((data) => (
                  <div key={data.hour} className="flex items-center gap-4">
                    <span className="text-white/60 text-sm w-12">
                      {String(data.hour).padStart(2, '0')}:00
                    </span>
                    <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all"
                        style={{ width: `${data.congestion}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold text-sm w-12 text-right">
                      {data.congestion}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
