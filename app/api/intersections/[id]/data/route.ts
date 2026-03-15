import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Missing intersection ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch signals
    const { data: signals, error: signalsError } = await supabase
      .from('traffic_signals')
      .select('*')
      .eq('intersection_id', id)

    if (signalsError) throw signalsError

    // Fetch latest vehicle counts grouped by signal
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicle_counts')
      .select('*')
      .eq('intersection_id', id)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (vehicleError) throw vehicleError

    // Aggregate vehicle counts by signal
    const vehicleCounts: Record<string, number> = {}
    vehicleData?.forEach((v) => {
      if (!vehicleCounts[v.signal_id]) {
        vehicleCounts[v.signal_id] = 0
      }
      vehicleCounts[v.signal_id] += v.vehicle_count || 0
    })

    return NextResponse.json({
      signals,
      vehicleCounts,
    })
  } catch (error) {
    console.error('Intersection data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intersection data' },
      { status: 500 }
    )
  }
}
