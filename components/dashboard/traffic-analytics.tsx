'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Intersection {
  id: string
  name: string
}

interface AnalyticsData {
  hour: number
  average_vehicles: number
  peak_congestion: boolean
}

export default function TrafficAnalytics({ intersection }: { intersection: Intersection }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?intersection_id=${intersection.id}`)
        const data = await response.json()
        setAnalyticsData(data.analytics || [])
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [intersection.id])

  const chartData = analyticsData.map((d) => ({
    hour: `${String(d.hour).padStart(2, '0')}:00`,
    vehicles: d.average_vehicles,
    peak: d.peak_congestion ? d.average_vehicles : 0,
  }))

  const peakHours = analyticsData.filter((d) => d.peak_congestion).length
  const avgVehicles = Math.round(
    analyticsData.reduce((sum, d) => sum + d.average_vehicles, 0) / (analyticsData.length || 1)
  )

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-md bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{avgVehicles}</div>
              <div className="text-white/70 text-sm">Avg. Daily Vehicles</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">{peakHours}</div>
              <div className="text-white/70 text-sm">Peak Hours</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {Math.round((peakHours / 24) * 100)}%
              </div>
              <div className="text-white/70 text-sm">Congestion Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {loading ? (
        <Card className="backdrop-blur-md bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="text-white/60 text-center py-12">Loading analytics...</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="backdrop-blur-md bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Hourly Traffic Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="vehicles"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Peak Congestion Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="peak" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
