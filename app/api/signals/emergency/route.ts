import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can activate emergency mode' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { intersection_id, enabled } = body

    if (!intersection_id) {
      return NextResponse.json(
        { error: 'Missing intersection_id' },
        { status: 400 }
      )
    }

    if (enabled) {
      // Activate emergency corridor - set all signals in sequence
      const { data: signals, error: signalsError } = await supabase
        .from('traffic_signals')
        .select('id')
        .eq('intersection_id', intersection_id)

      if (signalsError) throw signalsError

      // Set first signal to green, others to red
      if (signals && signals.length > 0) {
        for (let i = 0; i < signals.length; i++) {
          const status = i === 0 ? 'green' : 'red'
          await supabase
            .from('traffic_signals')
            .update({
              status,
              emergency_mode: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', signals[i].id)
        }
      }
    } else {
      // Deactivate emergency corridor - reset to red
      await supabase
        .from('traffic_signals')
        .update({
          status: 'red',
          emergency_mode: false,
          updated_at: new Date().toISOString(),
        })
        .eq('intersection_id', intersection_id)
    }

    return NextResponse.json({
      success: true,
      emergency_mode: enabled,
    })
  } catch (error) {
    console.error('Emergency corridor error:', error)
    return NextResponse.json(
      { error: 'Failed to activate emergency corridor' },
      { status: 500 }
    )
  }
}
