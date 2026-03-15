import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

export default async function AdminPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Control Center
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Traffic signal management & AI control — Lucknow, Uttar Pradesh
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Admin Session
        </div>
      </div>
      <AdminDashboard intersections={MOCK_INTERSECTIONS} userId="demo-admin" />
    </div>
  )
}

