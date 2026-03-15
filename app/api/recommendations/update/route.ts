import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recommendation_id, status } = body

    if (!recommendation_id || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (!['pending', 'implemented', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Use mock response when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ id: recommendation_id, status })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('ai_recommendations')
      .update({ status })
      .eq('id', recommendation_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Recommendation update error:', error)
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    )
  }
}

