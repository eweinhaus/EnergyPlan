'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { updateUserProfile } from '@/lib/firestore';
import { GDPRConsent } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface ConsentManagerProps {
  onConsentChange?: (consent: GDPRConsent) => void;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({ onConsentChange }) => {
  const { user } = useAuth();
  const [consent, setConsent] = useState<GDPRConsent>({
    analytics: false,
    marketing: false,
    dataProcessing: true, // Required for core functionality
    dataStorage: false,
    lastUpdated: new Date(),
    version: '1.0',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current consent settings
  const loadUserConsent = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // This would typically come from the user profile
      // For now, we'll use default values
      // In a real implementation, you'd fetch this from Firestore
    } catch (error) {
      console.error('Error loading consent:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserConsent();
    }
  }, [user, loadUserConsent]);

  const handleConsentChange = (key: keyof GDPRConsent, value: boolean) => {
    if (key === 'dataProcessing') return; // Cannot disable core functionality

    setConsent(prev => ({
      ...prev,
      [key]: value,
      lastUpdated: new Date(),
    }));
  };

  const saveConsent = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to update consent settings.' });
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        gdprConsent: consent,
      });

      setMessage({ type: 'success', text: 'Your privacy settings have been updated successfully.' });

      // Notify parent component
      onConsentChange?.(consent);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error saving consent:', error);
      setMessage({ type: 'error', text: 'Failed to update privacy settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Consent Settings</h3>
          <p className="text-gray-600 text-sm">
            Control how your data is used and processed. You can update these settings at any time.
          </p>
        </div>

        {message && (
          <Alert variant={message.type === 'success' ? 'success' : 'error'}>
            {message.text}
          </Alert>
        )}

        <div className="space-y-4">
          {/* Required Data Processing */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              checked={consent.dataProcessing}
              disabled={true}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">
                Data Processing (Required)
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Processing your energy usage data to provide recommendations. This is required for the core functionality of the service.
              </p>
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) => handleConsentChange('analytics', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">
                Analytics & Performance Monitoring
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Help us improve the service by collecting anonymous usage statistics and performance data.
              </p>
            </div>
          </div>

          {/* Marketing */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) => handleConsentChange('marketing', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">
                Marketing Communications
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Receive updates about new features, energy market insights, and promotional offers.
              </p>
            </div>
          </div>

          {/* Data Storage */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={consent.dataStorage}
              onChange={(e) => handleConsentChange('dataStorage', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">
                Extended Data Storage
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Store your data for longer than 2 years for historical analysis and personalized insights.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-gray-500">
            Last updated: {consent.lastUpdated.toLocaleDateString()}
          </div>
          <Button
            onClick={saveConsent}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>
            <strong>GDPR Rights:</strong> You have the right to access, rectify, erase, and export your personal data.
            Contact us at privacy@arbor.energy for assistance.
          </p>
        </div>
      </div>
    </Card>
  );
};

