'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';

// Dynamic imports to avoid SSR issues
let signInWithEmailAndPassword: any;
let createUserWithEmailAndPassword: any;
let firebaseSignOut: any;
let onAuthStateChanged: any;
let GoogleAuthProvider: any;
let signInWithPopup: any;
let sendPasswordResetEmail: any;

const loadFirebaseAuth = async () => {
  if (typeof window !== 'undefined') {
    const authModule = await import('firebase/auth');
    signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
    createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
    firebaseSignOut = authModule.signOut;
    onAuthStateChanged = authModule.onAuthStateChanged;
    GoogleAuthProvider = authModule.GoogleAuthProvider;
    signInWithPopup = authModule.signInWithPopup;
    sendPasswordResetEmail = authModule.sendPasswordResetEmail;
  }
};

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFirebaseAuth().then(() => {
      if (onAuthStateChanged) {
        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
          setUser(user);
          setLoading(false);
        });
        return () => unsubscribe();
      }
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    if (signInWithEmailAndPassword) {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (createUserWithEmailAndPassword) {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  };

  const signInWithGoogle = async () => {
    if (GoogleAuthProvider && signInWithPopup) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }
  };

  const signOut = async () => {
    if (firebaseSignOut) {
      await firebaseSignOut(auth);
    }
  };

  const resetPassword = async (email: string) => {
    if (sendPasswordResetEmail) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

