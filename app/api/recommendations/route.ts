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

    const { data: recommendations, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('intersection_id', intersectionId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Recommendations fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
