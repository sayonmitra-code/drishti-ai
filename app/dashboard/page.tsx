import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import CitizenDashboard from '@/components/dashboard/citizen-dashboard'

export default async function DashboardPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-100">
          Citizen{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Navigation Dashboard
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time routing &amp; traffic intelligence — Lucknow, Uttar Pradesh
        </p>
      </div>
      <CitizenDashboard intersections={MOCK_INTERSECTIONS} userId="demo-user" />
    </div>
  )
}
