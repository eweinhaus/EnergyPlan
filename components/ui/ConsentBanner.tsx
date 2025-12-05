'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface ConsentBannerProps {
  onConsent: (consent: ConsentState) => void;
}

export interface ConsentState {
  necessary: boolean; // Always true for essential functionality
  analytics: boolean;
  dataProcessing: boolean;
  marketing: boolean;
}

const CONSENT_STORAGE_KEY = 'gdpr-consent';
const CONSENT_VERSION = '1.0';

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onConsent }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true, // Essential for the service to work
    analytics: false,
    dataProcessing: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed.consent);
          onConsent(parsed.consent);
          return;
        }
      } catch (error) {
        // Invalid stored consent, show banner
      }
    }

    // Show banner if no valid consent found
    setShowBanner(true);
  }, [onConsent]);

  const saveConsent = (newConsent: ConsentState) => {
    const consentData = {
      consent: newConsent,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    setConsent(newConsent);
    onConsent(newConsent);
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allConsent: ConsentState = {
      necessary: true,
      analytics: true,
      dataProcessing: true,
      marketing: true,
    };
    saveConsent(allConsent);
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly: ConsentState = {
      necessary: true,
      analytics: false,
      dataProcessing: false,
      marketing: false,
    };
    saveConsent(necessaryOnly);
  };

  const saveCustomConsent = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out">
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Privacy Choices</h2>
          <p className="text-xs text-gray-600 mt-1">
            Please review and accept our data processing practices to continue
          </p>
        </div>

        <div className="p-4 space-y-3">
          {/* Main Consent Message */}
          <div className="space-y-3">
            <p className="text-gray-700 text-sm">
              We use cookies and process your data to provide our energy plan recommendation service.
              Essential functionality requires processing your energy usage data.
              You can choose which additional uses you consent to.
            </p>

            {!showDetails && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Essential Data Processing</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Analytics (Optional)</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Marketing (Optional)</span>
              </div>
            )}
          </div>

          {/* Detailed Consent Options */}
          {showDetails && (
            <div className="border-t border-gray-200 pt-3 space-y-3">
              <div className="grid gap-3">
                {/* Essential Cookies */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={consent.necessary}
                      disabled
                      className="mr-2 w-3 h-3"
                    />
                    <h4 className="font-medium text-gray-900 text-sm">Essential Data Processing</h4>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Required</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Processing your energy usage data and form information to generate personalized recommendations.
                    This is required for the service to function.
                  </p>
                </div>

                {/* Analytics */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                      className="mr-2 w-3 h-3"
                    />
                    <h4 className="font-medium text-gray-900 text-sm">Analytics</h4>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Help us improve our service by analyzing how you use our website.
                  </p>
                </div>

                {/* Data Processing for Service Improvement */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={consent.dataProcessing}
                      onChange={(e) => setConsent({...consent, dataProcessing: e.target.checked})}
                      className="mr-2 w-3 h-3"
                    />
                    <h4 className="font-medium text-gray-900 text-sm">Service Improvement</h4>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Use anonymized data to improve our recommendation algorithms.
                  </p>
                </div>

                {/* Marketing */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                      className="mr-2 w-3 h-3"
                    />
                    <h4 className="font-medium text-gray-900 text-sm">Marketing</h4>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Send you information about new features and related services.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={acceptAll} className="bg-primary-600 hover:bg-primary-700 px-6 py-2 text-sm font-semibold">
                Accept All & Continue
              </Button>
              <Button onClick={acceptNecessaryOnly} variant="outline" className="px-6 py-2 text-sm">
                Essential Only
              </Button>
              {showDetails && (
                <Button onClick={saveCustomConsent} variant="outline" className="px-6 py-2 text-sm">
                  Save Preferences
                </Button>
              )}
            </div>

            <div className="flex gap-3 justify-center text-xs">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {showDetails ? 'Hide Details' : 'Customize'}
              </button>
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center bg-gray-50 px-3 py-2 rounded">
            You can change your preferences at any time by visiting our Privacy Policy page.
          </div>
        </div>
      </div>
    </div>
  );
};
