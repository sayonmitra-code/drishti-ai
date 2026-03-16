import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import CitizenDashboard from '@/components/dashboard/citizen-dashboard'
import PublicNav from '@/components/dashboard/public-nav'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              DRISHTI{' '}
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Traffic Intelligence
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Smart City Navigation &amp; Traffic Awareness — Lucknow, Uttar Pradesh
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
            <span className="hidden sm:block">{MOCK_INTERSECTIONS.length} signals monitored</span>
            <span className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full font-medium hidden sm:block">
              No Login Required
            </span>
          </div>
        </div>

        <CitizenDashboard intersections={MOCK_INTERSECTIONS} userId="citizen" />
      </main>
    </div>
  )
}
