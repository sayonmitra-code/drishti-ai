'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart2, Car, TrendingUp } from 'lucide-react'

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

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 8,
    fontSize: 11,
    color: '#e2e8f0',
  }

  return (
    <div className="space-y-5" id="analytics">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <Car className="w-4 h-4 text-cyan-400 mb-1" />
            <div className="text-2xl font-bold text-cyan-300">{avgVehicles}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg. Daily Vehicles</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <TrendingUp className="w-4 h-4 text-orange-400 mb-1" />
            <div className="text-2xl font-bold text-orange-300">{peakHours}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Peak Hours / Day</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-3">
            <BarChart2 className="w-4 h-4 text-red-400 mb-1" />
            <div className="text-2xl font-bold text-red-300">
              {Math.round((peakHours / 24) * 100)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Congestion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {loading ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200">
                Hourly Traffic Volume — {intersection.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} interval={3} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line
                    type="monotone"
                    dataKey="vehicles"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    name="Vehicles/hr"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200">
                Peak Congestion Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} interval={3} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={tooltipStyle} />
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
