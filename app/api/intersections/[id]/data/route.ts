import { NextRequest, NextResponse } from 'next/server'
import { getMockSignals, getMockVehicleCounts } from '@/lib/mock-data'

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

    // Use mock data when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        signals: getMockSignals(id),
        vehicleCounts: getMockVehicleCounts(id),
      })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: signals, error: signalsError } = await supabase
      .from('traffic_signals')
      .select('*')
      .eq('intersection_id', id)

    if (signalsError) throw signalsError

    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicle_counts')
      .select('*')
      .eq('intersection_id', id)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (vehicleError) throw vehicleError

    const vehicleCounts: Record<string, number> = {}
    vehicleData?.forEach((v: { signal_id: string; vehicle_count: number }) => {
      if (!vehicleCounts[v.signal_id]) {
        vehicleCounts[v.signal_id] = 0
      }
      vehicleCounts[v.signal_id] += v.vehicle_count || 0
    })

    return NextResponse.json({ signals, vehicleCounts })
  } catch (error) {
    console.error('Intersection data error:', error)
    const { id } = await params
    return NextResponse.json({
      signals: getMockSignals(id || 'int-001'),
      vehicleCounts: getMockVehicleCounts(id || 'int-001'),
    })
  }
}

