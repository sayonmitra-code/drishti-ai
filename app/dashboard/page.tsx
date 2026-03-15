import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import CitizenDashboard from '@/components/dashboard/citizen-dashboard'

export default async function DashboardPage() {
  return <CitizenDashboard intersections={MOCK_INTERSECTIONS} userId="demo-user" />
}

