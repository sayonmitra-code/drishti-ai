import { createClient } from '@/lib/supabase/server'

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getIntersections() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('intersections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getIntersectionDetails(intersectionId: string) {
  const supabase = await createClient()

  const { data: intersection, error: intersectionError } = await supabase
    .from('intersections')
    .select('*')
    .eq('id', intersectionId)
    .single()

  if (intersectionError) throw intersectionError

  const { data: signals, error: signalsError } = await supabase
    .from('traffic_signals')
    .select('*')
    .eq('intersection_id', intersectionId)

  if (signalsError) throw signalsError

  const { data: vehicleCounts, error: vehicleError } = await supabase
    .from('vehicle_counts')
    .select('*')
    .eq('intersection_id', intersectionId)
    .order('timestamp', { ascending: false })
    .limit(100)

  if (vehicleError) throw vehicleError

  return { intersection, signals, vehicleCounts }
}

export async function getAIRecommendations(intersectionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('intersection_id', intersectionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getTrafficAnalytics(intersectionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('traffic_analytics')
    .select('*')
    .eq('intersection_id', intersectionId)
    .order('hour_of_day', { ascending: true })

  if (error) throw error
  return data
}

export async function updateSignalStatus(signalId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('traffic_signals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', signalId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEmergencyMode(intersectionId: string, enabled: boolean) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('traffic_signals')
    .update({ emergency_mode: enabled, updated_at: new Date().toISOString() })
    .eq('intersection_id', intersectionId)
    .select()

  if (error) throw error
  return data
}

export async function updateRecommendationStatus(recommendationId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_recommendations')
    .update({ status })
    .eq('id', recommendationId)
    .select()
    .single()

  if (error) throw error
  return data
}
