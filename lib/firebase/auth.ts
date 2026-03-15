import type { User } from 'firebase/auth'

/**
 * Check if the given Firebase user has admin privileges.
 * Looks up the Firestore `admins` collection by UID and by email.
 * Returns true if a matching document is found.
 */
export async function checkAdminStatus(uid: string, email: string | null): Promise<boolean> {
  try {
    const [{ doc, getDoc }, { getFirebaseDb }] = await Promise.all([
      import('firebase/firestore'),
      import('./config'),
    ])
    const db = getFirebaseDb()

    // Check by UID (recommended — document ID = user UID)
    const byUid = await getDoc(doc(db, 'admins', uid))
    if (byUid.exists()) return true

    // Fallback: check by email (document ID = lowercased email)
    if (email) {
      const byEmail = await getDoc(doc(db, 'admins', email.toLowerCase()))
      if (byEmail.exists()) return true
    }

    return false
  } catch (err) {
    // Firestore may be unavailable (no config, network error, permission denied, etc.).
    // Fall back to the static email list check performed by the caller.
    console.error('[checkAdminStatus] Firestore lookup failed:', err)
    return false
  }
}

export async function signInWithEmail(email: string, password: string) {
  const [{ signInWithEmailAndPassword }, { getFirebaseAuth }] = await Promise.all([
    import('firebase/auth'),
    import('./config'),
  ])
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const [{ createUserWithEmailAndPassword, updateProfile }, { getFirebaseAuth }] = await Promise.all([
    import('firebase/auth'),
    import('./config'),
  ])
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential
}

export async function signInWithGoogle() {
  const [{ signInWithPopup, GoogleAuthProvider }, { getFirebaseAuth }] = await Promise.all([
    import('firebase/auth'),
    import('./config'),
  ])
  const provider = new GoogleAuthProvider()
  return signInWithPopup(getFirebaseAuth(), provider)
}

export async function logOut() {
  const [{ signOut }, { getFirebaseAuth }] = await Promise.all([
    import('firebase/auth'),
    import('./config'),
  ])
  return signOut(getFirebaseAuth())
}

export type { User }
