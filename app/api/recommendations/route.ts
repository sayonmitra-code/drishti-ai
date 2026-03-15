import { NextRequest, NextResponse } from 'next/server'
import { getMockRecommendations } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const intersectionId = searchParams.get('intersection_id') || 'int-001'

    // Use mock data when Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ recommendations: getMockRecommendations(intersectionId) })
    }

    const { createClient } = await import('@/lib/supabase/server')
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
    const intersectionId = new URL(request.url).searchParams.get('intersection_id') || 'int-001'
    return NextResponse.json({ recommendations: getMockRecommendations(intersectionId) })
  }
}

