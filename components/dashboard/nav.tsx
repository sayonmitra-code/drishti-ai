'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function DashboardNav({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isAdmin = user?.user_metadata?.role === 'admin'

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center glow-cyan">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold gradient-text">Drishti</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-foreground/70 hover:text-foreground transition px-3 py-2"
            >
              {isAdmin ? 'Admin' : 'Citizen'} Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="text-foreground/70 hover:text-foreground transition px-3 py-2"
              >
                Monitoring
              </Link>
            )}
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <span className="text-foreground/70 text-sm truncate">
                {user?.email}
              </span>
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-foreground"
              >
                {loading ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
