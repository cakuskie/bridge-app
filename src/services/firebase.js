import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyACIFSFiOUjxFpvHCCEhOvXNUkhqoD5oHE",
  authDomain: "bridge-verified.firebaseapp.com",
  projectId: "bridge-verified",
  storageBucket: "bridge-verified.firebasestorage.app",
  messagingSenderId: "461438301148",
  appId: "1:461438301148:web:7860aba630a67265e9d519"
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)

export async function registerUser(type, formData) {
  const { email, password, name, ...rest } = formData
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  const collectionName = type === 'contractor' ? 'contractors' : 'homeowners'
  await setDoc(doc(db, collectionName, cred.user.uid), {
    ...rest, name, email,
    uid: cred.user.uid, type,
    signedUpAt: serverTimestamp(),
    status: type === 'contractor' ? 'pending_verification' : 'active',
  })
  return cred.user
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logoutUser() {
  await signOut(auth)
}

export async function getUserProfile(uid) {
  for (const col of ['homeowners', 'contractors']) {
    const snap = await getDoc(doc(db, col, uid))
    if (snap.exists()) return { ...snap.data(), _collection: col }
  }
  return null
}

export async function saveSignup(type, formData) {
  const collectionName = type === 'contractor' ? 'contractors' : 'homeowners'
  await addDoc(collection(db, collectionName), {
    ...formData,
    signedUpAt: serverTimestamp(),
    status: type === 'contractor' ? 'pending_verification' : 'active',
  })
}
