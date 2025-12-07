// Check if Firebase environment variables are configured
const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Firebase configuration (only if all variables are set)
const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} : null;

// Create mock objects for SSR
const createMockAuth = () => ({
  onAuthStateChanged: () => () => {},
  signInWithEmailAndPassword: async () => { throw new Error('Firebase authentication not configured'); },
  createUserWithEmailAndPassword: async () => { throw new Error('Firebase authentication not configured'); },
  signOut: async () => { throw new Error('Firebase authentication not configured'); },
  sendPasswordResetEmail: async () => { throw new Error('Firebase authentication not configured'); },
});

const createMockDb = () => ({
  collection: () => ({ doc: () => ({ set: async () => {}, get: async () => ({ exists: () => false, data: () => ({}) }) }) }),
  doc: () => ({ set: async () => {}, get: async () => ({ exists: () => false, data: () => ({}) }) }),
});

// Initialize Firebase (client-side only with dynamic imports)
let app: any = null;
let auth: any = createMockAuth();
let db: any = createMockDb();

const initializeFirebase = async () => {
  if (typeof window !== 'undefined' && !app && hasFirebaseConfig && firebaseConfig) {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth, connectAuthEmulator } = await import('firebase/auth');
      const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');

      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);

      // Connect to emulators in development
      if (process.env.NODE_ENV === 'development') {
        try {
          connectAuthEmulator(auth, "http://localhost:9099");
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log('Connected to Firebase emulators');
        } catch (error) {
          console.log('Failed to connect to emulators:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      // Keep mock objects if initialization fails
    }
  } else if (!hasFirebaseConfig) {
    console.warn('Firebase not configured - authentication disabled');
  }
};

// Initialize on first access
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export with fallbacks for SSR
export { auth, db, app };

export default app;
