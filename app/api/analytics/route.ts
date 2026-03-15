import { NextRequest, NextResponse } from 'next/server'
import { getMockAnalytics } from '@/lib/mock-data'

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

    // Use mock data when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const analytics = getMockAnalytics(intersectionId)
      return NextResponse.json({ analytics })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: analytics, error } = await supabase
      .from('traffic_analytics')
      .select('*')
      .eq('intersection_id', intersectionId)
      .order('hour_of_day', { ascending: true })

    if (error) throw error

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    const { getMockAnalytics } = await import('@/lib/mock-data')
    const intersectionId = new URL(request.url).searchParams.get('intersection_id') || 'int-001'
    return NextResponse.json({ analytics: getMockAnalytics(intersectionId) })
  }
}

