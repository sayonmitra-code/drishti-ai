'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Navigation,
  Map,
  TrafficCone,
  BarChart2,
  Brain,
  AlertTriangle,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radio,
  Activity,
  Crown,
  Siren,
  ScrollText,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logOut } from '@/lib/firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'

interface SidebarItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  exactMatch?: boolean
}

const NAV_ITEMS: SidebarItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command Center', exactMatch: true },
  { href: '/dashboard#command', icon: TrafficCone, label: 'Traffic Command' },
  { href: '/dashboard#vip', icon: Crown, label: 'VIP Movement' },
  { href: '/dashboard#emergency', icon: Siren, label: 'Emergency Mgmt' },
  { href: '/dashboard#analytics', icon: BarChart2, label: 'Traffic Analytics' },
  { href: '/dashboard#logs', icon: ScrollText, label: 'System Logs' },
]

const BOTTOM_ITEMS: SidebarItem[] = [
  { href: '/', icon: Home, label: 'Citizen View' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardSidebar({ user }: { user: FirebaseUser | null }) {
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    await logOut()
    router.push('/')
  }

  const isActive = (item: SidebarItem) => {
    if (item.exactMatch) return pathname === item.href
    return pathname === item.href.split('#')[0]
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center border-b border-slate-800 h-16 px-3 gap-3', collapsed && 'justify-center px-2')}>
        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">DRISHTI</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate">Smart Traffic Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {/* Live Status Indicator */}
        {!collapsed && (
          <div className="mt-4 mx-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">System Live</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Lucknow, Uttar Pradesh</p>
          </div>
        )}
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="System Live" />
          </div>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-slate-800" />

      {/* Bottom items */}
      <div className="py-3 px-2 space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group text-slate-400 hover:text-slate-200 hover:bg-slate-800/70',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {/* User info + Logout */}
        {user && (
          <div className={cn('mt-1 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800', collapsed && 'px-2')}>
            {!collapsed && (
              <p className="text-xs text-slate-300 truncate font-medium mb-2">
                {user.displayName || user.email}
              </p>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title={collapsed ? 'Sign out' : undefined}
              className={cn(
                'flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors w-full',
                collapsed && 'justify-center'
              )}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{loggingOut ? 'Signing out…' : 'Sign out'}</span>}
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle button */}
      <div className="px-2 pb-4">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/70 transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
