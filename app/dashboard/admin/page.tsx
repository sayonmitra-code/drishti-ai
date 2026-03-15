import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

export default async function AdminPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-100">
          Traffic{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Control Center
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Signal management &amp; AI control — Lucknow, Uttar Pradesh
        </p>
      </div>
      <AdminDashboard intersections={MOCK_INTERSECTIONS} userId="demo-admin" />
    </div>
  )
}
