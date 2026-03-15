'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setup = async () => {
      try {
        const [{ onAuthStateChanged }, { getFirebaseAuth }] = await Promise.all([
          import('firebase/auth'),
          import('./config'),
        ])
        const auth = getFirebaseAuth()
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser)
          setLoading(false)
        })
      } catch {
        setLoading(false)
      }
    }

    setup()

    return () => unsubscribe?.()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
