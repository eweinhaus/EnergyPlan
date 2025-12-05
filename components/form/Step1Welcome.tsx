'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Step1WelcomeProps {
  onNext: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({
  onNext,
}) => {
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (privacyConsent && dataProcessingConsent) {
      onNext();
    }
  };

  return (
    <Card>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔋 Find Your Perfect Energy Plan - UPDATED
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Upload your Green Button XML usage data and get personalized recommendations
          for the best fixed-rate energy plans in Texas.
        </p>

        <div className="bg-primary-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works:</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              <span>Enter your current plan details</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              <span>Upload your Green Button XML file</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              <span>Set your preferences (cost vs renewable energy)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              <span>Get your top 3 personalized recommendations</span>
            </li>
          </ul>
        </div>

        {/* Privacy Consent Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data Processing Consent</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy-consent" className="text-sm text-gray-700">
                I have read and agree to the{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Privacy Policy
                </a>
                {' '}and understand how my data will be processed.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="data-processing-consent"
                checked={dataProcessingConsent}
                onChange={(e) => setDataProcessingConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="data-processing-consent" className="text-sm text-gray-700">
                I consent to the processing of my energy usage data from my Green Button XML file
                for the purpose of generating personalized energy plan recommendations.
              </label>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Data Processing Notice:</strong> Your energy usage data will be processed in memory
              on our servers and automatically deleted after generating your recommendations.
              We do not store your personal energy data permanently.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!privacyConsent || !dataProcessingConsent}
          size="lg"
          className="w-full sm:w-auto"
        >
          Get Started
        </Button>
      </div>
    </Card>
  );
};

