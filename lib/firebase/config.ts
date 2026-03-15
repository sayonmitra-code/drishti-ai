import { initializeApp, getApps, getApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function getFirebaseApp() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side')
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

export function getFirebaseAuth() {
  const { getAuth } = require('firebase/auth')
  return getAuth(getFirebaseApp())
}

export function getFirebaseDb() {
  const { getFirestore } = require('firebase/firestore')
  return getFirestore(getFirebaseApp())
}
