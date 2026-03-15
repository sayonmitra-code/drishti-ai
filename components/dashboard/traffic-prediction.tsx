'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Activity, Zap } from 'lucide-react'

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

  const signalColorMap: Record<string, string> = {
    GREEN: 'text-green-400',
    YELLOW: 'text-yellow-400',
    RED: 'text-red-400',
  }

  const signalBgMap: Record<string, string> = {
    GREEN: 'bg-green-500/10 border-green-500/30',
    YELLOW: 'bg-yellow-500/10 border-yellow-500/30',
    RED: 'bg-red-500/10 border-red-500/30',
  }

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl" id="predictions">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          AI Traffic Prediction — {intersection.name}
          <span className="ml-auto text-[10px] text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            AI Forecast
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" />
                  Current Hour
                </div>
                <div className="text-2xl font-bold text-cyan-300">
                  {currentData?.congestion || 0}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Congestion Level</div>
              </div>
              <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Next Hour
                </div>
                <div className="text-2xl font-bold text-orange-300">
                  {nextHour?.congestion || 0}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Predicted Congestion</div>
              </div>
              <div className={`p-3.5 rounded-xl border ${signalBgMap[nextHour?.signalStatus || 'RED'] || 'bg-slate-800/60 border-slate-700'}`}>
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Predicted Signal</div>
                <div className={`text-2xl font-bold ${signalColorMap[nextHour?.signalStatus || 'RED'] || 'text-red-400'}`}>
                  {nextHour?.signalStatus || 'RED'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Next hour status</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">24-Hour Forecast</h4>
              <div className="space-y-1.5">
                {trafficData.map((data) => {
                  const isNow = data.hour === currentHour
                  const isPeak = (data.hour >= 8 && data.hour <= 10) || (data.hour >= 17 && data.hour <= 21)
                  return (
                    <div key={data.hour} className="flex items-center gap-3">
                      <span className={`text-[11px] w-12 flex-shrink-0 font-mono ${isNow ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                        {String(data.hour).padStart(2, '0')}:00{isNow ? ' ◀' : ''}
                      </span>
                      {isPeak && (
                        <span className="text-[9px] text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1 py-0.5 rounded w-10 text-center flex-shrink-0">
                          PEAK
                        </span>
                      )}
                      {!isPeak && <span className="w-10 flex-shrink-0" />}
                      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${data.congestion}%`,
                            background:
                              data.congestion < 33
                                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                : data.congestion < 66
                                ? 'linear-gradient(90deg, #f97316, #ea580c)'
                                : 'linear-gradient(90deg, #ef4444, #dc2626)',
                          }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold w-10 text-right font-mono flex-shrink-0 ${
                        data.congestion < 33 ? 'text-green-400' : data.congestion < 66 ? 'text-orange-400' : 'text-red-400'
                      }`}>
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
