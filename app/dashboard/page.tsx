import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

export default async function DashboardPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-100">
          Smart City{' '}
          <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Traffic Command Center
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          AI-powered traffic control &amp; management — Lucknow, Uttar Pradesh
        </p>
      </div>
      <AdminDashboard intersections={MOCK_INTERSECTIONS} userId="official" />
    </div>
  )
}
