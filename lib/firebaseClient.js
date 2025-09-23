// lib/firebaseClient.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function getFirebaseApp() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
  return getApps().length ? getApps()[0] : initializeApp(cfg);
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

// Ensure an anonymous session exists (used for local-first + sync)
export async function ensureAnonAuth() {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// Subscribe to auth changes (optional helper; not strictly required)
export function onAuth(cb) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, cb);
}

// --- Email/Password helpers ---

// If currently anonymous, this LINKS email+password to the same UID (preserves cloud data).
export async function signUpWithEmailPassword(email, password) {
  const auth = getFirebaseAuth();
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    const linked = await linkWithCredential(auth.currentUser, credential);
    return linked.user;
  }
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signInWithEmailPassword(email, password) {
  const auth = getFirebaseAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signOutCurrent() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}
