// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Create mock objects for SSR
const createMockAuth = () => ({
  onAuthStateChanged: () => () => {},
  signInWithEmailAndPassword: async () => { throw new Error('Firebase not initialized'); },
  createUserWithEmailAndPassword: async () => { throw new Error('Firebase not initialized'); },
  signOut: async () => { throw new Error('Firebase not initialized'); },
  sendPasswordResetEmail: async () => { throw new Error('Firebase not initialized'); },
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
  if (typeof window !== 'undefined' && !app) {
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
    }
  }
};

// Initialize on first access
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export with fallbacks for SSR
export { auth, db, app };

export default app;
