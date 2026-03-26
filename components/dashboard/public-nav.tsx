import Link from 'next/link'

export default function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
              <span className="text-white font-bold text-base">D</span>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-tight">DRISHTI</p>
              <p className="text-[10px] text-gray-500 leading-tight">AI Smart Traffic Intelligence</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Monitoring
            </span>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              Official Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1.5 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all shadow-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
