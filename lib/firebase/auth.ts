import type { User } from 'firebase/auth'

/**
 * Check whether any master admin account has been created.
 * Queries the Firestore `admins` collection for any document.
 * Returns true if at least one admin exists, false otherwise (including on error).
 */
export async function checkMasterAdminExists(): Promise<boolean> {
  try {
    const [{ collection, query, getDocs, limit }, { getFirebaseDb }] = await Promise.all([
      import('firebase/firestore'),
      import('./config'),
    ])
    const db = getFirebaseDb()
    const q = query(collection(db, 'admins'), limit(1))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch {
    // Firestore may be unavailable or rules may deny access.
    // Return false so the setup wizard is shown.
    return false
  }
}

/**
 * Create the master admin account.
 * 1. Creates a Firebase Auth user with email + password.
 * 2. Updates the display name.
 * 3. Writes an admin document to Firestore `admins/{uid}`.
 */
export async function createMasterAdmin(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase()

  const [
    { createUserWithEmailAndPassword, updateProfile },
    { getFirebaseAuth },
  ] = await Promise.all([import('firebase/auth'), import('./config')])

  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
  await updateProfile(credential.user, { displayName })

  // Persist admin record in Firestore (best-effort — skip gracefully if Firestore is unavailable)
  try {
    const [{ doc, setDoc, serverTimestamp }, { getFirebaseDb }] = await Promise.all([
      import('firebase/firestore'),
      import('./config'),
    ])
    await setDoc(doc(getFirebaseDb(), 'admins', credential.user.uid), {
      email: normalizedEmail,
      displayName,
      role: 'master_admin',
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('[createMasterAdmin] Failed to write Firestore admin document:', err)
  }

  return credential.user
}

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
