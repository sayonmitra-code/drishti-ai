import type { User } from 'firebase/auth'

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
