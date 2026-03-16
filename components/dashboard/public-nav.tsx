import Link from 'next/link'

export default function PublicNav() {
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
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Monitoring
            </span>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
