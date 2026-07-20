import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:1234567890abcdef",
};

/**
 * Returns true only when real Firebase credentials are present.
 * A config is considered fake if any of the critical fields contains
 * a placeholder value or an obviously invalid pattern.
 */
export function isFirebaseConfigured(): boolean {
  const { apiKey, authDomain, projectId } = firebaseConfig;
  if (!apiKey || apiKey === "dummy-api-key" || apiKey.startsWith("your_") || apiKey === "your_api_key_here") return false;
  if (!authDomain || authDomain === "dummy-auth-domain" || authDomain.startsWith("your_") || authDomain.includes("dummy")) return false;
  if (!projectId || projectId === "dummy-project-id" || projectId.startsWith("your_") || projectId.includes("dummy")) return false;
  return true;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Provide typed stubs so imports never throw at module load time
  app = null as unknown as FirebaseApp;
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
  storage = null as unknown as FirebaseStorage;
}

export { app, auth, db, storage };
