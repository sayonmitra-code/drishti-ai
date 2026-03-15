import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { intersection_id, enabled } = body

    if (!intersection_id) {
      return NextResponse.json(
        { error: 'Missing intersection_id' },
        { status: 400 }
      )
    }

    // Use mock response when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ success: true, emergency_mode: enabled })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (enabled) {
      const { data: signals, error: signalsError } = await supabase
        .from('traffic_signals')
        .select('id')
        .eq('intersection_id', intersection_id)

      if (signalsError) throw signalsError

      if (signals && signals.length > 0) {
        for (let i = 0; i < signals.length; i++) {
          const status = i === 0 ? 'green' : 'red'
          await supabase
            .from('traffic_signals')
            .update({ status, emergency_mode: true, updated_at: new Date().toISOString() })
            .eq('id', signals[i].id)
        }
      }
    } else {
      await supabase
        .from('traffic_signals')
        .update({ status: 'red', emergency_mode: false, updated_at: new Date().toISOString() })
        .eq('intersection_id', intersection_id)
    }

    return NextResponse.json({ success: true, emergency_mode: enabled })
  } catch (error) {
    console.error('Emergency corridor error:', error)
    return NextResponse.json(
      { error: 'Failed to activate emergency corridor' },
      { status: 500 }
    )
  }
}

