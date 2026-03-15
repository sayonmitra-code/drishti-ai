'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Account Created!</h1>
          <p className="text-white/70 mb-2">
            Please check your email to confirm your account.
          </p>
          <p className="text-white/50 text-sm mb-8">
            Once you confirm, you'll be able to access the Drishti platform.
          </p>

          <Link href="/auth/login" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
