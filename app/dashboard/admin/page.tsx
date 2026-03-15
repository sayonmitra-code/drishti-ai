import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

export default async function AdminPage() {
  return <AdminDashboard intersections={MOCK_INTERSECTIONS} userId="demo-admin" />
}

