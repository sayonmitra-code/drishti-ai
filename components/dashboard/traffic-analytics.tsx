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
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-bold text-blue-600 mb-1">{avgVehicles}</div>
            <div className="text-sm text-muted-foreground">Avg. Daily Vehicles</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-bold text-orange-500 mb-1">{peakHours}</div>
            <div className="text-sm text-muted-foreground">Peak Hours/Day</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-bold text-red-500 mb-1">
              {Math.round((peakHours / 24) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Congestion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {loading ? (
        <Card className="shadow-sm border border-border">
          <CardContent className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Hourly Traffic Volume — {intersection.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="vehicles"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    name="Vehicles/hr"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Peak Congestion Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="peak" fill="#f97316" radius={[4, 4, 0, 0]} name="Peak vehicles" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
