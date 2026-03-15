import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signal_id, status } = body

    if (!signal_id || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (!['red', 'yellow', 'green'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Use mock response when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ id: signal_id, status, updated_at: new Date().toISOString() })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('traffic_signals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', signal_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Signal update error:', error)
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    )
  }
}

