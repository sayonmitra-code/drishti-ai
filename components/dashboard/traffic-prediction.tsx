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
  const currentData = trafficData.find((d) => d.hour === currentHour)

  const signalColor: Record<string, string> = {
    GREEN: 'text-green-600',
    YELLOW: 'text-amber-500',
    RED: 'text-red-600',
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          📈 Traffic Prediction — {intersection.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Current Hour Congestion</div>
                <div className="text-3xl font-bold text-blue-600">
                  {currentData?.congestion || 0}%
                </div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Next Hour Prediction</div>
                <div className="text-3xl font-bold text-orange-500">
                  {nextHour?.congestion || 0}%
                </div>
              </div>
              <div className="p-4 bg-muted/50 border border-border rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Predicted Signal Status</div>
                <div className={`text-2xl font-bold ${signalColor[nextHour?.signalStatus || 'RED'] || 'text-red-600'}`}>
                  {nextHour?.signalStatus || 'RED'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">24-Hour Forecast</h4>
              <div className="space-y-1.5">
                {trafficData.map((data) => {
                  const isNow = data.hour === currentHour
                  return (
                    <div key={data.hour} className="flex items-center gap-3">
                      <span className={`text-xs w-12 flex-shrink-0 ${isNow ? 'text-cyan-600 font-bold' : 'text-muted-foreground'}`}>
                        {String(data.hour).padStart(2, '0')}:00{isNow ? ' ◀' : ''}
                      </span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${data.congestion}%`,
                            background:
                              data.congestion < 33
                                ? '#22c55e'
                                : data.congestion < 66
                                ? '#f97316'
                                : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-10 text-right text-foreground">
                        {data.congestion}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
