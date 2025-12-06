// Test script to verify Firebase configuration logic
const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

console.log('Firebase config check result:', hasFirebaseConfig);
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');

if (!hasFirebaseConfig) {
  console.log('✅ Auth loading should be disabled - no Firebase config');
} else {
  console.log('🔄 Auth loading should proceed - Firebase config present');
}

