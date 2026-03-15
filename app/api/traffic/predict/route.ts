import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const intersectionId = searchParams.get('intersection_id')

    if (!intersectionId) {
      return NextResponse.json(
        { error: 'Missing intersection_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch analytics data for predictions
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('traffic_analytics')
      .select('*')
      .eq('intersection_id', intersectionId)
      .order('hour_of_day', { ascending: true })

    if (analyticsError) throw analyticsError

    // Generate predictions for next 24 hours
    const now = new Date()
    const currentHour = now.getHours()

    const predictions = []
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24
      const analyticsPoint = analyticsData?.find((a) => a.hour_of_day === hour)

      const congestion = analyticsPoint?.average_vehicles
        ? Math.min(Math.round((analyticsPoint.average_vehicles / 500) * 100), 100)
        : Math.round(Math.random() * 100)

      let signalStatus = 'RED'
      if (congestion < 33) {
        signalStatus = 'GREEN'
      } else if (congestion < 66) {
        signalStatus = 'YELLOW'
      }

      predictions.push({
        hour,
        congestion,
        signalStatus,
      })
    }

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Traffic prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to predict traffic' },
      { status: 500 }
    )
  }
}
