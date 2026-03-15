import { createClient } from '@/lib/supabase/server'
import { getIntersections } from '@/lib/db'
import CitizenDashboard from '@/components/dashboard/citizen-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const intersections = await getIntersections()

  return <CitizenDashboard intersections={intersections} userId={user.id} />
}
