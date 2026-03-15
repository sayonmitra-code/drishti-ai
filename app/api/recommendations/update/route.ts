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
        { error: 'Forbidden: Only admins can update recommendations' },
        { status: 403 }
      )
    }

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
