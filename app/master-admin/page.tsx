'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle, logOut } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/firebase/auth-context'
import { MOCK_INTERSECTIONS } from '@/lib/mock-data'
import AdminDashboard from '@/components/dashboard/admin-dashboard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Pre-approved admin email addresses
// To add more admins, set NEXT_PUBLIC_ADMIN_EMAILS as a comma-separated list in your environment.
// Example: NEXT_PUBLIC_ADMIN_EMAILS="admin@city.gov,traffic.control@city.gov"
const DEFAULT_ADMIN_EMAILS: string[] = [
  'admin@city.gov',
  'traffic.control@city.gov',
]

const ADMIN_EMAILS: string[] = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  : DEFAULT_ADMIN_EMAILS

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export default function MasterAdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Redirect non-admin logged-in users back to home
  useEffect(() => {
    if (!loading && user && !isAdminEmail(user.email)) {
      const timer = setTimeout(() => router.push('/'), 3000)
      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google'
      setError(msg.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    await logOut()
    setLogoutLoading(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  // Logged in but not an admin email
  if (user && !isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Your account (<strong>{user.email}</strong>) is not authorized to access the Admin Control Panel.
            </p>
            <p className="text-muted-foreground text-xs mt-2">Redirecting you to the home page…</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleLogout} disabled={logoutLoading}>
              {logoutLoading ? 'Signing out…' : 'Sign out'}
            </Button>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in — show Google sign-in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="border border-border rounded-2xl p-8 shadow-lg bg-card">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4 shadow-md shadow-cyan-500/20">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
              <p className="text-muted-foreground text-sm mt-1">DRISHTI Traffic Control Center</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground text-center">
              <svg className="w-5 h-5 mx-auto mb-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Restricted access. Only authorized government traffic officials may sign in.
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              variant="outline"
              className="w-full font-semibold py-3 h-auto"
            >
              <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? 'Signing in…' : 'Sign in with Google'}
            </Button>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Citizen Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated admin — show admin dashboard
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">D</span>
              </div>
              <div>
                <p className="text-base font-bold text-foreground leading-tight">DRISHTI</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Admin Control Center</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Admin Access
              </span>
              <span className="hidden md:block text-sm text-muted-foreground">
                {user.displayName || user.email}
              </span>
              <Button
                onClick={handleLogout}
                disabled={logoutLoading}
                variant="outline"
                size="sm"
              >
                {logoutLoading ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard intersections={MOCK_INTERSECTIONS} userId={user.uid} />
      </main>
    </div>
  )
}
