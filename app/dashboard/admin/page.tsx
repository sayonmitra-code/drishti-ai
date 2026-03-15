import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getIntersections } from '@/lib/db'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const intersections = await getIntersections()

  return <AdminDashboard intersections={intersections} userId={user.id} />
}
