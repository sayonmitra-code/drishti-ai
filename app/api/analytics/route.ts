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

    const { data: analytics, error } = await supabase
      .from('traffic_analytics')
      .select('*')
      .eq('intersection_id', intersectionId)
      .order('hour_of_day', { ascending: true })

    if (error) throw error

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
