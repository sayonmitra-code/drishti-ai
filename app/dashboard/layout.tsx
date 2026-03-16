'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase/auth-context'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  // Show spinner while auth resolves or while redirecting
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading DRISHTI…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <DashboardSidebar user={user} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="text-sm font-bold text-white">DRISHTI</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950 h-16 px-4 flex-shrink-0">
          <a href="/dashboard" className="flex flex-col items-center gap-0.5 text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] font-medium">Home</span>
          </a>
          <a href="/dashboard#navigation" className="flex flex-col items-center gap-0.5 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" /></svg>
            <span className="text-[10px]">Navigate</span>
          </a>
          <a href="/dashboard#map" className="flex flex-col items-center gap-0.5 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" /></svg>
            <span className="text-[10px]">Traffic</span>
          </a>
          <a href="/dashboard/profile" className="flex flex-col items-center gap-0.5 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px]">Profile</span>
          </a>
        </div>
      </main>
    </div>
  )
}


