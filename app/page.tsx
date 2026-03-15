import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import CitizenDashboard from '@/components/dashboard/citizen-dashboard'
import PublicNav from '@/components/dashboard/public-nav'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CitizenDashboard intersections={MOCK_INTERSECTIONS} userId="citizen" />
      </main>
    </div>
  )
}
