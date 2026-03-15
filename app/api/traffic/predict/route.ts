import { NextRequest, NextResponse } from 'next/server'
import { getMockPredictions } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const intersectionId = searchParams.get('intersection_id') || 'int-001'

    // Use mock predictions when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ predictions: getMockPredictions(intersectionId) })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: analyticsData, error: analyticsError } = await supabase
      .from('traffic_analytics')
      .select('*')
      .eq('intersection_id', intersectionId)
      .order('hour_of_day', { ascending: true })

    if (analyticsError) throw analyticsError

    const currentHour = new Date().getHours()

    const predictions = Array.from({ length: 24 }, (_, i) => {
      const hour = (currentHour + i) % 24
      const analyticsPoint = analyticsData?.find((a: { hour_of_day: number }) => a.hour_of_day === hour)

      const congestion = analyticsPoint?.average_vehicles
        ? Math.min(Math.round((analyticsPoint.average_vehicles / 500) * 100), 100)
        : Math.round(Math.random() * 100)

      const signalStatus = congestion < 33 ? 'GREEN' : congestion < 66 ? 'YELLOW' : 'RED'

      return { hour, congestion, signalStatus }
    })

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Traffic prediction error:', error)
    const intersectionId = new URL(request.url).searchParams.get('intersection_id') || 'int-001'
    return NextResponse.json({ predictions: getMockPredictions(intersectionId) })
  }
}

