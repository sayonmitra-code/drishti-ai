'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logOut } from '@/lib/firebase/auth'
import type { User } from 'firebase/auth'
import { Button } from '@/components/ui/button'

export default function DashboardNav({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isAdmin = user?.email?.includes('admin')

  const handleLogout = async () => {
    setLoading(true)
    await logOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
              <span className="text-white font-bold text-base">D</span>
            </div>
            <div>
              <p className="text-base font-bold text-foreground leading-tight">DRISHTI</p>
              <p className="text-[10px] text-muted-foreground leading-tight">AI Smart Traffic Intelligence</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
            >
              {isAdmin ? 'Admin' : 'Citizen'} Dashboard
            </Link>
            {user && (
              <Link
                href="/dashboard/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
              >
                Control Center
              </Link>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px] hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                  <Button
                    onClick={handleLogout}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {loading ? 'Signing out…' : 'Sign out'}
                  </Button>
                </>
              ) : (
                <Link href="/master-admin">
                  <Button variant="outline" size="sm" className="text-sm">
                    Admin Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

