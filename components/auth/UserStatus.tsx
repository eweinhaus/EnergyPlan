'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { AuthModal } from './AuthModal';

export const UserStatus: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  // Check if Firebase is configured
  const hasFirebaseConfig = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  if (!hasFirebaseConfig) {
    return (
      <div className="text-xs text-gray-500 max-w-xs">
        Authentication not configured
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={handleSignUp}
          >
            Create Account
          </Button>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user.displayName || user.email}
          </p>
          <p className="text-xs text-gray-500">
            Recommendations saved
          </p>
        </div>
      </Link>

      <div className="flex space-x-2">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
