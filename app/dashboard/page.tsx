import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import CitizenDashboard from '@/components/dashboard/citizen-dashboard'

export default async function DashboardPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Citizen{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Navigation Dashboard
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time routing & traffic intelligence — Lucknow, Uttar Pradesh
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {MOCK_INTERSECTIONS.length} signals live
        </div>
      </div>
      <CitizenDashboard intersections={MOCK_INTERSECTIONS} userId="demo-user" />
    </div>
  )
}

